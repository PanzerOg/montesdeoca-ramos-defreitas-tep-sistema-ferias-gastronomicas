import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum StandStatus {
  PENDING = 'pendiente',
  APPROVED = 'aprobado',
  ACTIVE = 'activo',
}

@Entity('stands')
export class Stand {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  location: string;

  @Column({ type: 'text' })
  entrepreneurId: string;

  @Column({
    type: 'enum',
    enum: StandStatus,
    default: StandStatus.PENDING,
  })
  status: StandStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
