// transaction.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Products } from '../products/product.entity';
import { Users } from '../users/users.entity';
import { Branchs } from '../branchs/branch.entity';
import { Transactions } from './transaction.entity';
import { TransactionController } from './transactions.controller';
import { TransactionService } from './transactions.service';
import { TransactionsGateway } from './transactions.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Transactions, Products, Users, Branchs]), AuthModule],
  controllers: [TransactionController],
  providers: [TransactionService, TransactionsGateway],
  exports: [TransactionService],
})
export class TransactionModule {}