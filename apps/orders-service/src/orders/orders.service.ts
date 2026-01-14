import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderStatus } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @Inject('PRODUCTS_SERVICE') private readonly productsClient: ClientProxy,
    @Inject('STANDS_SERVICE') private readonly standsClient: ClientProxy,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: string) {
    const { standId, items } = createOrderDto;

    const standValid = await lastValueFrom(
      this.standsClient.send({ cmd: 'check_stand_exists' }, standId)
    );
    if (!standValid) throw new BadRequestException('El puesto no existe o no está disponible.');
    let validatedItems;
    try {
      validatedItems = await lastValueFrom(
        this.productsClient.send({ cmd: 'validate_products' }, items)
      );
    } catch (error) {
      throw new BadRequestException(error.message || 'Error validando productos');
    }

    const total = validatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const order = this.orderRepository.create({
      userId,
      standId,
      total,
      status: OrderStatus.PENDING,
      items: validatedItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price 
      }))
    });

    const savedOrder = await this.orderRepository.save(order);

    try {
      await lastValueFrom(
        this.productsClient.send({ cmd: 'reduce_stock' }, items)
      );
    } catch (error) {
      console.error('CRITICAL: Stock not reduced for order ' + savedOrder.id);
    }

    return savedOrder;
  }

  findAllByClient(userId: string) {
    return this.orderRepository.find({
      where: { userId },
      relations: ['items'],
      order: { createdAt: 'DESC' }
    });
  }

  findAllByStand(standId: string) {
    return this.orderRepository.find({
      where: { standId },
      relations: ['items'],
      order: { createdAt: 'DESC' }
    });
  }

  async updateStatus(id: string, status: OrderStatus) {
    await this.orderRepository.update(id, { status });
    return this.findOne(id);
  }

  findOne(id: string) {
    return this.orderRepository.findOne({ where: { id }, relations: ['items'] });
  }

  async getStatistics() {
    const totalSales = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total)', 'revenue')
      .addSelect('COUNT(order.id)', 'count')
      .where('order.status = :status', { status: 'entregado' })
      .getRawOne();

    const topProducts = await this.orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.items', 'item')
        .select('item.productId', 'productId')
        .addSelect('SUM(item.quantity)', 'totalSold')
        .groupBy('item.productId')
        .orderBy('"totalSold"', 'DESC') 
        .limit(3)
        .getRawMany();

    const salesByDay = await this.orderRepository
      .createQueryBuilder('order')
      .select("TO_CHAR(order.createdAt, 'YYYY-MM-DD')", 'date')
      .addSelect('SUM(order.total)', 'dailyRevenue')
      .where('order.status = :status', { status: 'entregado' })
      .groupBy('date')
      .orderBy('date', 'ASC')
      .limit(7)
      .getRawMany();

    return {
      revenue: totalSales && totalSales.revenue ? parseFloat(totalSales.revenue) : 0,
      completedOrders: totalSales && totalSales.count ? parseInt(totalSales.count, 10) : 0,
      topProducts: topProducts.map(p => ({ productId: p.productId, totalSold: parseInt(p.totalSold, 10) })),
      salesByDay
    };
  }
}
