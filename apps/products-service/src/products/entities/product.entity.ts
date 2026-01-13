import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('text')
  category: string; 

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('int')
  stock: number;

  @Column('boolean', { default: true })
  isActive: boolean;

  @Column('text')
  standId: string;

  @Column('text', { nullable: true })
  image: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}