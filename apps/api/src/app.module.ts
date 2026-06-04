import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { SalesModule } from './modules/sales/sales.module';
import { CustomersModule } from './modules/customers/customers.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { ReportsModule } from './modules/reports/reports.module';
import { BillingModule } from './modules/billing/billing.module';
import { AdminModule } from './modules/admin/admin.module';
import { EmailModule } from './modules/email/email.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { SubscriptionGuard } from './common/guards/subscription.guard';
import { validateEnv } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    // Rate limiting: 100 req/min por IP en endpoints normales
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60_000, limit: 100 },
    ]),
    PrismaModule,
    AuthModule,
    TenantsModule,
    UsersModule,
    ProductsModule,
    SalesModule,
    CustomersModule,
    SuppliersModule,
    ReportsModule,
    BillingModule,
    AdminModule,
    EmailModule,
  ],
  providers: [
    // 1. Rate limit global
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    // 2. JWT auth global (rutas públicas usan @Public())
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // 3. RBAC global
    { provide: APP_GUARD, useClass: RolesGuard },
    // 4. Subscription check global
    { provide: APP_GUARD, useClass: SubscriptionGuard },
  ],
})
export class AppModule {}
