import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { UsersServiceModule } from './users-service.module';

async function bootstrap() {
  const app = await NestFactory.create(UsersServiceModule);

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 3001);
  console.log('Users Service corriendo en: http://localhost:3001');
}
bootstrap();
