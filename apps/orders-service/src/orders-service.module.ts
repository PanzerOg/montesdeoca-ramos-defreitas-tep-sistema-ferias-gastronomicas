import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { OrdersServiceController } from './orders-service.controller';
import { OrdersServiceService } from './orders-service.service';
import { OrdersModule } from './orders/orders.module';
import { JwtStrategy } from './orders/dto/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5435,
      username: 'root',
      password: 'password123',
      database: 'orders_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    PassportModule, // <--- REGISTRAR AQUÍ
    OrdersModule,
  ],
  controllers: [OrdersServiceController],
  providers: [
    OrdersServiceService, 
    JwtStrategy // <--- PROVEEDOR AQUÍ
  ],
})
export class OrdersServiceModule {}