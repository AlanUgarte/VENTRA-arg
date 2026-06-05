import { IsString, MinLength, MaxLength, IsOptional, Matches } from 'class-validator';

export class UpdateTenantDto {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(100)
  name?: string;

  @IsOptional() @IsString() @MaxLength(30)
  phone?: string;

  @IsOptional() @IsString() @MaxLength(200)
  address?: string;

  @IsOptional() @IsString() @MaxLength(20)
  taxId?: string;
}
