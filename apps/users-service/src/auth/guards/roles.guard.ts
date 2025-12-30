import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { Request } from 'express';

interface AuthRequest extends Request {
  user?: { role: UserRole };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Obtener los roles requeridos desde el decorador @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si no se requiere ningún rol específico, permitimos el acceso
    if (!requiredRoles) {
      return true;
    }

    // 2. Obtener el usuario desde el request (inyectado por JwtStrategy)
    const { user } = context.switchToHttp().getRequest<AuthRequest>();

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // 3. Verificar si el rol del usuario está en la lista de permitidos
    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException(
        `No tienes permisos. Se requiere: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
