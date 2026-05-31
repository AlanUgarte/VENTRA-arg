import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateRubroDto } from './dto/create-rubro.dto';
import { AddStockDto } from './dto/add-stock.dto';
import { calcProductPrices } from '../../common/utils/price.util';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // ── RUBROS ──────────────────────────────────────

  getRubros(tenantId: string) {
    return this.prisma.rubro.findMany({
      where: { tenantId, isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  async createRubro(tenantId: string, dto: CreateRubroDto) {
    const exists = await this.prisma.rubro.findUnique({
      where: { tenantId_name: { tenantId, name: dto.name } },
    });
    if (exists) throw new ConflictException('Rubro ya existe');

    const last = await this.prisma.rubro.findFirst({
      where: { tenantId },
      orderBy: { order: 'desc' },
    });

    return this.prisma.rubro.create({
      data: { tenantId, name: dto.name, color: dto.color ?? '#697586', order: (last?.order ?? 0) + 1 },
    });
  }

  async updateRubro(tenantId: string, id: string, dto: Partial<CreateRubroDto>) {
    await this.assertRubro(tenantId, id);
    return this.prisma.rubro.update({ where: { id }, data: dto });
  }

  async deleteRubro(tenantId: string, id: string) {
    await this.assertRubro(tenantId, id);
    const count = await this.prisma.product.count({ where: { rubroId: id, isActive: true } });
    if (count > 0) throw new ConflictException('El rubro tiene artículos activos');
    return this.prisma.rubro.update({ where: { id }, data: { isActive: false } });
  }

  private async assertRubro(tenantId: string, id: string) {
    const r = await this.prisma.rubro.findFirst({ where: { id, tenantId } });
    if (!r) throw new NotFoundException('Rubro no encontrado');
    return r;
  }

  // ── PRODUCTS ─────────────────────────────────────

  async findAll(tenantId: string, rubroId?: string, onlyActive = true) {
    const products = await this.prisma.product.findMany({
      where: {
        tenantId,
        ...(onlyActive && { isActive: true }),
        ...(rubroId && { rubroId }),
      },
      include: { rubro: true },
      orderBy: [{ rubro: { order: 'asc' } }, { name: 'asc' }],
    });
    return products.map(this.withPrices);
  }

  async findOne(tenantId: string, id: string) {
    const p = await this.prisma.product.findFirst({
      where: { id, tenantId },
      include: { rubro: true },
    });
    if (!p) throw new NotFoundException('Artículo no encontrado');
    return this.withPrices(p);
  }

  async create(tenantId: string, dto: CreateProductDto) {
    await this.assertRubro(tenantId, dto.rubroId);
    const p = await this.prisma.product.create({
      data: {
        tenantId,
        rubroId: dto.rubroId,
        name: dto.name,
        costoBase: dto.costoBase,
        descCompra: dto.descCompra ?? 0,
        ganancia: dto.ganancia ?? 40,
        stock: dto.stock ?? 0,
      },
      include: { rubro: true },
    });
    return this.withPrices(p);
  }

  async update(tenantId: string, id: string, dto: UpdateProductDto) {
    await this.findOne(tenantId, id);
    if (dto.rubroId) await this.assertRubro(tenantId, dto.rubroId);
    const p = await this.prisma.product.update({
      where: { id },
      data: dto,
      include: { rubro: true },
    });
    return this.withPrices(p);
  }

  async addStock(tenantId: string, id: string, dto: AddStockDto) {
    await this.findOne(tenantId, id);
    const p = await this.prisma.product.update({
      where: { id },
      data: { stock: { increment: dto.quantity } },
      include: { rubro: true },
    });
    return this.withPrices(p);
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, isActive: true },
    });
  }

  private withPrices(p: any) {
    const { costoReal, precioVenta, gananciaUnit } = calcProductPrices(p);
    return {
      ...p,
      costoReal: Number(costoReal),
      precioVenta: Number(precioVenta),
      gananciaUnit: Number(gananciaUnit),
    };
  }
}
