import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private service: ReportsService) {}

  // overview accesible para todos los roles (se usa en el Topbar)
  @Get('overview')
  getOverview(
    @CurrentUser() u: JwtPayload,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.service.getOverview(u.tenantId, from, to);
  }

  @Roles('OWNER', 'ADMIN')
  @Get('products')
  getProductRotation(
    @CurrentUser() u: JwtPayload,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: number,
  ) {
    return this.service.getProductRotation(u.tenantId, from, to, limit);
  }

  @Roles('OWNER', 'ADMIN')
  @Get('rubros')
  getRubroBreakdown(
    @CurrentUser() u: JwtPayload,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.service.getRubroBreakdown(u.tenantId, from, to);
  }

  @Roles('OWNER', 'ADMIN')
  @Get('sales')
  getSaleHistory(
    @CurrentUser() u: JwtPayload,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.service.getSaleHistory(u.tenantId, from, to, page, pageSize);
  }
}
