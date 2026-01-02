// TO'G'RILANDI: Ishlatilmagan class-validator importlar o'chirildi (entity faylida kerak emas)
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  // TO'G'RILANDI: Ishlatilmagan ManyToOne, JoinColumn, ManyToMany importlar o'chirildi
} from 'typeorm';
// TO'G'RILANDI: Ishlatilmagan Transactions import o'chirildi (relation o'chirilgani uchun)

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

  // TO'G'RILANDI: ManyToMany relation o'chirildi, chunki ManyToMany bilan @JoinColumn ishlatilmaydi
  // Payment entity sessionId orqali transactionlar bilan bog'lanadi, shuning uchun relation kerak emas
  // Agar relation kerak bo'lsa, @JoinTable ishlatilishi kerak, lekin bu yerda sessionId orqali bog'lanishadi

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
