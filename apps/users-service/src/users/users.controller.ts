import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from './entities/user.entity';

interface RequestWithUser {
  user: {
    sub: string;
    email: string;
    role: string;
  };
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // --- ENDPOINT PROTEGIDO DE PRUEBA ---
  @Get('profile')
  @UseGuards(AuthGuard('jwt'), RolesGuard) // 1. Valida Token, 2. Valida Rol
  @Roles(UserRole.CLIENT, UserRole.ENTREPRENEUR, UserRole.ORGANIZER) // Permite a todos los roles logueados
  getProfile(@Request() req: RequestWithUser) {
    return {
      message: 'Acceso autorizado',
      user_data: req.user, // Aquí vienen los datos del token decodificado
    };
  }
}
