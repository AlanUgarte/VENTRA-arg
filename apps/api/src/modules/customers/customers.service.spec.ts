import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { PrismaService } from '../../prisma/prisma.service';
import { createPrismaMock } from '../../test/prisma.mock';
import { Prisma } from '@prisma/client';

const D = Prisma.Decimal;

// costoBase=700, descCompra=0, ganancia=43 → precioVenta=round(700*1.43)=1001
const mkProduct = () => ({
  costoBase: new D(700),
  descCompra: new D(0),
  ganancia: new D(43),
});

const mkCredit = (lines: any[], discountPct = 0) => ({
  id: 'c1',
  discountPct: new D(discountPct),
  lines,
});

const mkLine = (withProduct: boolean, priceSnap: number, qty: number) => ({
  product: withProduct ? mkProduct() : null,
  priceSnap: new D(priceSnap),
  quantity: qty,
});

describe('CustomersService — calcBalance', () => {
  let service: CustomersService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get<CustomersService>(CustomersService);
  });

  afterEach(() => jest.clearAllMocks());

  // ── calcCreditValue ──────────────────────────────────────────────────────

  describe('calcCreditValue', () => {
    it('usa el precio actual del producto si existe (revaluación)', () => {
      // mkProduct: costoBase=700, ganancia=43 → precioVenta=round(700*1.43)=1001
      const credit = mkCredit([mkLine(true, 800, 2)]); // priceSnap=800, precio actual=1001
      const value = service.calcCreditValue(credit);
      expect(value).toBe(2002);           // 1001 * 2 (precio actual)
      expect(value).not.toBe(1600);       // NO es priceSnap (800) * 2
    });

    it('usa precioSnap si el producto fue eliminado (productId null)', () => {
      const credit = mkCredit([{ product: null, priceSnap: new D(1500), quantity: 3 }]);
      const value = service.calcCreditValue(credit);
      expect(value).toBe(4500); // 1500 * 3
    });

    it('aplica descuento del fiado', () => {
      const credit = mkCredit([{ product: null, priceSnap: new D(1000), quantity: 2 }], 10);
      const value = service.calcCreditValue(credit);
      expect(value).toBe(1800); // round(2000 * 0.9)
    });
  });

  // ── calcBalance ──────────────────────────────────────────────────────────

  describe('calcBalance', () => {
    it('calcula la deuda como créditos menos pagos', () => {
      const customer = {
        credits: [
          mkCredit([{ product: null, priceSnap: new D(1000), quantity: 3 }]), // 3000
          mkCredit([{ product: null, priceSnap: new D(500), quantity: 2 }]),  // 1000
        ],
        payments: [
          { amount: new D(1500) },
        ],
      };
      const balance = service.calcBalance(customer);
      expect(balance).toBe(2500); // 4000 - 1500
    });

    it('devuelve 0 si los pagos superan los créditos', () => {
      const customer = {
        credits: [mkCredit([{ product: null, priceSnap: new D(100), quantity: 1 }])],
        payments: [{ amount: new D(500) }],
      };
      expect(service.calcBalance(customer)).toBe(0);
    });

    it('devuelve 0 si no hay créditos', () => {
      const customer = { credits: [], payments: [] };
      expect(service.calcBalance(customer)).toBe(0);
    });
  });

  // ── createCredit ─────────────────────────────────────────────────────────

  describe('createCredit', () => {
    it('lanza NotFoundException si el cliente no existe', async () => {
      (prisma.customer!.findFirst as jest.Mock).mockResolvedValue(null);
      await expect(
        service.createCredit('t1', 'c999', { lines: [{ productId: 'p1', quantity: 1 }] }),
      ).rejects.toThrow(NotFoundException);
    });

    it('lanza BadRequestException si ítem manual no tiene fixedPrice', async () => {
      (prisma.customer!.findFirst as jest.Mock).mockResolvedValue({ id: 'c1' });
      await expect(
        service.createCredit('t1', 'c1', {
          lines: [{ concept: 'Deuda anterior', quantity: 1 }], // sin fixedPrice
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
