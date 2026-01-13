import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from './entities/order.entity';

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
  @UseGuards(AuthGuard('jwt'))
  getStandSales(@Param('standId') standId: string, @Request() req) {
    return this.ordersService.findAllByStand(standId);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'))
  updateStatus(@Param('id') id: string, @Body('status') status: OrderStatus) {
    return this.ordersService.updateStatus(id, status);
  }
}