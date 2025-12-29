import { NestFactory } from '@nestjs/core';
import { StandsServiceModule } from './stands-service.module';

async function bootstrap() {
  const app = await NestFactory.create(StandsServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
