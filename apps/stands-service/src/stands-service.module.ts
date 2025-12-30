import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StandsServiceController } from './stands-service.controller';
import { StandsServiceService } from './stands-service.service';
import { StandsModule } from './stands/stands.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './auth/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5434,
      username: 'root',
      password: 'password123',
      database: 'stands_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    StandsModule,
  ],
  controllers: [StandsServiceController],
  providers: [StandsServiceService, JwtStrategy],
})
export class StandsServiceModule {}
