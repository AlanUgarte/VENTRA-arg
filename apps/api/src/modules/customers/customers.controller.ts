import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CreateCreditDto } from './dto/create-credit.dto';
import { CreateCustomerPaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('customers')
export class CustomersController {
  constructor(private service: CustomersService) {}

  @Get()
  findAll(@CurrentUser() u: JwtPayload, @Query('search') search?: string) {
    return this.service.findAll(u.tenantId, search);
  }

  @Get(':id')
  findOne(@CurrentUser() u: JwtPayload, @Param('id') id: string) {
    return this.service.findOne(u.tenantId, id);
  }

  @Post()
  create(@CurrentUser() u: JwtPayload, @Body() dto: CreateCustomerDto) {
    return this.service.create(u.tenantId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() u: JwtPayload,
    @Param('id') id: string,
    @Body() dto: Partial<CreateCustomerDto>,
  ) {
    return this.service.update(u.tenantId, id, dto);
  }

  @Post(':id/credits')
  createCredit(
    @CurrentUser() u: JwtPayload,
    @Param('id') id: string,
    @Body() dto: CreateCreditDto,
  ) {
    return this.service.createCredit(u.tenantId, id, dto);
  }

  @Post(':id/payments')
  createPayment(
    @CurrentUser() u: JwtPayload,
    @Param('id') id: string,
    @Body() dto: CreateCustomerPaymentDto,
  ) {
    return this.service.createPayment(u.tenantId, id, dto);
  }
}
