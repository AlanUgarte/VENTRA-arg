import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReturnStatus, ReturnReason } from '@prisma/client';

@Injectable()
export class ReturnsService {
  constructor(private prisma: PrismaService) {}

  async getStats(tenantId: string) {
    const [all, credited] = await Promise.all([
      this.prisma.supplierReturn.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: true,
        _sum: { quantity: true },
      }),
      this.prisma.supplierReturn.aggregate({
        where: { tenantId, status: 'CREDITED' },
        _sum: { creditAmount: true },
      }),
    ]);

    const byStatus = Object.fromEntries(all.map(g => [g.status, g]));
    return {
      total:              all.reduce((s, g) => s + g._count, 0),
      totalUnitsReturned: all.reduce((s, g) => s + (g._sum.quantity ?? 0), 0),
      pending:    byStatus['PENDING']?._count  ?? 0,
      credited:   byStatus['CREDITED']?._count ?? 0,
      replaced:   byStatus['REPLACED']?._count ?? 0,
      rejected:   byStatus['REJECTED']?._count ?? 0,
      totalCredited: Number(credited._sum.creditAmount ?? 0),
    };
  }

  async findAll(tenantId: string, supplierId?: string, status?: string) {
    return this.prisma.supplierReturn.findMany({
      where: {
        tenantId,
        ...(supplierId ? { supplierId } : {}),
        ...(status ? { status: status as ReturnStatus } : {}),
      },
      include: {
        supplier: { select: { id: true, name: true } },
        product:  { select: { id: true, name: true } },
      },
      orderBy: { returnedAt: 'desc' },
    });
  }

  async create(tenantId: string, supplierId: string, dto: {
    productName: string;
    productId?: string;
    quantity: number;
    reason: ReturnReason;
    reasonDetail?: string;
    notes?: string;
  }) {
    const supplier = await this.prisma.supplier.findFirst({ where: { id: supplierId, tenantId } });
    if (!supplier) throw new NotFoundException('Proveedor no encontrado');

    return this.prisma.supplierReturn.create({
      data: {
        tenantId,
        supplierId,
        productName:  dto.productName,
        productId:    dto.productId ?? null,
        quantity:     dto.quantity,
        reason:       dto.reason,
        reasonDetail: dto.reasonDetail,
        notes:        dto.notes,
        status:       'PENDING',
      },
      include: {
        supplier: { select: { id: true, name: true } },
      },
    });
  }

  async update(tenantId: string, id: string, dto: {
    status?: ReturnStatus;
    creditAmount?: number;
    notes?: string;
  }) {
    const existing = await this.prisma.supplierReturn.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException();

    return this.prisma.supplierReturn.update({
      where: { id },
      data: {
        ...(dto.status ? { status: dto.status, resolvedAt: new Date() } : {}),
        ...(dto.creditAmount != null ? { creditAmount: dto.creditAmount } : {}),
        ...(dto.notes != null ? { notes: dto.notes } : {}),
      },
      include: {
        supplier: { select: { id: true, name: true } },
      },
    });
  }

  async remove(tenantId: string, id: string) {
    const existing = await this.prisma.supplierReturn.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException();
    await this.prisma.supplierReturn.delete({ where: { id } });
    return { deleted: true };
  }
}
