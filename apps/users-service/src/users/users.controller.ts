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
import { Request as ExpressRequest } from 'express';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole, User } from './entities/user.entity';

interface UserPayload {
  sub: string;
  email: string;
  role: string;
  id?: string;
  userId?: string;
}

interface RequestWithUser extends ExpressRequest {
  user: UserPayload;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @MessagePattern({ cmd: 'create_user' })
  createTCP(@Payload() data: CreateUserDto) {
    return this.usersService.create(data);
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
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: RequestWithUser,
  ): Promise<User> {
    console.log('--- DEBUG UPDATE USER ---');
    console.log('ID en URL:', id);
    console.log('Usuario en Request:', req.user);

    const user = req.user;
    const requestingUserId = user.id || user.userId || user.sub;

    if (requestingUserId !== id && user.role !== 'organizer') {
      throw new ForbiddenException('No tienes permiso para editar este perfil');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const updatedUser = (await this.usersService.update(
      id,
      updateUserDto,
    )) as User;

    return updatedUser;
  }
}
