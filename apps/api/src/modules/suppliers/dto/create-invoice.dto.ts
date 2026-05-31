import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PaymentCondition } from '@prisma/client';

export class CreateInvoiceDto {
  @IsString() invoiceNumber: string;
  @IsEnum(PaymentCondition) condition: PaymentCondition;
  @IsString() issuedAt: string;
  @IsOptional() @IsString() dueAt?: string;
  @IsNumber({ maxDecimalPlaces: 2 }) @Min(0.01) amount: number;
}
