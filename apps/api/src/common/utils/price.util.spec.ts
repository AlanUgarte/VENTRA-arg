import { calcProductPrices, applyDiscount } from './price.util';
import { Prisma } from '@prisma/client';

const D = Prisma.Decimal;

function product(costoBase: number, descCompra: number, ganancia: number) {
  return {
    costoBase: new D(costoBase),
    descCompra: new D(descCompra),
    ganancia: new D(ganancia),
  };
}

describe('calcProductPrices', () => {
  it('calcula precio sin descuento de compra', () => {
    const { costoReal, precioVenta, gananciaUnit } = calcProductPrices(product(1000, 0, 40));
    expect(Number(costoReal)).toBe(1000);
    expect(Number(precioVenta)).toBe(1400);
    expect(Number(gananciaUnit)).toBe(400);
  });

  it('aplica descuento de compra antes de calcular ganancia', () => {
    const { costoReal, precioVenta } = calcProductPrices(product(1000, 10, 50));
    // costoReal = 1000 * 0.9 = 900
    // precioVenta = 900 * 1.5 = 1350
    expect(Number(costoReal)).toBe(900);
    expect(Number(precioVenta)).toBe(1350);
  });

  it('redondea al entero más cercano', () => {
    // costoReal = 2000 * (1 - 0.15) = 1700
    // precioVenta = 1700 * 1.45 = 2465
    const { precioVenta } = calcProductPrices(product(2000, 15, 45));
    expect(Number(precioVenta)).toBe(2465);
  });

  it('gananciaUnit = precioVenta - costoReal', () => {
    const { costoReal, precioVenta, gananciaUnit } = calcProductPrices(product(900, 0, 60));
    expect(Number(gananciaUnit)).toBe(Number(precioVenta) - Number(costoReal));
  });

  it('maneja ganancia cero', () => {
    const { precioVenta, gananciaUnit } = calcProductPrices(product(500, 0, 0));
    expect(Number(precioVenta)).toBe(500);
    expect(Number(gananciaUnit)).toBe(0);
  });
});

describe('applyDiscount', () => {
  it('aplica descuento correctamente', () => {
    const result = applyDiscount(new D(1000), 10);
    expect(Number(result)).toBe(900);
  });

  it('descuento 0 devuelve el mismo precio', () => {
    const result = applyDiscount(new D(2465), 0);
    expect(Number(result)).toBe(2465);
  });

  it('redondea al entero', () => {
    // 1000 * (1 - 0.15) = 850 (exacto, no hay redondeo)
    const result = applyDiscount(new D(1000), 15);
    expect(Number(result)).toBe(850);
  });
});
