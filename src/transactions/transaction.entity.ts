import { Branchs } from "src/branchs/branch.entity";
import { Products } from "src/products/product.entity";
import { Users } from "src/users/users.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, UpdateDateColumn } from "typeorm";


@Entity()
export class Transactions {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Users, (u) => u.transactions)
  user: Users;

  @ManyToOne(() => Products)
  product: Products;

  @ManyToOne(() => Branchs, (b) => b.transactions)
  branch: Branchs;

  @Column("int")
  quantity: number;

  @Column("float")
  totalPrice: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
