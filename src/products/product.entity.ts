import { Branchs } from 'src/branchs/branch.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum ProductType {
  DONA = 'dona',
  KG = 'kg',
}

@Entity()
export class Products {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('int',{nullable: true})
  count: number;

  @Column('float',{nullable: true})
  weight: number;

  @Column('float')
  price: number;

  @Column({ type:'varchar',length: 13, unique: true })
  barcode: number; // 13 xonali shtrix-kod

  @Column('float')
  costPrice: number; // mahsulot tannarxi

  @Column({
    type: 'enum',
    enum: ProductType,
  })
  type: ProductType;

  @ManyToOne(() => Branchs, (b) => b.products, { nullable: true, onDelete: 'SET NULL', eager: true })
  @JoinColumn({name:'branchId'})
  branch: Branchs;

  @Column({nullable:true, default:false})
  onDelete : boolean;
  
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
