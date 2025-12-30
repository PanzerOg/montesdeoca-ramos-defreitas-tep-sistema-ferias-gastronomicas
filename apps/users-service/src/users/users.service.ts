import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { password, ...userData } = createUserDto;

      // 1. Encriptar la contraseña (10 rondas de sal)
      const hashedPassword = await bcrypt.hash(password, 10);

      // 2. Crear la instancia del usuario
      const user = this.userRepository.create({
        ...userData,
        password: hashedPassword,
      });

      // 3. Guardar en base de datos
      await this.userRepository.save(user);

      // 4. Retornar usuario (sin la contraseña por seguridad, gracias al select: false de la entidad)
      return user;
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  // Método auxiliar para buscar por email (lo usaremos en el Login)
  async findOneByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'role', 'name', 'isActive'], // Necesitamos el password para comparar en login
    });
  }

  // Manejo de errores de Base de Datos
  private handleDBErrors(error: unknown): never {
    // Narrow unknown to object and check for 'code' property safely
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const err = error as { code?: string };
      if (err.code === '23505') {
        throw new BadRequestException(
          'El correo electrónico ya está registrado',
        );
      }
    }
    console.error(error);
    throw new InternalServerErrorException(
      'Error inesperado, revise los logs del servidor',
    );
  }
}
