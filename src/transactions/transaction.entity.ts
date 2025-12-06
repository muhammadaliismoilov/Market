// import { Branchs } from "src/branchs/branch.entity";
// import { Products } from "src/products/product.entity";
// import { Users } from "src/users/users.entity";
// import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, UpdateDateColumn } from "typeorm";


// @Entity()
// export class Transactions {
//   @PrimaryGeneratedColumn("uuid")
//   id: string;

//   @ManyToOne(() => Users, (u) => u.transactions)
//   user: Users;

//   @ManyToOne(() => Products)
//   product: Products;

//   @ManyToOne(() => Branchs, (b) => b.transactions)
//   branch: Branchs;

//   @Column("int")
//   quantity: number;

//   @Column("float")
//   totalPrice: number;

//   @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
//   createdAt: Date;

//   @UpdateDateColumn({ name: 'updated_at' })
//   updatedAt: Date;
// }

import { Branchs } from "src/branchs/branch.entity";
import { Products } from "src/products/product.entity";
import { Users } from "src/users/users.entity";
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  CreateDateColumn, 
  UpdateDateColumn,
  JoinColumn 
} from "typeorm";

export enum TransactionType {
  SALE = 'SALE',
  RETURN = 'RETURN'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

@Entity()
export class Transactions {
  @PrimaryGeneratedColumn("uuid")
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
    default: TransactionType.SALE
  })
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING
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