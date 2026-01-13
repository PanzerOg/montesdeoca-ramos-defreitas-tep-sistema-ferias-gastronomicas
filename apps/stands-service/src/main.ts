import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { StandsServiceModule } from './stands-service.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(StandsServiceModule);
  app.useGlobalPipes(new ValidationPipe());

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: 3005, 
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.port ?? 3002);
  console.log('Stands Service HTTP: 3002 | TCP: 3005');
}
bootstrap();