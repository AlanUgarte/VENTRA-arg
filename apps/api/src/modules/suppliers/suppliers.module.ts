import { Module } from '@nestjs/common';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';
import { ReturnsController } from './returns.controller';
import { ReturnsService } from './returns.service';

@Module({
  controllers: [SuppliersController, ReturnsController],
  providers: [SuppliersService, ReturnsService],
  exports: [SuppliersService, ReturnsService],
})
export class SuppliersModule {}
