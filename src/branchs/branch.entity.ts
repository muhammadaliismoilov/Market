import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Transaction } from "../transactions/transaction.entity";

@Entity()
export class Branch {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  location: string;

  @OneToMany(() => Transaction, (t) => t.branch)
  transactions: Transaction[];
}
