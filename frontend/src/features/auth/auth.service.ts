import { api } from '../../services/api.client';

export class AuthService {
  /** Comunica-se com POST /auth/login oficial do NestJS (Crypto bcrypt e DB validado) */
  static async login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    // O backend retonará { access_token, user: { id, email, tenantId, role } }
    return response.data;
  }

  /** Permite criar usuários vinculados ao Tenant B2B */
  static async register(fullName: string, email: string, password: string, tenantId: string) {
    const response = await api.post('/auth/register', { fullName, email, password, tenantId });
    return response.data;
  }

  static async getProfile() {
    const response = await api.get('/auth/me');
    return response.data;
  }
}
