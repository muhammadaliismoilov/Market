import { Branch } from "src/branchs/branch.entity";
import { Product } from "src/products/product.entity";
import { Users } from "src/users/users.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, UpdateDateColumn } from "typeorm";


@Entity()
export class Transaction {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Users, (u) => u.transactions)
  user: Users;

  @ManyToOne(() => Product)
  product: Product;

  @ManyToOne(() => Branch, (b) => b.transactions)
  branch: Branch;

  @Column("int")
  quantity: number;

  @Column("float")
  totalPrice: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
