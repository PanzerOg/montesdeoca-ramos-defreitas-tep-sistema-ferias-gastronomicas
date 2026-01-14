import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from './entities/order.entity';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    return this.ordersService.create(createOrderDto, req.user.userId);
  }
    
  @Get('my-orders')
  @UseGuards(AuthGuard('jwt'))
  getMyOrders(@Request() req) {
    return this.ordersService.findAllByClient(req.user.userId);
  }

  @Get('stand-sales/:standId')
  @UseGuards(AuthGuard('jwt')) // Aquí podrias agregar @Roles('organizer', 'entrepreneur') si quisieras protegerlo más
  getStandSales(@Param('standId') standId: string, @Request() req) {
    return this.ordersService.findAllByStand(standId);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'))
  updateStatus(@Param('id') id: string, @Body('status') status: OrderStatus) {
    return this.ordersService.updateStatus(id, status);
  }

  // --- EL NUEVO ENDPOINT DE ESTADÍSTICAS ---
  @Get('stats/general')
  @UseGuards(AuthGuard('jwt'), RolesGuard) // Ahora sí reconocerá RolesGuard
  @Roles('organizer') // Ahora sí reconocerá Roles
  getStatistics() {
    return this.ordersService.getStatistics();
  }
}