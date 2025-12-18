import { Transactions } from 'src/transactions/transaction.entity';
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

  @Column('float')
  totalDebt: number; // qancha qarzi bor

  @Column('float')
  repaidAmount: number; // qancha qaytarib bolgan

  @Column('float')
  remainingDebt: number; // totalDebt - repaidAmount

  @Column({ default: 'pending' }) // pending, partial, paid
  status: string;

  @Column({
    type: 'uuid',
    nullable: true,
    default: '00000000-0000-0000-0000-000000000000',
  })
  sessionId: string;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
