import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Transactions } from '../transactions/transaction.entity';
import { Branchs } from 'src/branchs/branch.entity';

export enum UserRole {
  ADMIN = 'admin',
  CASHIER = 'cashier',
}

@Entity()
export class Users {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  phone: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CASHIER,
  })
  role: UserRole;

  @OneToMany(() => Transactions, (t) => t.user)
  transactions: Transactions[];

  @ManyToOne(() => Branchs, (branch) => branch.user)
  branch:Branchs;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
