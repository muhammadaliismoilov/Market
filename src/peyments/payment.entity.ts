import {
  IsArray,
  IsEnum,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Transactions } from '../transactions/transaction.entity'; // mavjud transaction entity yo'lini tekshiring

export enum PaymentMethod {
  CASH = 'naqt',
  CLICK = 'click',
  TERMINAL = 'terminal',
  DEBT = 'qarzdorlik',
}

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToMany(() => Transactions, (transaction) => transaction.payments, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'transactionId' })
  transaction?: Transactions;

  @Column()
  sessionId: string;

  @Column('json')
  items: {
    barcode: string;
    transactionNumber: string;
    quantity: number;
    weight: number;
    subtotal: number;
  }[];

  @Column('decimal', { precision: 12, scale: 2 })
  totalSum: number;

  @Column('json', { nullable: true })
  paidBreakdown?: {
    cash?: number;
    click?: number;
    terminal?: number;
    debt?: number;
  };

  @Column('json')
  payments: { method: PaymentMethod; amount: number }[];

  @Column({ default: false })
  fullyPaid: boolean;

  @Column({ nullable: true })
  userId?: string;

  @Column({ nullable: true })
  branchId?: string;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
