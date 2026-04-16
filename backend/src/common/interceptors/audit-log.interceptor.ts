import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger('AuditLog');

  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, body, user } = request;
    const startTime = Date.now();

    // Apenas persistimos ações que alteram o estado (Mutações) no DB
    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    const isAuth = url.includes('/auth') || url.includes('/login');

    return next.handle().pipe(
      tap({
        next: (data: any) => {
          const durationMs = Date.now() - startTime;
          const statusCode = response.statusCode;

          // Log Estruturado no Console (Always)
          this.logger.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            context: 'AuditLog',
            userId: user?.id || 'anonymous',
            tenantId: user?.tenantId || 'none',
            method,
            url,
            action: this.extractAction(method, url),
            statusCode,
            durationMs,
            ip: request.ip,
          }));

          // Persistência em Banco (Apenas Mutações Relevantes)
          if (isMutation && !isAuth && user?.tenantId) {
            this.prisma.auditLog.create({
              data: {
                tenantId: user.tenantId,
                userId: user.id || null,
                action: `${method} ${url}`,
                entityType: this.extractEntityType(url),
                entityId: body?.id || request.params?.id || 'N/A',
                metadata: {
                  method,
                  url,
                  statusCode,
                  durationMs,
                  ip: request.ip,
                },
              },
            }).catch(err => this.logger.error('Failed to persist audit log to DB', err.stack));
          }
        },
        error: (err: any) => {
          const durationMs = Date.now() - startTime;
          const statusCode = err.status || 500;

          this.logger.error(JSON.stringify({
            timestamp: new Date().toISOString(),
            context: 'AuditLog',
            userId: user?.id || 'anonymous',
            tenantId: user?.tenantId || 'none',
            method,
            url,
            action: this.extractAction(method, url),
            statusCode,
            durationMs,
            error: err.message,
            ip: request.ip,
          }));
        }
      }),
    );
  }

  private extractAction(method: string, url: string): string {
    const parts = url.split('?')[0].split('/');
    const resource = parts[parts.length - 1] || parts[parts.length - 2] || 'root';
    return `${method}_${resource.toUpperCase()}`;
  }

  private extractEntityType(url: string): string {
    const parts = url.split('/');
    // Tenta pegar o recurso principal (Ex: /api/listings/123 -> listings)
    return parts[2] || 'UNKNOWN';
  }
}
