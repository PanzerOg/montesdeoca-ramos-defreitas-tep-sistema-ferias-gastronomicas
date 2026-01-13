import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersServiceController } from './users-service.controller';
import { UsersServiceService } from './users-service.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // 1. Configuracion de Variables de Entorno
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 2. Conexion a Base de Datos (Users DB)
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432, // Puerto del contenedor users-db
      username: 'root', // Usuario definido en docker-compose
      password: 'password123', // Contraseña definida en docker-compose
      database: 'users_db', // Nombre de la BD
      autoLoadEntities: true, // Carga automatica de entidades
      synchronize: true,
    }),

    UsersModule,

    AuthModule,
  ],
  controllers: [UsersServiceController],
  providers: [UsersServiceService],
})
export class UsersServiceModule {}
