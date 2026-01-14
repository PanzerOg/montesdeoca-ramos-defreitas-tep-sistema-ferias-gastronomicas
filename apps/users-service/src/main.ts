import { NestFactory } from '@nestjs/core';
import { UsersServiceModule } from './users-service.module';
import { ValidationPipe } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  // 1. Crear la aplicación híbrida (HTTP + Microservicio)
  const app = await NestFactory.create(UsersServiceModule);

  // 2. Conectar el microservicio TCP
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: 3011,
    },
  });

  app.useGlobalPipes(new ValidationPipe());

  await app.startAllMicroservices();
  await app.listen(process.env.port ?? 3001);
  console.log('Users Service corriendo en TCP y HTTP: 3001');
}
bootstrap();
