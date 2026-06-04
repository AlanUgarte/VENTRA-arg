import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';
import * as crypto from 'crypto';
import { PLANS, type PlanId } from './plans.config';
import { Role } from '@prisma/client';
import { EmailService } from '../email/email.service';

interface WebhookExternalRef {
  tenantId: string;
  planId: PlanId;
}

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private email: EmailService,
  ) {}

  getPlans() {
    return Object.values(PLANS);
  }

  async getSubscription(tenantId: string) {
    return this.prisma.subscription.findUnique({ where: { tenantId } });
  }

  // ── Suscripción MP ─────────────────────────────────────────────────────────

  async createPreapproval(tenantId: string, userId: string, planId: PlanId) {
    const plan = PLANS[planId];
    if (!plan) throw new BadRequestException('Plan inválido');

    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId, role: Role.OWNER },
    });
    if (!user) throw new ForbiddenException('Solo el dueño puede gestionar la suscripción');

    const accessToken = this.config.get<string>('MP_ACCESS_TOKEN');
    if (!accessToken) throw new BadRequestException('Pagos no configurados. Contactá soporte.');

    const mp = new MercadoPagoConfig({ accessToken });
    const preApprovalApi = new PreApproval(mp);

    const appUrl = this.config.get('APP_URL', 'https://ventra-arg.vercel.app');
    const backUrl = `${appUrl}/billing?status=success`;
    const externalRef: WebhookExternalRef = { tenantId, planId };

    let result: any;
    try {
      result = await preApprovalApi.create({
        body: {
          reason: `VENTRA ARG · ${plan.name}`,
          auto_recurring: {
            frequency: 1,
            frequency_type: 'months',
            transaction_amount: plan.price,
            currency_id: 'ARS',
          },
          back_url: backUrl,
          status: 'pending',
          external_reference: JSON.stringify(externalRef),
        } as any,
      });
    } catch (mpErr: any) {
      const mpMsg = mpErr?.message || JSON.stringify(mpErr);
      this.logger.error(`MP PreApproval error: ${mpMsg}`);
      throw new BadRequestException(`Error al crear la suscripción: ${mpMsg}`);
    }

    await this.prisma.subscription.update({
      where: { tenantId },
      data: {
        mpSubscriptionId: result.id,
        mpPayerId: user.email,
        plan: planId,
      },
    });

    this.logger.log(`PreApproval created: ${result.id} for tenant ${tenantId}`);
    return { initPoint: result.init_point, preapprovalId: result.id };
  }

  async cancelSubscription(tenantId: string, userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId, role: Role.OWNER },
    });
    if (!user) throw new ForbiddenException('Solo el dueño puede cancelar la suscripción');

    const sub = await this.prisma.subscription.findUnique({ where: { tenantId } });
    if (!sub?.mpSubscriptionId) throw new BadRequestException('Sin suscripción activa');

    const mp = new MercadoPagoConfig({
      accessToken: this.config.get('MP_ACCESS_TOKEN'),
    });
    const preApprovalApi = new PreApproval(mp);

    await preApprovalApi.update({
      id: sub.mpSubscriptionId,
      body: { status: 'cancelled' },
    });

    await this.prisma.subscription.update({
      where: { tenantId },
      data: { status: 'CANCELLED' },
    });

    this.logger.log(`Subscription cancelled for tenant ${tenantId}`);
    return { cancelled: true };
  }

  // ── Webhook MP ─────────────────────────────────────────────────────────────

  async handleWebhook(
    body: Record<string, any>,
    xSignature: string,
    xRequestId: string,
  ) {
    const dataId = String(body?.data?.id ?? '');

    if (!this.verifySignature(xSignature, xRequestId, dataId)) {
      this.logger.warn(`Invalid webhook signature from MP`);
      throw new UnauthorizedException('Firma inválida');
    }

    const { type } = body;
    this.logger.log(`MP webhook received: type=${type} id=${dataId}`);

    switch (type) {
      case 'subscription_preapproval':
        await this.handlePreapprovalUpdate(dataId);
        break;
      case 'payment':
        await this.handlePaymentEvent(dataId);
        break;
      default:
        this.logger.debug(`Unhandled webhook type: ${type}`);
    }

    return { received: true };
  }

  // ── Notificación de transferencia manual (fallback) ────────────────────────

  async notifyPayment(tenantId: string, userId: string, planId: PlanId) {
    const plan = PLANS[planId];
    if (!plan) throw new ForbiddenException('Plan inválido');

    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId, role: Role.OWNER },
    });
    if (!user) throw new ForbiddenException('Solo el dueño puede gestionar la suscripción');

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true },
    });

    const adminEmail = this.config.get<string>('ADMIN_EMAIL', 'ugartealan776@gmail.com');
    const adminUrl   = this.config.get<string>('APP_URL', 'https://ventra-arg.vercel.app');

    this.email.sendPaymentNotification(
      adminEmail,
      tenant?.name ?? tenantId,
      user.name,
      user.email,
      plan.name,
      plan.price,
      `${adminUrl}/admin/tenants`,
    ).catch(() => {});

    this.logger.log(`Manual payment notification for tenant ${tenantId} plan ${planId}`);
    return { notified: true };
  }

  // ── Private ────────────────────────────────────────────────────────────────

  private async handlePreapprovalUpdate(preapprovalId: string) {
    const mp = new MercadoPagoConfig({
      accessToken: this.config.get('MP_ACCESS_TOKEN'),
    });
    const preApprovalApi = new PreApproval(mp);

    let result: any;
    try {
      result = await preApprovalApi.get({ id: preapprovalId });
    } catch (e) {
      this.logger.error(`Failed to fetch preapproval ${preapprovalId}`, e);
      return;
    }

    let parsed: Partial<WebhookExternalRef> = {};
    try { parsed = JSON.parse(result.external_reference ?? '{}'); } catch {}

    const { tenantId, planId } = parsed;
    if (!tenantId || !planId) {
      this.logger.warn(`Missing external_reference in preapproval ${preapprovalId}`);
      return;
    }

    const STATUS_MAP: Record<string, string> = {
      authorized: 'ACTIVE',
      paused:     'PAST_DUE',
      cancelled:  'CANCELLED',
      pending:    'TRIAL',
    };

    const newStatus = STATUS_MAP[result.status] ?? 'PAST_DUE';
    const nextPayment = result.next_payment_date ? new Date(result.next_payment_date) : null;

    await this.prisma.subscription.update({
      where: { tenantId },
      data: {
        status: newStatus as any,
        plan: planId,
        currentPeriodEnd: nextPayment,
        mpSubscriptionId: preapprovalId,
      },
    });

    this.logger.log(`Tenant ${tenantId} → ${newStatus} (plan: ${planId})`);
  }

  private async handlePaymentEvent(paymentId: string) {
    this.logger.log(`Payment received: ${paymentId}`);
  }

  private verifySignature(xSignature: string, xRequestId: string, dataId: string): boolean {
    const secret = this.config.get<string>('MP_WEBHOOK_SECRET', '');

    if (!secret) {
      this.logger.warn('MP_WEBHOOK_SECRET not set — skipping webhook signature check');
      return true;
    }

    if (!xSignature) return false;

    try {
      const parts = Object.fromEntries(
        xSignature.split(',').map((seg) => {
          const eq = seg.indexOf('=');
          return [seg.slice(0, eq).trim(), seg.slice(eq + 1).trim()];
        }),
      );

      const { ts, v1 } = parts;
      if (!ts || !v1) return false;

      const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
      const computed = crypto.createHmac('sha256', secret).update(manifest).digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(computed, 'hex'),
        Buffer.from(v1, 'hex'),
      );
    } catch (e) {
      this.logger.error('Error verifying webhook signature', e);
      return false;
    }
  }
}
