import { NestFactory } from '@nestjs/core';
import { ProductsServiceModule } from './products-service.module';
import { ValidationPipe } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices'; // <--- Importante

async function bootstrap() {
  const app = await NestFactory.create(ProductsServiceModule);
  
  app.useGlobalPipes(new ValidationPipe());
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: 3006, 
    },
  });

  await app.startAllMicroservices();
  
  await app.listen(process.env.PORT ?? 3003); 
  console.log(`Products Service HTTP: 3003 | TCP: 3006`);
}
bootstrap();