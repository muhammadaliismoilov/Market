import { Branchs } from 'src/branchs/branch.entity';
import { Debt } from 'src/debt/debt.entity';
// TO'G'RILANDI: Ishlatilmagan Payment import o'chirildi (relation o'chirilgani uchun)
import { Products } from 'src/products/product.entity';
import { Users } from 'src/users/users.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  // TO'G'RILANDI: Ishlatilmagan ManyToMany import o'chirildi
  OneToMany,
} from 'typeorm';

export enum TransactionType {
  SALE = 'SALE',
  RETURN = 'RETURN',
}

export enum TransactionStatus {
  DEBT = 'DEBT',
  PARTIAL ='PARTIAL',
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity()
export class Transactions {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Users, (u) => u.transactions)
  @JoinColumn({ name: 'userId' })
  user: Users;

  @ManyToOne(() => Products)
  @JoinColumn({ name: 'productId' })
  product: Products;

  @ManyToOne(() => Branchs, (b) => b.transactions)
  @JoinColumn({ name: 'branchId' })
  branch: Branchs;

  // TO'G'RILANDI: ManyToMany relation o'chirildi, chunki Payment entity da ham o'chirildi
  // Payment va Transaction sessionId orqali bog'lanadi, shuning uchun relation kerak emas
  // @ManyToMany(() => Payment, (payment) => payment.transaction)
  // payments: Payment[];

  @Column({ type: 'varchar', unique: true })
  transactionNumber: string; // Unikal tranzaksiya raqami


  @Column({ type: 'varchar' })
  barcode: string;

  @Column({ type: 'int', nullable: true })
  quantity: number; // Dona bilan sotiladigan mahsulotlar uchun

  @Column({ type: 'float', nullable: true })
  weight: number; // Kg bilan sotiladigan mahsulotlar uchun

  @Column({ type: 'float' })
  unitPrice: number; // Bitta mahsulotning narxi

  @Column({ type: 'float' })
  totalPrice: number; // Umumiy narx (quantity * unitPrice yoki weight * unitPrice)

  @Column({
    type: 'enum',
    enum: TransactionType,
    default: TransactionType.SALE,
  })
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ type: 'varchar', nullable: true })
  sessionId: string; // Bir xil vaqtda sotilgan mahsulotlarni guruhlash uchun

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
