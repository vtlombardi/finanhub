import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user } = request;

    // Apenas logamos ações que alteram o estado (Mutações)
    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    
    // Ignora rotas de login/auth para não logar senhas (embora já hashes sejam usados)
    const isAuth = url.includes('/auth') || url.includes('/login');

    return next.handle().pipe(
      tap(async () => {
        if (isMutation && !isAuth && user?.tenantId) {
          try {
            await this.prisma.auditLog.create({
              data: {
                tenantId: user.tenantId,
                userId: user.id || null,
                action: `${method} ${url}`,
                entityType: this.extractEntityType(url),
                entityId: body?.id || request.params?.id || 'N/A',
                metadata: {
                  method,
                  url,
                  ip: request.ip,
                },
              },
            });
          } catch (error) {
            console.error('Failed to persist audit log:', error);
          }
        }
      }),
    );
  }

  private extractEntityType(url: string): string {
    const parts = url.split('/');
    // Tenta pegar o recurso principal (Ex: /api/listings/123 -> listings)
    return parts[2] || 'UNKNOWN';
  }
}
