import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  fullName: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(64)
  password: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}

export class InviteMemberDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  fullName: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
