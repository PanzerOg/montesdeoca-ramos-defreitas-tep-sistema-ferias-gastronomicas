import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Patch,
  Param,
  ForbiddenException,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
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

  @Get('profile')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.CLIENT, UserRole.ENTREPRENEUR, UserRole.ORGANIZER)
  getProfile(@Request() req: RequestWithUser) {
    return {
      message: 'Acceso autorizado',
      user_data: req.user,
    };
  }


  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  update(
    @Param('id') id: string, 
    @Body() updateUserDto: UpdateUserDto, 
    @Request() req: any 
  ) {
    console.log('--- DEBUG UPDATE USER ---');
    console.log('ID en URL:', id);
    console.log('Usuario en Request:', req.user);

    const user = req.user;
    const requestingUserId = user.id || user.userId || user.sub; 

    console.log('ID extraído del Token:', requestingUserId);
    console.log('¿Coinciden?', requestingUserId === id);
    console.log('-------------------------');

    if (requestingUserId !== id && user.role !== 'organizer') {
      throw new ForbiddenException('No tienes permiso para editar este perfil');
    }

    return this.usersService.update(id, updateUserDto);
  }
}
