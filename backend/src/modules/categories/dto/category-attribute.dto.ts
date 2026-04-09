import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsIn, MaxLength } from 'class-validator';

// Espelha os tipos suportados por ListingAttributeValue (valueStr / valueNum / valueBool)
export const ATTRIBUTE_TYPES = ['TEXT', 'NUMBER', 'BOOLEAN', 'URL'] as const;
export type AttributeType = (typeof ATTRIBUTE_TYPES)[number];

export class CreateCategoryAttributeDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(64)
  name: string; // chave de máquina, ex: "annual_revenue"

  @IsNotEmpty()
  @IsString()
  @MaxLength(128)
  label: string; // label exibida ao usuário, ex: "Receita Anual"

  @IsNotEmpty()
  @IsIn(ATTRIBUTE_TYPES, { message: `type deve ser um de: ${ATTRIBUTE_TYPES.join(', ')}` })
  type: AttributeType;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;
}

export class UpdateCategoryAttributeDto {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  label?: string;

  @IsOptional()
  @IsIn(ATTRIBUTE_TYPES, { message: `type deve ser um de: ${ATTRIBUTE_TYPES.join(', ')}` })
  type?: AttributeType;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;
}
