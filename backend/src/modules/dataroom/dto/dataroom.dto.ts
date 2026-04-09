import { IsNotEmpty, IsOptional, IsString, IsIn, MaxLength } from 'class-validator';

export class RequestDataRoomAccessDto {
  @IsNotEmpty()
  @IsString()
  listingId: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}

export class UpdateDataRoomRequestDto {
  @IsNotEmpty()
  @IsIn(['APPROVED', 'REJECTED'])
  status: 'APPROVED' | 'REJECTED';
}

export class CreateDataRoomDocumentDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @IsNotEmpty()
  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  mediaType?: string;
}
