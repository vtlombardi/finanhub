import { IsString, IsOptional, IsNumber, IsDecimal, IsArray, IsInt, Min, Max, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class FeatureDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  iconClass?: string;
}

class BusinessHourDto {
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @IsString()
  openTime: string;

  @IsString()
  closeTime: string;
}

class ListingMediaDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  url: string;

  @IsString()
  mediaType: 'IMAGE' | 'VIDEO' | 'DOCUMENT';

  @IsOptional()
  @IsBoolean()
  isCover?: boolean;
}

export class CreateListingDto {
  @IsString()
  title: string;

  @IsOptional() @IsString() subtitle?: string;

  @IsOptional() @IsString() slug?: string;

  @IsString() description: string;

  @IsOptional() @IsNumber() price?: number;

  @IsString() categoryId: string;

  @IsString() companyId: string;

  // Localização
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() neighborhood?: string;
  @IsOptional() @IsString() addressLine1?: string;
  @IsOptional() @IsString() addressLine2?: string;
  @IsOptional() @IsString() zipCode?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsString() addressReference?: string;

  // Contato
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() websiteUrl?: string;
  @IsOptional() @IsString() phonePrimary?: string;
  @IsOptional() @IsString() phoneSecondary?: string;

  // Sociais
  @IsOptional() @IsString() facebookUrl?: string;
  @IsOptional() @IsString() instagramUrl?: string;
  @IsOptional() @IsString() twitterUrl?: string;
  @IsOptional() @IsString() linkedinUrl?: string;
  @IsOptional() @IsString() tiktokUrl?: string;

  // Financeiro e Métricas (Padronizados)
  @IsOptional() @IsNumber() annualRevenue?: number;
  @IsOptional() @IsNumber() ebitda?: number;
  @IsOptional() @IsNumber() ebitdaMargin?: number;
  @IsOptional() @IsNumber() avgTicket?: number;
  @IsOptional() @IsNumber() investmentValue?: number;

  // Operacional e Negócio
  @IsOptional() @IsInt() employeesCount?: number;
  @IsOptional() @IsInt() marketTime?: number;
  @IsOptional() @IsInt() clientBaseCount?: number;
  @IsOptional() @IsString() revenueModel?: string;
  @IsOptional() @IsString() valuationMethod?: string;
  @IsOptional() @IsString() reasonForSale?: string;
  @IsOptional() @IsString() operationStructure?: string;
  @IsOptional() @IsString() buyerProfile?: string;
  @IsOptional() @IsString() nextSteps?: string;
  @IsOptional() @IsString() confidentialityNote?: string;

  // SEO
  @IsOptional() @IsString() seoTitle?: string;
  @IsOptional() @IsString() seoKeywords?: string;
  @IsOptional() @IsString() seoDescription?: string;

  // Mídia
  @IsOptional() @IsString() logoUrl?: string;
  @IsOptional() @IsString() videoUrl?: string;
  @IsOptional() @IsString() videoDescription?: string;

  // Relações
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeatureDto)
  features?: FeatureDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BusinessHourDto)
  businessHours?: BusinessHourDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ListingMediaDto)
  media?: ListingMediaDto[];
}

export class UpdateListingDto extends CreateListingDto {}
