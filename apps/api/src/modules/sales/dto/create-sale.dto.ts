import {
  IsEnum,
  IsArray,
  ValidateNested,
  IsString,
  IsInt,
  Min,
  Max,
  IsNumber,
  IsOptional,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SaleType } from '@prisma/client';

export class SaleLineDto {
  @IsString() productId: string;
  @IsInt() @Min(1) quantity: number;
}

export class CreateSaleDto {
  @IsEnum(SaleType) type: SaleType;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  discountPct?: number;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SaleLineDto)
  lines: SaleLineDto[];
}
