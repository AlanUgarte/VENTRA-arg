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
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreateSupplierPaymentDto } from './dto/create-supplier-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('suppliers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private service: SuppliersService) {}

  @Get()
  findAll(@CurrentUser() u: JwtPayload) {
    return this.service.findAll(u.tenantId);
  }

  @Get('invoices')
  getAllInvoices(@CurrentUser() u: JwtPayload, @Query('supplierId') supplierId?: string) {
    return this.service.getInvoices(u.tenantId, supplierId);
  }

  @Get(':id')
  findOne(@CurrentUser() u: JwtPayload, @Param('id') id: string) {
    return this.service.findOne(u.tenantId, id);
  }

  @Roles('OWNER', 'ADMIN')
  @Post()
  create(@CurrentUser() u: JwtPayload, @Body() dto: CreateSupplierDto) {
    return this.service.create(u.tenantId, dto);
  }

  @Roles('OWNER', 'ADMIN')
  @Patch(':id')
  update(
    @CurrentUser() u: JwtPayload,
    @Param('id') id: string,
    @Body() dto: Partial<CreateSupplierDto>,
  ) {
    return this.service.update(u.tenantId, id, dto);
  }

  @Roles('OWNER', 'ADMIN')
  @Post(':id/invoices')
  createInvoice(
    @CurrentUser() u: JwtPayload,
    @Param('id') id: string,
    @Body() dto: CreateInvoiceDto,
  ) {
    return this.service.createInvoice(u.tenantId, id, dto);
  }

  @Roles('OWNER', 'ADMIN')
  @Post('invoices/:invoiceId/payments')
  createPayment(
    @CurrentUser() u: JwtPayload,
    @Param('invoiceId') invoiceId: string,
    @Body() dto: CreateSupplierPaymentDto,
  ) {
    return this.service.createPayment(u.tenantId, invoiceId, dto);
  }
}
