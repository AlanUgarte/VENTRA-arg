import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { ReturnReason } from '@prisma/client';

export class CreateReturnDto {
  @IsString() @MinLength(2) productName: string;
  @IsOptional() @IsString() productId?: string;
  @IsInt() @Min(1) quantity: number;
  @IsEnum(ReturnReason) reason: ReturnReason;
  @IsOptional() @IsString() reasonDetail?: string;
  @IsOptional() @IsString() notes?: string;
}

export class UpdateReturnDto {
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) creditAmount?: number;
  @IsOptional() @IsString() notes?: string;
}
