import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CreateCreditDto } from './dto/create-credit.dto';
import { CreateCustomerPaymentDto } from './dto/create-payment.dto';
import { calcProductPrices } from '../../common/utils/price.util';
import { Prisma } from '@prisma/client';

const D = Prisma.Decimal;

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, search?: string) {
    const customers = await this.prisma.customer.findMany({
      where: {
        tenantId,
        isActive: true,
        ...(search && { name: { contains: search, mode: 'insensitive' } }),
      },
      include: {
        credits: { include: { lines: { include: { product: true } } } },
        payments: true,
      },
      orderBy: { name: 'asc' },
    });

    return customers.map((c) => ({
      ...c,
      balance: this.calcBalance(c),
    }));
  }

  async findOne(tenantId: string, id: string) {
    const c = await this.prisma.customer.findFirst({
      where: { id, tenantId },
      include: {
        credits: {
          include: { lines: { include: { product: { include: { rubro: true } } } } },
          orderBy: { createdAt: 'desc' },
        },
        payments: { orderBy: { paidAt: 'desc' } },
      },
    });
    if (!c) throw new NotFoundException('Cliente no encontrado');

    const creditsWithValues = c.credits.map((credit) => ({
      ...credit,
      currentValue: this.calcCreditValue(credit),
    }));

    return {
      ...c,
      credits: creditsWithValues,
      balance: this.calcBalance(c),
      totalPaid: c.payments.reduce((s, p) => s + Number(p.amount), 0),
    };
  }

  create(tenantId: string, dto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: { tenantId, name: dto.name, phone: dto.phone },
      select: { id: true, name: true, phone: true, createdAt: true },
    });
  }

  async update(tenantId: string, id: string, dto: Partial<CreateCustomerDto>) {
    await this.assertCustomer(tenantId, id);
    return this.prisma.customer.update({
      where: { id },
      data: dto,
      select: { id: true, name: true, phone: true },
    });
  }

  async createCredit(tenantId: string, customerId: string, dto: CreateCreditDto) {
    await this.assertCustomer(tenantId, customerId);

    const lineData: Array<{
      productId: string | null;
      productName: string;
      priceSnap: number;
      quantity: number;
    }> = [];

    for (const l of dto.lines) {
      if (l.productId) {
        const p = await this.prisma.product.findFirst({
          where: { id: l.productId, tenantId, isActive: true },
        });
        if (!p) throw new BadRequestException(`Artículo ${l.productId} no encontrado`);
        const { precioVenta } = calcProductPrices(p);
        lineData.push({
          productId: p.id,
          productName: p.name,
          priceSnap: Number(precioVenta),
          quantity: l.quantity,
        });
      } else {
        if (!l.fixedPrice || !l.concept) {
          throw new BadRequestException('Los ítems manuales requieren concept y fixedPrice');
        }
        lineData.push({
          productId: null,
          productName: l.concept,
          priceSnap: l.fixedPrice,
          quantity: l.quantity,
        });
      }
    }

    return this.prisma.credit.create({
      data: {
        tenantId,
        customerId,
        discountPct: dto.discountPct ?? 0,
        lines: { create: lineData },
      },
      include: { lines: true },
    });
  }

  async createPayment(
    tenantId: string,
    customerId: string,
    dto: CreateCustomerPaymentDto,
  ) {
    const c = await this.assertCustomer(tenantId, customerId);
    const balance = this.calcBalance(
      await this.prisma.customer.findFirst({
        where: { id: customerId },
        include: {
          credits: { include: { lines: { include: { product: true } } } },
          payments: true,
        },
      }),
    );
    if (dto.amount > balance + 0.01) {
      throw new BadRequestException(
        `El monto supera la deuda actual (${balance.toFixed(2)})`,
      );
    }

    return this.prisma.customerPayment.create({
      data: {
        tenantId,
        customerId,
        amount: dto.amount,
        method: dto.method,
        reference: dto.reference,
        paidAt: dto.paidAt ? new Date(dto.paidAt) : new Date(),
      },
    });
  }

  // ── Balance calculation ──────────────────────────

  calcBalance(customer: any): number {
    const totalCredits = (customer.credits ?? []).reduce(
      (s: number, credit: any) => s + this.calcCreditValue(credit),
      0,
    );
    const totalPaid = (customer.payments ?? []).reduce(
      (s: number, p: any) => s + Number(p.amount),
      0,
    );
    return Math.max(0, totalCredits - totalPaid);
  }

  calcCreditValue(credit: any): number {
    const lineSum = (credit.lines ?? []).reduce((s: number, line: any) => {
      const currentPrice = line.product
        ? Number(calcProductPrices(line.product).precioVenta)
        : Number(line.priceSnap);
      return s + currentPrice * line.quantity;
    }, 0);
    const discount = Number(credit.discountPct ?? 0);
    return Math.round(lineSum * (1 - discount / 100));
  }

  private async assertCustomer(tenantId: string, id: string) {
    const c = await this.prisma.customer.findFirst({ where: { id, tenantId } });
    if (!c) throw new NotFoundException('Cliente no encontrado');
    return c;
  }
}
