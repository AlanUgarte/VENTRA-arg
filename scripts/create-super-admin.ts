import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email    = 'ugartealan776@gmail.com';
  const name     = 'Alan Ugarte';
  const password = 'Ventra2026!Admin';

  // Create or reuse system tenant
  let tenant = await prisma.tenant.findUnique({ where: { slug: '__system__' } });
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: 'VENTRA ARG — Sistema',
        slug: '__system__',
        subscription: {
          create: {
            plan: 'ENTERPRISE',
            status: 'ACTIVE',
            trialEndsAt: new Date('2099-12-31'),
          },
        },
      },
    });
    console.log('✓ Tenant sistema creado');
  } else {
    console.log('✓ Tenant sistema existente');
  }

  // Check if user already exists
  const existing = await prisma.user.findFirst({
    where: { email: email.toLowerCase(), tenantId: tenant.id },
  });
  if (existing) {
    // Promote to super admin if not already
    if (!existing.isSuperAdmin) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { isSuperAdmin: true },
      });
      console.log('✓ Usuario existente promovido a super admin');
    } else {
      console.log('✓ El usuario ya es super admin');
    }
    return;
  }

  const hash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      name,
      email: email.toLowerCase(),
      password: hash,
      role: 'OWNER',
      isSuperAdmin: true,
    },
    select: { id: true, name: true, email: true, isSuperAdmin: true },
  });

  console.log('\n✅ SUPER ADMIN CREADO EN RAILWAY:');
  console.log('   Email:    ', user.email);
  console.log('   Nombre:   ', user.name);
  console.log('   SuperAdmin:', user.isSuperAdmin);
  console.log('\n🔑 GUARDÁ ESTA CONTRASEÑA: Ventra2026!Admin');
}

main()
  .catch((e) => { console.error('❌ Error:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
