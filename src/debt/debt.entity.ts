import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Debt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column()
  phone: string;

  @Column('decimal', { precision: 12, scale: 2 })
  totalDebt: number; // qancha qarzi bor

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  repaidAmount: number; // qancha qaytarib bolgan

  @Column('decimal', { precision: 12, scale: 2 })
  remainingDebt: number; // totalDebt - repaidAmount

  @Column({ default: 'pending' }) // pending, partial, paid
  status: string;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
