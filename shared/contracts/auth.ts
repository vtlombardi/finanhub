import { User, UserRole } from './user';

export interface TokenPayload {
  sub: string;
  email: string;
  tenantId: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface AcceptInviteRequest {
  email: string;
  code: string;
  password: string;
}
