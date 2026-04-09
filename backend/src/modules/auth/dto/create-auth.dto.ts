import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(64)
  password: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class VerifyEmailDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}

export class ResendVerificationDto {
  @IsEmail()
  email: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class AcceptInviteDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @MinLength(8)
  @MaxLength(64)
  password: string;
}

export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @MinLength(8)
  @MaxLength(64)
  newPassword: string;
}
