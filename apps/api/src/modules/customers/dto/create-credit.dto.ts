import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
  MinLength,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreditLineDto {
  @IsOptional() @IsString() productId?: string;
  @IsInt() @Min(1) quantity: number;
  @IsOptional() @IsString() @MinLength(1) concept?: string;
  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) fixedPrice?: number;
}

export class CreateCreditDto {
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0) @Max(100)
  discountPct?: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreditLineDto)
  lines: CreditLineDto[];
}
