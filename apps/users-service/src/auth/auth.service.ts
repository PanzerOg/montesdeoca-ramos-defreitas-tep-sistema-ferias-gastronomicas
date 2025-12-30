import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto'; // Lo crearemos en el siguiente paso

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // 1. Validar usuario y contraseña
  async validateUser(
    email: string,
    pass: string,
  ): Promise<{ id: any; email: string; role: any; password?: string } | null> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const result = { ...user };
      delete (result as { password?: string }).password;
      return result;
    }
    return null;
  }

  // 2. Generar el Token (Login)
  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Payload: datos que viajan dentro del token
    const payload = {
      sub: String(user.id),
      email: user.email,
      role: String(user.role),
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: user, // Opcional: devolver datos del usuario junto al token
    };
  }
}
