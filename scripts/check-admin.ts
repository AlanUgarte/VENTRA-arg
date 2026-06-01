import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'ugartealan776@gmail.com' },
    select: { id: true, email: true, isSuperAdmin: true, isActive: true, password: true },
  });

  if (!user) {
    console.log('❌ Usuario NO encontrado');
    return;
  }

  console.log('✓ Usuario encontrado:');
  console.log('  id:', user.id);
  console.log('  email:', user.email);
  console.log('  isSuperAdmin:', user.isSuperAdmin);
  console.log('  isActive:', user.isActive);
  console.log('  hash prefix:', user.password.slice(0, 10) + '...');

  const match = await bcrypt.compare('Ventra2026!Admin', user.password);
  console.log('  password match:', match);

  if (!match) {
    // Fix: update with correct hash
    const newHash = await bcrypt.hash('Ventra2026!Admin', 12);
    await prisma.user.update({ where: { id: user.id }, data: { password: newHash } });
    console.log('✓ Contraseña actualizada en DB');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
