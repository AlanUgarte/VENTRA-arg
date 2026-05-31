import { IsEmail, IsEnum, IsString, MinLength, MaxLength } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsString() @MinLength(2) @MaxLength(80) name: string;
  @IsEmail() email: string;
  @IsString() @MinLength(6) @MaxLength(72) password: string;
  @IsEnum(Role) role: Role;
}
