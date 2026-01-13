import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { PassportModule } from '@nestjs/passport';
import { ProductsServiceController } from './products-service.controller';
import { ProductsServiceService } from './products-service.service';
import { ProductsModule } from './products/products.module';
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
      database: 'products_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    PassportModule,
    ProductsModule,
  ],
  controllers: [ProductsServiceController],
  providers: [
    ProductsServiceService,
    JwtStrategy,
  ],
})
export class ProductsServiceModule {}