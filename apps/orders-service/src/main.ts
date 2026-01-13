import { NestFactory } from '@nestjs/core';
import { OrdersServiceModule } from './orders-service.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(OrdersServiceModule);
  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(process.env.PORT ?? 3004);
  console.log(`Orders Service corriendo en: http://localhost:3004`);
}
bootstrap();