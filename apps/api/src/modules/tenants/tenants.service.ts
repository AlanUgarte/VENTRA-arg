import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  findOne(tenantId: string) {
    return this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        subscription: {
          select: {
            plan: true,
            status: true,
            trialEndsAt: true,
            currentPeriodEnd: true,
          },
        },
        _count: { select: { users: true, products: true, customers: true } },
      },
    });
  }

  async update(tenantId: string, dto: UpdateTenantDto) {
    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: dto,
      select: { id: true, name: true, slug: true, updatedAt: true },
    });
  }

  getPaymentMethods(tenantId: string) {
    return this.prisma.paymentMethod.findMany({
      where: { tenantId, isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  async createPaymentMethod(tenantId: string, name: string) {
    const last = await this.prisma.paymentMethod.findFirst({
      where: { tenantId },
      orderBy: { order: 'desc' },
    });
    return this.prisma.paymentMethod.create({
      data: { tenantId, name, order: (last?.order ?? 0) + 1 },
    });
  }

  deletePaymentMethod(tenantId: string, id: string) {
    return this.prisma.paymentMethod.updateMany({
      where: { id, tenantId, isDefault: false },
      data: { isActive: false },
    });
  }
}
