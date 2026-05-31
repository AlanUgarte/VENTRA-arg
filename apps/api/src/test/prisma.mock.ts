import { PrismaService } from '../prisma/prisma.service';

type MockPrisma = {
  [K in keyof PrismaService]: K extends `$${string}`
    ? jest.Mock
    : { [M in keyof PrismaService[K]]: jest.Mock };
};

export const createPrismaMock = (): Partial<MockPrisma> => ({
  user: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  } as any,
  tenant: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  } as any,
  subscription: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  } as any,
  refreshToken: {
    findFirst: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  } as any,
  rubro: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    update: jest.fn(),
  } as any,
  paymentMethod: {
    createMany: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    updateMany: jest.fn(),
  } as any,
  product: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  } as any,
  sale: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  } as any,
  saleLine: {
    findMany: jest.fn(),
  } as any,
  customer: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  } as any,
  credit: {
    create: jest.fn(),
    delete: jest.fn(),
  } as any,
  creditLine: {
    findMany: jest.fn(),
  } as any,
  customerPayment: {
    create: jest.fn(),
  } as any,
  supplier: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  } as any,
  supplierInvoice: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  } as any,
  supplierPayment: {
    create: jest.fn(),
  } as any,
  $transaction: jest.fn(),
});
