import {
  Injectable,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { PLANS, type PlanId } from './plans.config';
import { Role } from '@prisma/client';
import { EmailService } from '../email/email.service';

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

  // Tenant notifica que realizó la transferencia → envía email al admin
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

    this.logger.log(`Payment notification sent for tenant ${tenantId} plan ${planId}`);
    return { notified: true };
  }
}
