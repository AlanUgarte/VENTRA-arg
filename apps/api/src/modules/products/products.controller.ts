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
  ParseBoolPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateRubroDto } from './dto/create-rubro.dto';
import { AddStockDto } from './dto/add-stock.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('products')
export class ProductsController {
  constructor(private service: ProductsService) {}

  // ── Rubros ───────────────────────────────────────

  @Get('rubros')
  getRubros(@CurrentUser() u: JwtPayload) {
    return this.service.getRubros(u.tenantId);
  }

  @Roles('OWNER', 'ADMIN')
  @Post('rubros')
  createRubro(@CurrentUser() u: JwtPayload, @Body() dto: CreateRubroDto) {
    return this.service.createRubro(u.tenantId, dto);
  }

  @Roles('OWNER', 'ADMIN')
  @Patch('rubros/:id')
  updateRubro(
    @CurrentUser() u: JwtPayload,
    @Param('id') id: string,
    @Body() dto: Partial<CreateRubroDto>,
  ) {
    return this.service.updateRubro(u.tenantId, id, dto);
  }

  @Roles('OWNER', 'ADMIN')
  @Delete('rubros/:id')
  deleteRubro(@CurrentUser() u: JwtPayload, @Param('id') id: string) {
    return this.service.deleteRubro(u.tenantId, id);
  }

  // ── Products ─────────────────────────────────────

  @Get()
  findAll(
    @CurrentUser() u: JwtPayload,
    @Query('rubroId') rubroId?: string,
    @Query('all', new DefaultValuePipe(false), ParseBoolPipe) all?: boolean,
  ) {
    return this.service.findAll(u.tenantId, rubroId, !all);
  }

  @Get(':id')
  findOne(@CurrentUser() u: JwtPayload, @Param('id') id: string) {
    return this.service.findOne(u.tenantId, id);
  }

  @Roles('OWNER', 'ADMIN')
  @Post()
  create(@CurrentUser() u: JwtPayload, @Body() dto: CreateProductDto) {
    return this.service.create(u.tenantId, dto);
  }

  @Roles('OWNER', 'ADMIN')
  @Patch(':id')
  update(
    @CurrentUser() u: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.service.update(u.tenantId, id, dto);
  }

  @Roles('OWNER', 'ADMIN', 'CASHIER')
  @Patch(':id/stock')
  addStock(
    @CurrentUser() u: JwtPayload,
    @Param('id') id: string,
    @Body() dto: AddStockDto,
  ) {
    return this.service.addStock(u.tenantId, id, dto);
  }

  @Roles('OWNER', 'ADMIN')
  @Delete(':id')
  remove(@CurrentUser() u: JwtPayload, @Param('id') id: string) {
    return this.service.remove(u.tenantId, id);
  }
}
