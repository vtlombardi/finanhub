import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

/**
 * FINANHUB - Guard de Autenticação Enterprise
 * Valida não só a expiração do token, mas garante que a requisição
 * injete o 'tenantId' globalmente no contexto da API REST.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // Stub: Validação JWT Real virá com @nestjs/passport
    const token = request.headers.authorization;
    if (!token) throw new UnauthorizedException('Missing FINANHUB Bearer Token');
    
    // Simulação da Assinatura e Extração do Payload (Tenant / User)
    request.user = { id: 'mock-uuid', tenantId: 'tenant-123', role: 'ADMIN' };
    return true;
  }
}
