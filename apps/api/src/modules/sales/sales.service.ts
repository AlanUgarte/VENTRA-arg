import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { calcProductPrices, applyDiscount } from '../../common/utils/price.util';
import { Prisma, SaleType } from '@prisma/client';

const D = Prisma.Decimal;

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, from?: string, to?: string) {
    return this.prisma.sale.findMany({
      where: {
        tenantId,
        ...(from || to
          ? {
              createdAt: {
                ...(from && { gte: new Date(from) }),
                ...(to && { lte: new Date(to) }),
              },
            }
          : {}),
      },
      include: {
        lines: true,
        user: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateSaleDto, tenantId: string, userId: string) {
    if (dto.type === SaleType.CREDIT && !dto.customerId) {
      throw new BadRequestException('Un fiado requiere un cliente');
    }

    return this.prisma.$transaction(async (tx) => {
      const productIds = [...new Set(dto.lines.map((l) => l.productId))];
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, tenantId, isActive: true },
        include: { rubro: true },
      });

      if (products.length !== productIds.length) {
        throw new BadRequestException('Uno o más artículos no encontrados o inactivos');
      }

      const discountPct = dto.discountPct ?? 0;

      // Validate stock
      for (const line of dto.lines) {
        const p = products.find((x) => x.id === line.productId);
        if (p.stock < line.quantity) {
          throw new BadRequestException(`Stock insuficiente: ${p.name} (disponible: ${p.stock})`);
        }
      }

      // Build line data
      const lineData = dto.lines.map((line) => {
        const p = products.find((x) => x.id === line.productId);
        const { costoReal, precioVenta } = calcProductPrices(p);
        const priceUnit = applyDiscount(precioVenta, discountPct);
        const subtotal = priceUnit.mul(line.quantity);
        return { p, line, costoReal, precioVenta, priceUnit, subtotal };
      });

      // Totals
      const originalSubtotal = lineData.reduce(
        (s, { precioVenta, line }) => s.add(precioVenta.mul(line.quantity)),
        new D(0),
      );
      const total = lineData.reduce((s, { subtotal }) => s.add(subtotal), new D(0));
      const discountAmount = originalSubtotal.sub(total);

      // Next order number (inside transaction — race-condition safe)
      const lastSale = await tx.sale.findFirst({
        where: { tenantId },
        orderBy: { orderNumber: 'desc' },
        select: { orderNumber: true },
      });
      const orderNumber = (lastSale?.orderNumber ?? 0) + 1;

      // Validate customer belongs to tenant
      if (dto.customerId) {
        const customer = await tx.customer.findFirst({
          where: { id: dto.customerId, tenantId },
        });
        if (!customer) throw new BadRequestException('Cliente no encontrado');
      }

      const sale = await tx.sale.create({
        data: {
          tenantId,
          userId,
          customerId: dto.customerId,
          orderNumber,
          type: dto.type,
          discountPct,
          subtotal: originalSubtotal,
          discountAmount,
          total,
          lines: {
            create: lineData.map(({ p, line, costoReal, priceUnit, subtotal }) => ({
              productId: p.id,
              productName: p.name,
              rubroName: p.rubro.name,
              priceUnit,
              costUnit: costoReal,
              quantity: line.quantity,
              subtotal,
            })),
          },
        },
        include: {
          lines: true,
          user: { select: { id: true, name: true } },
          customer: { select: { id: true, name: true } },
        },
      });

      // Decrement stock
      for (const { p, line } of lineData) {
        await tx.product.update({
          where: { id: p.id },
          data: { stock: { decrement: line.quantity } },
        });
      }

      // If CREDIT → create Credit + CreditLines for live revaluation
      if (dto.type === SaleType.CREDIT) {
        await tx.credit.create({
          data: {
            tenantId,
            customerId: dto.customerId,
            saleId: sale.id,
            discountPct,
            lines: {
              create: lineData.map(({ p, line, precioVenta }) => ({
                productId: p.id,
                productName: p.name,
                priceSnap: precioVenta,
                quantity: line.quantity,
              })),
            },
          },
        });
      }

      return sale;
    });
  }

  async void(tenantId: string, id: string) {
    const sale = await this.prisma.sale.findFirst({
      where: { id, tenantId },
      include: { lines: true, credit: true },
    });
    if (!sale) throw new NotFoundException();

    return this.prisma.$transaction(async (tx) => {
      // Restore stock
      for (const line of sale.lines) {
        if (line.productId) {
          await tx.product.update({
            where: { id: line.productId },
            data: { stock: { increment: line.quantity } },
          });
        }
      }
      // Delete credit if fiado
      if (sale.credit) {
        await tx.credit.delete({ where: { id: sale.credit.id } });
      }
      return tx.sale.delete({ where: { id } });
    });
  }
}
