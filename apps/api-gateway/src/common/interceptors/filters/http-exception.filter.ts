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
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Determinar el status code (si es desconocido, es 500)
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Obtener el mensaje de error
    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Loguear el error en consola (Rojo)
    this.logger.error(
      `Error en ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : '',
    );

    // Responder al cliente con formato JSON limpio
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: message,
    });
  }
}
