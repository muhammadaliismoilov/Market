import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { Transactions } from '../transactions/transaction.entity';
import { Users } from 'src/users/users.entity';
import { Products } from 'src/products/product.entity';

@Entity()
export class Branchs {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  location: string;

  @OneToMany(() => Transactions, (t) => t.branch)
  transactions: Transactions[];

  @OneToMany(() => Users, (user) => user.branch, {onDelete:'CASCADE'})
  user: Users[]

  @OneToMany(() => Products, (p) => p.branch, {onDelete:'CASCADE'})
  products:Products[]

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
