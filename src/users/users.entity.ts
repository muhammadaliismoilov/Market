import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
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

  @OneToMany(() => Transactions, (t) => t.user,{nullable: true, onDelete: 'SET NULL', eager: true })
  transactions: Transactions[];

  @ManyToOne(() => Branchs, (branch) => branch.user,{nullable: true, onDelete: 'SET NULL', eager: true })
  @JoinColumn({ name: 'branchId' })
  branch:Branchs;


  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
