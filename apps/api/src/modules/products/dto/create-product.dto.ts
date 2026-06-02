import {
  IsString,
  IsNumber,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsInt,
  IsOptional,
} from 'class-validator';

export class CreateProductDto {
  @IsString() @MinLength(2) @MaxLength(120) name: string;
  @IsString() rubroId: string;

  @IsOptional() @IsString() @MaxLength(50) barcode?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  costoBase: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0) @Max(100)
  descCompra?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0) @Max(9999)
  ganancia?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;
}
