import { NestFactory } from '@nestjs/core';
import { ProductsServiceModule } from './products-service.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(ProductsServiceModule);
  
  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(process.env.PORT ?? 3003); 
  console.log(`Products Service corriendo en: http://localhost:3003`);
}
bootstrap();