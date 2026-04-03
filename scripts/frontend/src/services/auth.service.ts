export class AuthService {
  static async login(credentials: any) {
    console.log('[AUTH] Payload submetido');
    return { token: 'mock-jwt-token' };
  }
}
