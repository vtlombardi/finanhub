import { IsNotEmpty, IsOptional, IsString, MaxLength, Matches } from 'class-validator';

export class CreateCompanyDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  tradeName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Matches(/^[a-z0-9-]+$/, { message: 'slug deve conter apenas letras minúsculas, números e hífens' })
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  document?: string;
}

export class UpdateCompanyDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  tradeName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  document?: string;
}
