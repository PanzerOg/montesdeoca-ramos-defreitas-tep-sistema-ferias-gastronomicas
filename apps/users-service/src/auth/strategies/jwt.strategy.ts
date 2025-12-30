import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // eslint-disable-next-line prettier/prettier
      secretOrKey: configService.get<string>('JWT_SECRET') || 'CLAVE_SECRETA_SUPER_SEGURA',
    });
  }

  async validate(payload: { email: string }) {
    // Validación defensiva del payload
    console.log('--- JWT STRATEGY VALIDATE ---'); // <--- LOG 1
    console.log('Payload recibido:', payload); // <--- LOG 2
    if (!payload || !payload.email) {
      console.log('Error: Payload inválido');
      throw new UnauthorizedException('Token inválido: falta email');
    }

    const user = await this.usersService.findOneByEmail(payload.email);

    if (!user) {
      console.log('Error: Usuario no encontrado en BD para:', payload.email);
      throw new UnauthorizedException('Usuario no encontrado o inactivo');
    }

    // Retornamos el usuario sin el password
    console.log('Usuario validado correctamente:', user.email);
    const { password, ...result } = user;
    void password;
    return result;
  }
}
