import { Prisma } from '@prisma/client';

const D = Prisma.Decimal;

export function calcProductPrices(product: {
  costoBase: Prisma.Decimal;
  descCompra: Prisma.Decimal;
  ganancia: Prisma.Decimal;
}) {
  const costoReal = product.costoBase.mul(
    new D(1).sub(product.descCompra.div(100)),
  );
  const precioVenta = costoReal
    .mul(new D(1).add(product.ganancia.div(100)))
    .toDecimalPlaces(0, D.ROUND_HALF_UP);
  const gananciaUnit = precioVenta.sub(costoReal);
  return { costoReal, precioVenta, gananciaUnit };
}

export function applyDiscount(price: Prisma.Decimal, pct: number): Prisma.Decimal {
  if (pct === 0) return price;
  return price
    .mul(new D(1).sub(new D(pct).div(100)))
    .toDecimalPlaces(0, D.ROUND_HALF_UP);
}
