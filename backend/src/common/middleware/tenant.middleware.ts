import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export interface TenantRequest extends Request {
  tenantId?: string;
  user?: any;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: TenantRequest, res: Response, next: NextFunction) {
    // 1. Tentar extrair o tenant_id do header
    let tenantId = req.headers['x-tenant-id'] as string;
    
    // 2. Se a rota envolver JWT, podemos extrair do token/usuário futuramente
    // Isso pode ser complementado no JwtStrategy.
    if (!tenantId && req.user && req.user.tenantId) {
      tenantId = req.user.tenantId;
    }
    
    // Por enquanto deixaremos passar nas rotas abertas, mas onde injetado, o tenant estará disponível.
    req.tenantId = tenantId;
    next();
  }
}
