import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { PrismaService } from '../../prisma/prisma.service';
import { createPrismaMock } from '../../test/prisma.mock';
import { Prisma } from '@prisma/client';

const D = Prisma.Decimal;

const mockRubro = { id: 'r1', tenantId: 't1', name: 'Bebidas', color: '#2f6fed', order: 1, isActive: true, createdAt: new Date() };
const mockProduct = (overrides = {}) => ({
  id: 'p1',
  tenantId: 't1',
  rubroId: 'r1',
  rubro: mockRubro,
  name: 'Gaseosa 2,25L',
  costoBase: new D(2800),
  descCompra: new D(0),
  ganancia: new D(35),
  stock: 24,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => jest.clearAllMocks());

  // ── findAll ──────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('devuelve productos con precios calculados', async () => {
      (prisma.product!.findMany as jest.Mock).mockResolvedValue([mockProduct()]);
      const result = await service.findAll('t1');
      expect(result).toHaveLength(1);
      // costoReal = 2800 * 1 = 2800, precioVenta = round(2800 * 1.35) = 3780
      expect(result[0].costoReal).toBe(2800);
      expect(result[0].precioVenta).toBe(3780);
      expect(result[0].gananciaUnit).toBe(980);
    });

    it('pasa el filtro de rubroId al query', async () => {
      (prisma.product!.findMany as jest.Mock).mockResolvedValue([]);
      await service.findAll('t1', 'r1');
      expect(prisma.product!.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ rubroId: 'r1' }),
        }),
      );
    });
  });

  // ── findOne ──────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('lanza NotFoundException si no existe', async () => {
      (prisma.product!.findFirst as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne('t1', 'p999')).rejects.toThrow(NotFoundException);
    });

    it('devuelve el producto con precios calculados', async () => {
      (prisma.product!.findFirst as jest.Mock).mockResolvedValue(mockProduct());
      const result = await service.findOne('t1', 'p1');
      expect(result.id).toBe('p1');
      expect(result.precioVenta).toBe(3780);
    });
  });

  // ── create ───────────────────────────────────────────────────────────────

  describe('create', () => {
    it('crea un producto y devuelve precios calculados', async () => {
      (prisma.rubro!.findFirst as jest.Mock).mockResolvedValue(mockRubro);
      (prisma.product!.create as jest.Mock).mockResolvedValue(mockProduct());
      const result = await service.create('t1', {
        name: 'Gaseosa 2,25L',
        rubroId: 'r1',
        costoBase: 2800,
        descCompra: 0,
        ganancia: 35,
        stock: 24,
      });
      expect(result.precioVenta).toBe(3780);
      expect(prisma.product!.create).toHaveBeenCalledTimes(1);
    });

    it('lanza NotFoundException si el rubro no existe', async () => {
      (prisma.rubro!.findFirst as jest.Mock).mockResolvedValue(null);
      await expect(
        service.create('t1', { name: 'X', rubroId: 'r999', costoBase: 100 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── addStock ─────────────────────────────────────────────────────────────

  describe('addStock', () => {
    it('incrementa el stock correctamente', async () => {
      (prisma.product!.findFirst as jest.Mock).mockResolvedValue(mockProduct());
      (prisma.product!.update as jest.Mock).mockResolvedValue(mockProduct({ stock: 30 }));
      const result = await service.addStock('t1', 'p1', { quantity: 6 });
      expect(prisma.product!.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { stock: { increment: 6 } } }),
      );
    });
  });

  // ── remove ───────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('deshabilita el producto (soft delete)', async () => {
      (prisma.product!.findFirst as jest.Mock).mockResolvedValue(mockProduct());
      (prisma.product!.update as jest.Mock).mockResolvedValue({ id: 'p1', isActive: false });
      await service.remove('t1', 'p1');
      expect(prisma.product!.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { isActive: false } }),
      );
    });
  });
});
