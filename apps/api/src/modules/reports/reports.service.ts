import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { calcProductPrices } from '../../common/utils/price.util';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getOverview(tenantId: string, from?: string, to?: string) {
    const dateFilter = this.buildDateFilter(from, to);

    const [sales, saleLines, customers] = await Promise.all([
      this.prisma.sale.findMany({
        where: { tenantId, ...dateFilter },
        select: { id: true, total: true, type: true },
      }),
      this.prisma.saleLine.findMany({
        where: { sale: { tenantId, ...dateFilter } },
        select: { subtotal: true, costUnit: true, quantity: true },
      }),
      this.prisma.customer.findMany({
        where: { tenantId, isActive: true },
        include: {
          credits: { include: { lines: { include: { product: true } } } },
          payments: true,
        },
      }),
    ]);

    const totalFacturado = saleLines.reduce((s, l) => s + Number(l.subtotal), 0);
    const totalCosto = saleLines.reduce((s, l) => s + Number(l.costUnit) * l.quantity, 0);
    const totalGanancia = totalFacturado - totalCosto;
    const totalUnidades = saleLines.reduce((s, l) => s + l.quantity, 0);
    const ticketPromedio = sales.length > 0 ? totalFacturado / sales.length : 0;

    let totalPorCobrar = 0;
    for (const c of customers) {
      const credits = c.credits.reduce((s, credit) => {
        const lineSum = credit.lines.reduce((ls, line) => {
          const price = line.product
            ? Number(calcProductPrices(line.product).precioVenta)
            : Number(line.priceSnap);
          return ls + price * line.quantity;
        }, 0);
        return s + Math.round(lineSum * (1 - Number(credit.discountPct) / 100));
      }, 0);
      const paid = c.payments.reduce((s, p) => s + Number(p.amount), 0);
      const balance = Math.max(0, credits - paid);
      totalPorCobrar += balance;
    }

    return {
      totalFacturado: Math.round(totalFacturado),
      totalGanancia: Math.round(totalGanancia),
      totalCosto: Math.round(totalCosto),
      totalUnidades,
      totalVentas: sales.length,
      ticketPromedio: Math.round(ticketPromedio),
      totalPorCobrar: Math.round(totalPorCobrar),
      margenPct: totalFacturado > 0 ? Math.round((totalGanancia / totalFacturado) * 100) : 0,
    };
  }

  async getProductRotation(tenantId: string, from?: string, to?: string, limit = 10) {
    const dateFilter = this.buildDateFilter(from, to);

    const lines = await this.prisma.saleLine.findMany({
      where: { sale: { tenantId, ...dateFilter } },
      select: {
        productId: true,
        productName: true,
        rubroName: true,
        quantity: true,
        subtotal: true,
        costUnit: true,
      },
    });

    const byProduct = new Map<
      string,
      { name: string; rubro: string; units: number; revenue: number; cost: number }
    >();

    for (const l of lines) {
      const key = l.productId ?? l.productName;
      const existing = byProduct.get(key) ?? {
        name: l.productName,
        rubro: l.rubroName,
        units: 0,
        revenue: 0,
        cost: 0,
      };
      existing.units += l.quantity;
      existing.revenue += Number(l.subtotal);
      existing.cost += Number(l.costUnit) * l.quantity;
      byProduct.set(key, existing);
    }

    return [...byProduct.values()]
      .sort((a, b) => b.units - a.units)
      .slice(0, limit)
      .map((p) => ({
        ...p,
        revenue: Math.round(p.revenue),
        cost: Math.round(p.cost),
        ganancia: Math.round(p.revenue - p.cost),
      }));
  }

  async getRubroBreakdown(tenantId: string, from?: string, to?: string) {
    const dateFilter = this.buildDateFilter(from, to);

    const lines = await this.prisma.saleLine.findMany({
      where: { sale: { tenantId, ...dateFilter } },
      select: { rubroName: true, quantity: true, subtotal: true, costUnit: true },
    });

    const byRubro = new Map<string, { units: number; revenue: number; cost: number }>();
    for (const l of lines) {
      const existing = byRubro.get(l.rubroName) ?? { units: 0, revenue: 0, cost: 0 };
      existing.units += l.quantity;
      existing.revenue += Number(l.subtotal);
      existing.cost += Number(l.costUnit) * l.quantity;
      byRubro.set(l.rubroName, existing);
    }

    return [...byRubro.entries()]
      .map(([rubro, d]) => ({
        rubro,
        units: d.units,
        revenue: Math.round(d.revenue),
        cost: Math.round(d.cost),
        ganancia: Math.round(d.revenue - d.cost),
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }

  async getSaleHistory(tenantId: string, from?: string, to?: string, page = 1, pageSize = 50) {
    const dateFilter = this.buildDateFilter(from, to);
    const [total, sales] = await Promise.all([
      this.prisma.sale.count({ where: { tenantId, ...dateFilter } }),
      this.prisma.sale.findMany({
        where: { tenantId, ...dateFilter },
        include: {
          lines: true,
          user: { select: { id: true, name: true } },
          customer: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return { total, page, pageSize, data: sales };
  }

  private buildDateFilter(from?: string, to?: string) {
    if (!from && !to) return {};
    return {
      createdAt: {
        ...(from && { gte: new Date(from) }),
        ...(to && { lte: new Date(to + 'T23:59:59') }),
      },
    };
  }
}
