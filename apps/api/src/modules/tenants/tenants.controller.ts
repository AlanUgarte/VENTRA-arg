import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { SkipSubscription } from '../../common/guards/subscription.guard';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

class CreatePaymentMethodDto {
  @IsString() @MinLength(2) name: string;
}

@ApiTags('tenants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private service: TenantsService) {}

  @SkipSubscription()
  @Get('me')
  getMe(@CurrentUser() user: JwtPayload) {
    return this.service.findOne(user.tenantId);
  }

  @Roles('OWNER', 'ADMIN')
  @Patch('me')
  update(@CurrentUser() user: JwtPayload, @Body() dto: UpdateTenantDto) {
    return this.service.update(user.tenantId, dto);
  }

  @Get('me/payment-methods')
  getPaymentMethods(@CurrentUser() user: JwtPayload) {
    return this.service.getPaymentMethods(user.tenantId);
  }

  @Roles('OWNER', 'ADMIN')
  @Post('me/payment-methods')
  createPaymentMethod(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreatePaymentMethodDto,
  ) {
    return this.service.createPaymentMethod(user.tenantId, dto.name);
  }

  @Roles('OWNER', 'ADMIN')
  @Delete('me/payment-methods/:id')
  deletePaymentMethod(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.service.deletePaymentMethod(user.tenantId, id);
  }
}
