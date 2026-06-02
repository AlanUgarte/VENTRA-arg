import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ReturnsService } from './returns.service';
import { CreateReturnDto, UpdateReturnDto } from './dto/create-return.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('returns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('returns')
export class ReturnsController {
  constructor(private service: ReturnsService) {}

  @Get('stats')
  getStats(@CurrentUser() u: JwtPayload) {
    return this.service.getStats(u.tenantId);
  }

  @Get()
  findAll(
    @CurrentUser() u: JwtPayload,
    @Query('supplierId') supplierId?: string,
    @Query('status') status?: string,
  ) {
    return this.service.findAll(u.tenantId, supplierId, status);
  }

  @Roles('OWNER', 'ADMIN')
  @Post('supplier/:supplierId')
  create(
    @CurrentUser() u: JwtPayload,
    @Param('supplierId') supplierId: string,
    @Body() dto: CreateReturnDto,
  ) {
    return this.service.create(u.tenantId, supplierId, dto);
  }

  @Roles('OWNER', 'ADMIN')
  @Patch(':id')
  update(
    @CurrentUser() u: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateReturnDto,
  ) {
    return this.service.update(u.tenantId, id, dto);
  }

  @Roles('OWNER', 'ADMIN')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() u: JwtPayload, @Param('id') id: string) {
    return this.service.remove(u.tenantId, id);
  }
}
