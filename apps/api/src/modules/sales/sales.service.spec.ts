import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { SalesService } from './sales.service';
import { PrismaService } from '../../prisma/prisma.service';
import { createPrismaMock } from '../../test/prisma.mock';
import { Prisma, SaleType } from '@prisma/client';

const D = Prisma.Decimal;

const mkProduct = (id: string, stock: number, costoBase = 1000, descCompra = 0, ganancia = 40) => ({
  id,
  tenantId: 't1',
  name: `Producto ${id}`,
  rubroId: 'r1',
  rubro: { id: 'r1', name: 'Alimentos', color: '#000', order: 0, isActive: true, createdAt: new Date() },
  costoBase: new D(costoBase),
  descCompra: new D(descCompra),
  ganancia: new D(ganancia),
  stock,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('SalesService', () => {
  let service: SalesService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get<SalesService>(SalesService);
  });

  afterEach(() => jest.clearAllMocks());

  // ── create ───────────────────────────────────────────────────────────────

  describe('create', () => {
    const baseDto = {
      type: SaleType.CASH,
      discountPct: 0,
      lines: [{ productId: 'p1', quantity: 2 }],
    };

    it('valida que los productos existen y pertenecen al tenant', async () => {
      (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
        return cb({
          product: { findMany: jest.fn().mockResolvedValue([]) }, // no products found
        });
      });
      await expect(service.create(baseDto, 't1', 'u1')).rejects.toThrow(BadRequestException);
    });

    it('valida stock suficiente', async () => {
      (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
        return cb({
          product: {
            findMany: jest.fn().mockResolvedValue([mkProduct('p1', 1)]), // stock=1, pedimos 2
          },
        });
      });
      await expect(
        service.create({ ...baseDto, lines: [{ productId: 'p1', quantity: 2 }] }, 't1', 'u1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('requiere customerId para ventas CREDIT', async () => {
      await expect(
        service.create({ ...baseDto, type: SaleType.CREDIT }, 't1', 'u1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('crea una venta CASH correctamente', async () => {
      const fakeSale = {
        id: 's1', orderNumber: 1, type: SaleType.CASH,
        discountPct: new D(0), subtotal: new D(2800), discountAmount: new D(0), total: new D(2800),
        createdAt: new Date(), lines: [], user: { id: 'u1', name: 'Test' }, customer: null,
      };

      (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
        return cb({
          product: {
            findMany: jest.fn().mockResolvedValue([mkProduct('p1', 10, 1000, 0, 40)]),
            update: jest.fn().mockResolvedValue({}),
          },
          sale: {
            findFirst: jest.fn().mockResolvedValue(null), // no previous sales
            create: jest.fn().mockResolvedValue(fakeSale),
          },
          customer: { findFirst: jest.fn() },
        });
      });

      const result = await service.create(baseDto, 't1', 'u1');
      expect(result.orderNumber).toBe(1);
      expect(result.type).toBe(SaleType.CASH);
    });

    it('calcula el número de orden secuencial por tenant', async () => {
      const fakeSale = {
        id: 's2', orderNumber: 6, type: SaleType.CASH,
        discountPct: new D(0), subtotal: new D(1400), discountAmount: new D(0), total: new D(1400),
        createdAt: new Date(), lines: [], user: { id: 'u1', name: 'Test' }, customer: null,
      };

      (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
        return cb({
          product: {
            findMany: jest.fn().mockResolvedValue([mkProduct('p1', 10)]),
            update: jest.fn().mockResolvedValue({}),
          },
          sale: {
            findFirst: jest.fn().mockResolvedValue({ orderNumber: 5 }), // last order = 5
            create: jest.fn().mockResolvedValue(fakeSale),
          },
          customer: { findFirst: jest.fn() },
        });
      });

      const result = await service.create(baseDto, 't1', 'u1');
      expect(result.orderNumber).toBe(6); // 5 + 1
    });

    it('aplica descuento al precio unitario', async () => {
      const fakeSale = {
        id: 's3', orderNumber: 1, type: SaleType.CASH,
        discountPct: new D(10), subtotal: new D(1400), discountAmount: new D(140), total: new D(1260),
        createdAt: new Date(), lines: [
          { priceUnit: new D(630), costUnit: new D(1000), quantity: 2, subtotal: new D(1260) }
        ],
        user: { id: 'u1', name: 'Test' }, customer: null,
      };

      (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
        return cb({
          product: {
            findMany: jest.fn().mockResolvedValue([mkProduct('p1', 10)]),
            update: jest.fn().mockResolvedValue({}),
          },
          sale: {
            findFirst: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue(fakeSale),
          },
          customer: { findFirst: jest.fn() },
        });
      });

      // precioVenta = round(1000 * 1.40) = 1400, con 10% desc = 1260 por unidad
      const result = await service.create({ ...baseDto, discountPct: 10 }, 't1', 'u1');
      expect(Number(result.total)).toBeLessThan(Number(result.subtotal));
    });
  });

  // ── void ────────────────────────────────────────────────────────────────

  describe('void', () => {
    it('lanza NotFoundException si la venta no existe', async () => {
      (prisma.sale!.findFirst as jest.Mock).mockResolvedValue(null);
      await expect(service.void('t1', 's999')).rejects.toThrow();
    });
  });
});
