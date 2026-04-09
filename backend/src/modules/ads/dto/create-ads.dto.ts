import { IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export enum AdPosition {
  LEADERBOARD = 'LEADERBOARD',
  MOBILE_BANNER = 'MOBILE_BANNER',
  SIDEBAR = 'SIDEBAR',
}

export class CreateAdDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  title: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsNotEmpty()
  @IsUrl()
  linkUrl: string;

  @IsNotEmpty()
  @IsEnum(AdPosition)
  position: AdPosition;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @IsOptional()
  @IsString()
  tenantId?: string;
}

export class UpdateAdDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  title?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsUrl()
  linkUrl?: string;

  @IsOptional()
  @IsEnum(AdPosition)
  position?: AdPosition;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;
}
