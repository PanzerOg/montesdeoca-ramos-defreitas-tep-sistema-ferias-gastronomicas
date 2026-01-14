import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './common/interceptors/interceptors/logging.interceptor'; // <--- Importar
import { AllExceptionsFilter } from './common/interceptors/filters/http-exception.filter'; // <--- Importar

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);

  // 1. Pipes Globales (Validación DTOs)
  app.useGlobalPipes(new ValidationPipe());

  // 2. Interceptores Globales (Logging)
  app.useGlobalInterceptors(new LoggingInterceptor());

  // 3. Filtros de Excepciones Globales (Manejo de errores)
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(process.env.port ?? 3000);
  console.log(
    'API Gateway corriendo en puerto 3000 con Logging y Filtros activos',
  );
}
bootstrap();
