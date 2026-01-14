import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { StandsService } from './stands.service';
import { CreateStandDto } from './dto/create-stand.dto';
import { UpdateStandDto } from './dto/update-stand.dto';
import { AuthGuard } from '@nestjs/passport';

interface RequestWithUser {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

@Controller('stands')
export class StandsController {
  constructor(private readonly standsService: StandsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(
    @Body() createStandDto: CreateStandDto,
    @Request() req: RequestWithUser,
  ) {
    if (req.user.role !== 'entrepreneur') {
      throw new ForbiddenException('Solo los emprendedores pueden crear puestos');
    }

    return this.standsService.create(createStandDto, req.user);
  }

  @Get()
  findAll() {
    return this.standsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.standsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id') id: string,
    @Body() updateStandDto: UpdateStandDto,
    @Request() req: RequestWithUser,
  ) {
    return this.standsService.update(id, updateStandDto, req.user);
  }

  @Patch(':id/approve')
  @UseGuards(AuthGuard('jwt'))
  approveStand(@Param('id') id: string, @Request() req: RequestWithUser) {
    if (req.user.role !== 'organizer') {
      throw new ForbiddenException(
        'Solo los organizadores pueden aprobar puestos',
      );
    }
    return this.standsService.approveStand(id);
  }

  @Patch(':id/toggle-active')
  @UseGuards(AuthGuard('jwt'))
  toggleActivation(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.standsService.toggleActivation(id, req.user);
  }

  @MessagePattern({ cmd: 'validate_stand_ownership' })
  async validateStandOwnership(data: { standId: string; userId: string }): Promise<{ valid: boolean; message?: string }> {
    const stand = await this.standsService.findOne(data.standId);
    
    if (!stand) return { valid: false, message: 'El puesto no existe.' };

    if (stand.entrepreneurId !== data.userId) {
      return { valid: false, message: 'No tienes permiso. Este puesto no te pertenece.' };
    }

    if (stand.status !== 'aprobado' && stand.status !== 'activo') {
      return { valid: false, message: `El puesto no está habilitado para gestionar productos (Estado: ${stand.status}).` };
    }

    return { valid: true };
  }

  @MessagePattern({ cmd: 'check_stand_exists' })
  async checkStandExists(@Payload() id: string): Promise<boolean> {
    try {
      const stand = await this.standsService.findOne(id);
      if (!stand) return false;
      return stand.status === 'activo' || stand.status === 'aprobado' || stand.status === 'pendiente';
    } catch (error) {
      return false;
    }
  }
}
