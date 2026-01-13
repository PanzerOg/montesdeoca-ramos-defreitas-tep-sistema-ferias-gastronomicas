import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices'; // Importar
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    ClientsModule.register([
      {
        name: 'STANDS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 3005,        
        },
      },
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}