import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreateSupplierPaymentDto } from './dto/create-supplier-payment.dto';
import { InvoiceStatus, PaymentCondition } from '@prisma/client';

const CONDITION_DAYS: Record<PaymentCondition, number | null> = {
  CASH: 0,
  DAYS_15: 15,
  DAYS_30: 30,
  DAYS_60: 60,
  DAYS_90: 90,
  CURRENT_ACCOUNT: null,
};

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  findAll(tenantId: string) {
    return this.prisma.supplier.findMany({
      where: { tenantId, isActive: true },
      include: { _count: { select: { invoices: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const s = await this.prisma.supplier.findFirst({
      where: { id, tenantId },
      include: {
        invoices: {
          include: { payments: true },
          orderBy: { dueAt: 'asc' },
        },
      },
    });
    if (!s) throw new NotFoundException('Proveedor no encontrado');
    return {
      ...s,
      invoices: s.invoices.map(this.withInvoiceStatus),
    };
  }

  create(tenantId: string, dto: CreateSupplierDto) {
    return this.prisma.supplier.create({
      data: { tenantId, name: dto.name },
    });
  }

  update(tenantId: string, id: string, dto: Partial<CreateSupplierDto>) {
    return this.prisma.supplier.update({
      where: { id },
      data: dto,
    });
  }

  async getInvoices(tenantId: string, supplierId?: string) {
    const invoices = await this.prisma.supplierInvoice.findMany({
      where: {
        tenantId,
        ...(supplierId && { supplierId }),
      },
      include: {
        supplier: { select: { id: true, name: true } },
        payments: true,
      },
      orderBy: { dueAt: 'asc' },
    });
    return invoices.map(this.withInvoiceStatus);
  }

  async createInvoice(tenantId: string, supplierId: string, dto: CreateInvoiceDto) {
    const supplier = await this.prisma.supplier.findFirst({ where: { id: supplierId, tenantId } });
    if (!supplier) throw new NotFoundException('Proveedor no encontrado');

    const days = CONDITION_DAYS[dto.condition];
    let dueAt: Date | undefined = dto.dueAt ? new Date(dto.dueAt) : undefined;
    if (!dueAt && days !== null) {
      dueAt = new Date(dto.issuedAt);
      dueAt.setDate(dueAt.getDate() + days);
    }

    return this.prisma.supplierInvoice.create({
      data: {
        tenantId,
        supplierId,
        invoiceNumber: dto.invoiceNumber,
        condition: dto.condition,
        issuedAt: new Date(dto.issuedAt),
        dueAt,
        amount: dto.amount,
      },
    });
  }

  async createPayment(tenantId: string, invoiceId: string, dto: CreateSupplierPaymentDto) {
    const invoice = await this.prisma.supplierInvoice.findFirst({
      where: { id: invoiceId, tenantId },
      include: { payments: true },
    });
    if (!invoice) throw new NotFoundException('Factura no encontrada');

    const paid = invoice.payments.reduce((s, p) => s + Number(p.amount), 0);
    const saldo = Number(invoice.amount) - paid;
    if (dto.amount > saldo + 0.01) {
      throw new BadRequestException(`El monto supera el saldo (${saldo.toFixed(2)})`);
    }

    const payment = await this.prisma.supplierPayment.create({
      data: {
        tenantId,
        invoiceId,
        amount: dto.amount,
        method: dto.method,
        reference: dto.reference,
        paidAt: dto.paidAt ? new Date(dto.paidAt) : new Date(),
      },
    });

    // Update invoice status
    const newPaid = paid + dto.amount;
    const status: InvoiceStatus =
      newPaid >= Number(invoice.amount) - 0.01
        ? 'PAID'
        : newPaid > 0
        ? 'PARTIAL'
        : 'PENDING';

    await this.prisma.supplierInvoice.update({
      where: { id: invoiceId },
      data: { status },
    });

    return payment;
  }

  private withInvoiceStatus(invoice: any) {
    const paid = (invoice.payments ?? []).reduce((s: number, p: any) => s + Number(p.amount), 0);
    const saldo = Number(invoice.amount) - paid;
    const today = new Date().toISOString().slice(0, 10);
    const isOverdue = invoice.dueAt && invoice.dueAt.toISOString().slice(0, 10) < today && saldo > 0;

    return {
      ...invoice,
      paid,
      saldo,
      isOverdue,
    };
  }
}
