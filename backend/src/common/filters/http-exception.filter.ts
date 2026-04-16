import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('GlobalExceptionFilter');

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = 
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Erro interno do servidor', statusCode: status };

    const message = typeof exceptionResponse === 'object' 
      ? (exceptionResponse as any).message || 'Erro inesperado'
      : exceptionResponse;

    const errorResponse = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: Array.isArray(message) ? message[0] : message, // Simplifica mensagens de validação
    };

    // Log estruturado para o servidor
    this.logger.error(JSON.stringify({
      context: 'GlobalExceptionFilter',
      ...errorResponse,
      stack: exception.stack,
      userId: (request as any).user?.id || 'anonymous',
    }));

    response.status(status).json(errorResponse);
  }
}
