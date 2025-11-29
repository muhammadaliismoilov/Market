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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
