import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateLeadDto {
  @IsUUID()
  listingId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  message: string;

  @IsOptional() @IsString() userName?: string;
  @IsOptional() @IsString() userEmail?: string;
  @IsOptional() @IsString() userPhone?: string;
  @IsOptional() @IsString() userCompany?: string;
  @IsOptional() @IsString() objective?: string;
  @IsOptional() @IsString() investmentRange?: string;
  
  @IsNotEmpty()
  mediationAccepted: boolean;
}

export class CreateProposalDto {
  @IsNumber()
  @Min(0)
  valueOffered: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  conditions?: string;
}

export class UpdateProposalStatusDto {
  @IsEnum(['OPEN', 'ACCEPTED', 'REJECTED', 'COUNTER_OFFER', 'WITHDRAWN'])
  status: string;
}
