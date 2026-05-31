import { IsString, MinLength, MaxLength, IsOptional, Matches } from 'class-validator';

export class CreateRubroDto {
  @IsString() @MinLength(2) @MaxLength(40) name: string;

  @IsOptional()
  @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'Color debe ser hex (#rrggbb)' })
  color?: string;
}
