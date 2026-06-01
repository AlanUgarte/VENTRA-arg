import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Fix isSuperAdmin flag
  const result = await prisma.user.updateMany({
    where: { email: 'ugartealan776@gmail.com' },
    data: { isSuperAdmin: true, isActive: true },
  });
  console.log('✓ isSuperAdmin=true aplicado a', result.count, 'usuario(s)');

  // Verify
  const user = await prisma.user.findFirst({
    where: { email: 'ugartealan776@gmail.com' },
    select: { id: true, email: true, isSuperAdmin: true, isActive: true },
  });
  console.log('✓ Estado final:', user);
}

main().catch(console.error).finally(() => prisma.$disconnect());
