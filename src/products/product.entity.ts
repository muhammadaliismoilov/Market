import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
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

  @Column('int')
  count: number;

  @Column('float')
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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
