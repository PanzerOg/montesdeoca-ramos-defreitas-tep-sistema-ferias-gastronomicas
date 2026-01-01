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
}
