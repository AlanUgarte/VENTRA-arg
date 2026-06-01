import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { SubStatus } from '@prisma/client';

const PLAN_PRICE: Record<string, number> = {
  TRIAL: 0,
  BASIC: 15_000,
  PRO: 30_000,
  ENTERPRISE: 75_000,
};

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  // ── Overview stats ─────────────────────────────────────────────────────────

  async getStats() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalTenants,
      newThisMonth,
      newLastMonth,
      subsByStatus,
      subsByPlan,
      totalSales,
      totalUsers,
    ] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.tenant.count({ where: { createdAt: { gte: monthStart } } }),
      this.prisma.tenant.count({
        where: { createdAt: { gte: prevMonthStart, lt: monthStart } },
      }),
      this.prisma.subscription.groupBy({ by: ['status'], _count: true }),
      this.prisma.subscription.groupBy({ by: ['plan', 'status'], _count: true }),
      this.prisma.sale.count(),
      this.prisma.user.count({ where: { isSuperAdmin: false } }),
    ]);

    const byStatus = Object.fromEntries(
      subsByStatus.map((s) => [s.status, s._count]),
    );

    const activeSubs = byStatus['ACTIVE'] ?? 0;
    const trialSubs = byStatus['TRIAL'] ?? 0;
    const cancelledSubs = byStatus['CANCELLED'] ?? 0;
    const pastDueSubs = byStatus['PAST_DUE'] ?? 0;

    // MRR = sum of active subscription plan prices
    const mrr = subsByPlan
      .filter((s) => s.status === 'ACTIVE')
      .reduce((sum, s) => sum + (PLAN_PRICE[s.plan] ?? 0) * s._count, 0);

    // Plan distribution (all statuses)
    const planDistribution = subsByPlan.map((s) => ({
      plan: s.plan,
      status: s.status,
      count: s._count,
      revenue: (PLAN_PRICE[s.plan] ?? 0) * s._count,
    }));

    // Growth %
    const growthPct =
      newLastMonth > 0
        ? Math.round(((newThisMonth - newLastMonth) / newLastMonth) * 100)
        : newThisMonth > 0
        ? 100
        : 0;

    return {
      totalTenants,
      activeSubs,
      trialSubs,
      cancelledSubs,
      pastDueSubs,
      newThisMonth,
      growthPct,
      mrr,
      totalSales,
      totalUsers,
      planDistribution,
    };
  }

  // ── Tenant list ────────────────────────────────────────────────────────────

  async getTenants(
    search?: string,
    status?: SubStatus,
    page = 1,
    pageSize = 20,
  ) {
    const where: any = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { users: { some: { email: { contains: search, mode: 'insensitive' } } } },
        ],
      }),
      ...(status && { subscription: { status } }),
    };

    const [total, tenants] = await Promise.all([
      this.prisma.tenant.count({ where }),
      this.prisma.tenant.findMany({
        where,
        include: {
          subscription: true,
          _count: { select: { users: true, sales: true, products: true, customers: true } },
          users: {
            where: { role: 'OWNER' },
            select: { name: true, email: true },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return { total, page, pageSize, data: tenants };
  }

  // ── Tenant detail ──────────────────────────────────────────────────────────

  async getTenantDetail(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        subscription: true,
        users: { select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true } },
        _count: { select: { sales: true, products: true, customers: true, suppliers: true } },
      },
    });
    if (!tenant) throw new NotFoundException('Tenant no encontrado');

    // Sales stats
    const salesStats = await this.prisma.sale.aggregate({
      where: { tenantId: id },
      _count: true,
      _sum: { total: true },
    });

    // Last activity
    const lastSale = await this.prisma.sale.findFirst({
      where: { tenantId: id },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    return {
      ...tenant,
      salesStats: {
        count: salesStats._count,
        totalRevenue: Number(salesStats._sum.total ?? 0),
      },
      lastActivity: lastSale?.createdAt ?? null,
    };
  }

  // ── Suspend / Activate / Cancel ────────────────────────────────────────────

  async setTenantStatus(
    id: string,
    status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'TRIAL',
    plan?: 'BASIC' | 'PRO' | 'ENTERPRISE' | 'TRIAL',
    reason?: string,
  ) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant no encontrado');

    await this.prisma.subscription.update({
      where: { tenantId: id },
      data: {
        status,
        ...(plan && { plan }),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId: id,
        entity: 'Subscription',
        entityId: id,
        action: 'UPDATE',
        after: { status, plan, reason, updatedBy: 'superadmin' },
      },
    });

    return { id, newStatus: status };
  }

  // ── Block all users of a tenant ────────────────────────────────────────────

  async blockTenantUsers(tenantId: string, block: boolean) {
    await this.prisma.user.updateMany({
      where: { tenantId, isSuperAdmin: false },
      data: { isActive: !block },
    });
    return { tenantId, usersBlocked: block };
  }

  // ── Delete tenant ──────────────────────────────────────────────────────────

  async deleteTenant(id: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant no encontrado');
    await this.prisma.tenant.delete({ where: { id } });
    return { deleted: true };
  }

  // ── Plan stats ─────────────────────────────────────────────────────────────

  async getPlanStats() {
    const distribution = await this.prisma.subscription.groupBy({
      by: ['plan'],
      where: { status: { in: ['ACTIVE', 'TRIAL'] } },
      _count: true,
    });

    const monthlyRevenue = distribution
      .filter((d) => d.plan !== 'TRIAL')
      .map((d) => ({
        plan: d.plan,
        subscribers: d._count,
        monthlyRevenue: (PLAN_PRICE[d.plan] ?? 0) * d._count,
        pricePerUnit: PLAN_PRICE[d.plan] ?? 0,
      }))
      .sort((a, b) => b.subscribers - a.subscribers);

    const total = distribution.reduce((s, d) => s + d._count, 0);
    return { distribution: monthlyRevenue, total };
  }

  // ── Revenue over time (last 6 months) ─────────────────────────────────────

  async getRevenueTimeline() {
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return new Date(d.getFullYear(), d.getMonth(), 1);
    }).reverse();

    const result = await Promise.all(
      months.map(async (monthStart, idx) => {
        const monthEnd = idx < months.length - 1
          ? months[idx + 1]
          : new Date();

        const subs = await this.prisma.subscription.findMany({
          where: {
            status: 'ACTIVE',
            createdAt: { lte: monthEnd },
          },
          select: { plan: true },
        });

        const mrr = subs.reduce((s, sub) => s + (PLAN_PRICE[sub.plan] ?? 0), 0);
        const label = monthStart.toLocaleString('es-AR', { month: 'short', year: '2-digit' });
        return { month: label, mrr, subscribers: subs.length };
      }),
    );

    return result;
  }

  // ── Bootstrap super admin ──────────────────────────────────────────────────

  async bootstrapSuperAdmin(dto: {
    name: string;
    email: string;
    password: string;
    adminSecret: string;
  }) {
    const expectedSecret = this.config.get<string>('ADMIN_BOOTSTRAP_SECRET', '');
    if (!expectedSecret || dto.adminSecret !== expectedSecret) {
      throw new UnauthorizedException('Secreto de administrador inválido');
    }

    // Find or create a system tenant for super admins
    let systemTenant = await this.prisma.tenant.findUnique({
      where: { slug: '__system__' },
    });

    if (!systemTenant) {
      systemTenant = await this.prisma.tenant.create({
        data: {
          name: 'VENTRA ARG — Sistema',
          slug: '__system__',
          subscription: {
            create: {
              plan: 'ENTERPRISE',
              status: 'ACTIVE',
              trialEndsAt: new Date('2099-12-31'),
            },
          },
        },
      });
    }

    const existing = await this.prisma.user.findFirst({
      where: { email: dto.email.toLowerCase(), tenantId: systemTenant.id },
    });
    if (existing) throw new ConflictException('Este email ya tiene cuenta de super admin');

    const password = await bcrypt.hash(dto.password, 12);
    const admin = await this.prisma.user.create({
      data: {
        tenantId: systemTenant.id,
        name: dto.name,
        email: dto.email.toLowerCase(),
        password,
        role: 'OWNER',
        isSuperAdmin: true,
      },
      select: { id: true, name: true, email: true, isSuperAdmin: true },
    });

    return admin;
  }

  // ── Promote existing user to super admin ──────────────────────────────────

  async promoteToSuperAdmin(userId: string, adminSecret: string) {
    const expectedSecret = this.config.get<string>('ADMIN_BOOTSTRAP_SECRET', '');
    if (!expectedSecret || adminSecret !== expectedSecret) {
      throw new UnauthorizedException('Secreto inválido');
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: { isSuperAdmin: true },
      select: { id: true, name: true, email: true, isSuperAdmin: true },
    });
  }

  // ── Recent activity ────────────────────────────────────────────────────────

  async getRecentActivity() {
    const [recentTenants, recentSales] = await Promise.all([
      this.prisma.tenant.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true,
          subscription: { select: { plan: true, status: true } },
        },
      }),
      this.prisma.sale.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          orderNumber: true,
          total: true,
          type: true,
          createdAt: true,
          tenant: { select: { name: true } },
          user: { select: { name: true } },
        },
      }),
    ]);

    return { recentTenants, recentSales };
  }
}
