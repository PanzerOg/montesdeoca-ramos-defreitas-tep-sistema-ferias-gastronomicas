import {
  Controller,
  Post,
  Body,
  Inject,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

export class CreateUserDto {
  [key: string]: unknown;
}

interface MicroserviceError {
  message?: string;
  status?: number;
}

// 1. Definimos una interfaz para la respuesta exitosa del microservicio
// Esto reemplaza el 'any' que retorna el .send() por defecto
interface UserResponse {
  id: number;
  email: string;
  createdAt: string;
  // Agrega aquí las propiedades que tu microservicio retorna realmente
}

@Controller()
export class ApiGatewayController {
  constructor(
    @Inject('USERS_SERVICE') private readonly usersClient: ClientProxy,
  ) {}

  @Post('auth/register')
  async registerUser(@Body() createUserDto: CreateUserDto) {
    try {
      // 2. Usamos el genérico .send<UserResponse>
      // Ahora 'response' será de tipo 'UserResponse' en lugar de 'any'
      const response = await firstValueFrom(
        this.usersClient.send<UserResponse>(
          { cmd: 'create_user' },
          createUserDto,
        ),
      );

      return response;
    } catch (unknownError) {
      const error = unknownError as MicroserviceError;

      throw new HttpException(
        error.message || 'Error en el microservicio de usuarios',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
