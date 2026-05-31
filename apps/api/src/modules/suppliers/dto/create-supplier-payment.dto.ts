import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class CreateSupplierPaymentDto {
  @IsNumber({ maxDecimalPlaces: 2 }) @Min(0.01) amount: number;
  @IsString() method: string;
  @IsOptional() @IsString() reference?: string;
  @IsOptional() @IsString() paidAt?: string;
}
