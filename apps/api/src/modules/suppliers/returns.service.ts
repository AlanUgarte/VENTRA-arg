import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReturnDto, UpdateReturnDto } from './dto/create-return.dto';
import { ReturnStatus } from '@prisma/client';

@Injectable()
export class ReturnsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, supplierId?: string, status?: string) {
    return this.prisma.supplierReturn.findMany({
      where: {
        tenantId,
        ...(supplierId && { supplierId }),
        ...(status && { status: status as ReturnStatus }),
      },
      include: {
        supplier: { select: { id: true, name: true } },
        product: { select: { id: true, name: true } },
      },
      orderBy: { returnedAt: 'desc' },
    });
  }

  async create(tenantId: string, supplierId: string, dto: CreateReturnDto) {
    const supplier = await this.prisma.supplier.findFirst({ where: { id: supplierId, tenantId } });
    if (!supplier) throw new NotFoundException('Proveedor no encontrado');

    return this.prisma.supplierReturn.create({
      data: {
        tenantId,
        supplierId,
        productId: dto.productId || null,
        productName: dto.productName,
        quantity: dto.quantity,
        reason: dto.reason,
        reasonDetail: dto.reasonDetail,
        notes: dto.notes,
      },
      include: { supplier: { select: { id: true, name: true } } },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateReturnDto) {
    const ret = await this.prisma.supplierReturn.findFirst({ where: { id, tenantId } });
    if (!ret) throw new NotFoundException('Devolución no encontrada');

    return this.prisma.supplierReturn.update({
      where: { id },
      data: {
        ...(dto.status && { status: dto.status as ReturnStatus }),
        ...(dto.creditAmount !== undefined && { creditAmount: dto.creditAmount }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.status && dto.status !== 'PENDING' && { resolvedAt: new Date() }),
      },
      include: { supplier: { select: { id: true, name: true } } },
    });
  }

  async remove(tenantId: string, id: string) {
    const ret = await this.prisma.supplierReturn.findFirst({ where: { id, tenantId } });
    if (!ret) throw new NotFoundException('Devolución no encontrada');
    await this.prisma.supplierReturn.delete({ where: { id } });
    return { deleted: true };
  }

  async getStats(tenantId: string) {
    const [total, pending, credited, rejected] = await Promise.all([
      this.prisma.supplierReturn.count({ where: { tenantId } }),
      this.prisma.supplierReturn.count({ where: { tenantId, status: 'PENDING' } }),
      this.prisma.supplierReturn.count({ where: { tenantId, status: 'CREDITED' } }),
      this.prisma.supplierReturn.count({ where: { tenantId, status: 'REJECTED' } }),
    ]);

    const totalUnits = await this.prisma.supplierReturn.aggregate({
      where: { tenantId },
      _sum: { quantity: true },
    });

    const creditedAmount = await this.prisma.supplierReturn.aggregate({
      where: { tenantId, status: 'CREDITED' },
      _sum: { creditAmount: true },
    });

    return {
      total,
      pending,
      credited,
      rejected,
      totalUnitsReturned: totalUnits._sum.quantity ?? 0,
      totalCredited: Number(creditedAmount._sum.creditAmount ?? 0),
    };
  }
}
