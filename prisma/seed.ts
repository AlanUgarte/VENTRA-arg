import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEFAULT_RUBROS = [
  { name: 'Alimentos', color: '#0d9f6e', order: 0 },
  { name: 'Bebidas', color: '#2f6fed', order: 1 },
  { name: 'Limpieza', color: '#06b6d4', order: 2 },
  { name: 'Chocolates', color: '#92400e', order: 3 },
  { name: 'Perfumería', color: '#d946a8', order: 4 },
  { name: 'Galletitas', color: '#d99a1c', order: 5 },
  { name: 'Congelados', color: '#3aa0d4', order: 6 },
  { name: 'Fiambrería', color: '#f0653e', order: 7 },
];

const DEFAULT_PAYMENT_METHODS = [
  'Efectivo',
  'Transferencia',
  'Tarjeta de débito',
  'Tarjeta de crédito',
  'Mercado Pago',
];

async function main() {
  const slug = 'kiosco-la-esquina';
  const existing = await prisma.tenant.findUnique({ where: { slug } });
  if (existing) {
    console.log('Seed ya ejecutado.');
    return;
  }

  const password = await bcrypt.hash('demo1234', 12);
  const trialEndsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  const tenant = await prisma.tenant.create({
    data: {
      name: 'Kiosco La Esquina',
      slug,
      subscription: {
        create: { plan: 'TRIAL', status: 'TRIAL', trialEndsAt },
      },
      users: {
        create: {
          name: 'Demo Owner',
          email: 'demo@almacen.app',
          password,
          role: 'OWNER',
        },
      },
      rubros: { createMany: { data: DEFAULT_RUBROS } },
      paymentMethods: {
        createMany: {
          data: DEFAULT_PAYMENT_METHODS.map((name, i) => ({
            name,
            isDefault: true,
            order: i,
          })),
        },
      },
    },
  });

  const rubros = await prisma.rubro.findMany({
    where: { tenantId: tenant.id },
    orderBy: { order: 'asc' },
  });
  const rm = Object.fromEntries(rubros.map((r) => [r.name, r.id]));

  await prisma.product.createMany({
    data: [
      { tenantId: tenant.id, rubroId: rm['Galletitas'], name: 'Galletitas surtidas', costoBase: 2000, descCompra: 15, ganancia: 45, stock: 30 },
      { tenantId: tenant.id, rubroId: rm['Chocolates'], name: 'Alfajor triple', costoBase: 900, descCompra: 0, ganancia: 60, stock: 48 },
      { tenantId: tenant.id, rubroId: rm['Bebidas'], name: 'Gaseosa 2,25L', costoBase: 2800, descCompra: 0, ganancia: 35, stock: 24 },
      { tenantId: tenant.id, rubroId: rm['Alimentos'], name: 'Leche entera 1L', costoBase: 1000, descCompra: 0, ganancia: 25, stock: 35 },
      { tenantId: tenant.id, rubroId: rm['Alimentos'], name: 'Yerba 1kg', costoBase: 3500, descCompra: 8, ganancia: 30, stock: 18 },
      { tenantId: tenant.id, rubroId: rm['Bebidas'], name: 'Agua mineral 500ml', costoBase: 700, descCompra: 10, ganancia: 50, stock: 60 },
      { tenantId: tenant.id, rubroId: rm['Limpieza'], name: 'Lavandina 1L', costoBase: 1300, descCompra: 12, ganancia: 45, stock: 22 },
      { tenantId: tenant.id, rubroId: rm['Perfumería'], name: 'Jabón de tocador', costoBase: 850, descCompra: 0, ganancia: 55, stock: 36 },
    ],
  });

  const customers = await prisma.customer.createMany({
    data: [
      { tenantId: tenant.id, name: 'María González', phone: '341-555-1234' },
      { tenantId: tenant.id, name: 'Carlos Pérez', phone: '341-555-9876' },
    ],
  });

  console.log('✓ Seed completado');
  console.log('  Usuario: demo@almacen.app');
  console.log('  Contraseña: demo1234');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
