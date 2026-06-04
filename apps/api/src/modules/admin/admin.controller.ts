import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { EmailService } from '../email/email.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../../common/guards/super-admin.guard';
import { SkipSubscription } from '../../common/guards/subscription.guard';
import { Public } from '../../common/decorators/public.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SubStatus } from '@prisma/client';
import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

class BootstrapDto {
  @IsString() @MinLength(2) name: string;
  @IsEmail() email: string;
  @IsString() @MinLength(8) password: string;
  @IsString() adminSecret: string;
}

class SetStatusDto {
  @IsIn(['ACTIVE', 'CANCELLED', 'PAST_DUE', 'TRIAL']) status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'TRIAL';
  @IsOptional() @IsIn(['BASIC', 'PRO', 'ENTERPRISE', 'TRIAL']) plan?: 'BASIC' | 'PRO' | 'ENTERPRISE' | 'TRIAL';
  @IsOptional() @IsString() reason?: string;
}

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(
    private service: AdminService,
    private email: EmailService,
  ) {}

  // ── Bootstrap (sin auth — solo con secreto) ─────────────────────────────
  @Public()
  @SkipSubscription()
  @Post('bootstrap')
  @HttpCode(HttpStatus.CREATED)
  bootstrap(@Body() dto: BootstrapDto) {
    return this.service.bootstrapSuperAdmin(dto);
  }

  // ── Todo lo siguiente requiere super admin ────────────────────────────────
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @SkipSubscription()
  @Get('stats')
  getStats() {
    return this.service.getStats();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @SkipSubscription()
  @Get('tenants')
  getTenants(
    @Query('search') search?: string,
    @Query('status') status?: SubStatus,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.service.getTenants(search, status, page, pageSize);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @SkipSubscription()
  @Get('tenants/:id')
  getTenantDetail(@Param('id') id: string) {
    return this.service.getTenantDetail(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @SkipSubscription()
  @Patch('tenants/:id/status')
  setTenantStatus(@Param('id') id: string, @Body() dto: SetStatusDto) {
    return this.service.setTenantStatus(id, dto.status, dto.plan, dto.reason);
  }

  // ── User management per tenant ────────────────────────────────────────────
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @SkipSubscription()
  @Get('tenants/:id/users')
  getTenantUsers(@Param('id') id: string) {
    return this.service.getTenantUsers(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @SkipSubscription()
  @Patch('tenants/:id/users/:userId')
  updateTenantUser(
    @Param('id') tenantId: string,
    @Param('userId') userId: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.service.setTenantUserActive(tenantId, userId, isActive);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @SkipSubscription()
  @Delete('tenants/:id/users/:userId')
  deleteTenantUser(@Param('id') tenantId: string, @Param('userId') userId: string) {
    return this.service.deleteTenantUser(tenantId, userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @SkipSubscription()
  @Patch('tenants/:id/block')
  blockTenant(@Param('id') id: string) {
    return this.service.blockTenantUsers(id, true);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @SkipSubscription()
  @Patch('tenants/:id/unblock')
  unblockTenant(@Param('id') id: string) {
    return this.service.blockTenantUsers(id, false);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @SkipSubscription()
  @Delete('tenants/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteTenant(@Param('id') id: string) {
    return this.service.deleteTenant(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @SkipSubscription()
  @Get('plans/stats')
  getPlanStats() {
    return this.service.getPlanStats();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @SkipSubscription()
  @Get('revenue/timeline')
  getRevenueTimeline() {
    return this.service.getRevenueTimeline();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @SkipSubscription()
  @Get('activity')
  getRecentActivity() {
    return this.service.getRecentActivity();
  }

  // Test SMTP — útil para verificar configuración de email en producción
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @SkipSubscription()
  @Post('test-email')
  @HttpCode(HttpStatus.OK)
  async testEmail(@CurrentUser() user: JwtPayload) {
    await this.email.sendPasswordReset(
      user.email,
      'Super Admin',
      'https://ventra-arg.vercel.app/reset-password?token=TEST',
    );
    return { sent: true, to: user.email };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @SkipSubscription()
  @Post('promote/:userId')
  promoteToSuperAdmin(
    @Param('userId') userId: string,
    @Body('adminSecret') adminSecret: string,
  ) {
    return this.service.promoteToSuperAdmin(userId, adminSecret);
  }
}
