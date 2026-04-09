import { api } from './api.client';
import { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  VerifyEmailRequest, 
  ResetPasswordRequest, 
  AcceptInviteRequest,
  User
} from '@shared/contracts';

export class AuthService {
  /** Comunica-se com POST /auth/login oficial do NestJS */
  static async login(request: LoginRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/login', request);
    return response.data;
  }

  /** Permite criar usuários vinculados ao Tenant B2B */
  static async register(request: RegisterRequest): Promise<any> {
    const response = await api.post('/auth/register', request);
    return response.data;
  }

  /** Valida o código de segurança enviado por e-mail */
  static async verifyEmail(request: VerifyEmailRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/verify-email', request);
    return response.data;
  }

  /** Solicita o reenvio do código de segurança */
  static async resendVerification(email: string): Promise<{ message: string }> {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  }

  static async acceptInvite(request: AcceptInviteRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/accept-invite', request);
    return response.data;
  }

  static async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  }

  static async resetPassword(request: ResetPasswordRequest): Promise<{ message: string }> {
    const response = await api.post('/auth/reset-password', request);
    return response.data;
  }

  static async getProfile(): Promise<User & { userId: string }> {
    const response = await api.get('/auth/me');
    return response.data;
  }

  static async refreshToken(): Promise<AuthResponse> {
    const response = await api.post('/auth/refresh');
    return response.data;
  }
}
