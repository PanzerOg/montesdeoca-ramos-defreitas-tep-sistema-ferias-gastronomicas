import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'pendiente',
  PREPARING = 'preparando',
  READY = 'listo',
  DELIVERED = 'entregado',
  CANCELLED = 'cancelado',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  userId: string;

  @Column('text')
  standId: string;
  
  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;
}