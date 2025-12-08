// transaction.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Products } from '../products/product.entity';
import { Users } from '../users/users.entity';
import { Branchs } from '../branchs/branch.entity';
import { Transactions } from './transaction.entity';
import { TransactionController } from './transactions.controller';
import { TransactionService } from './transactions.service';
import { TransactionsGateway } from '../websockets/transactions.gateway';
import { AuthModule } from '../auth/auth.module';
import { TransactionCleanerService } from './transaction-cleaner.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transactions, Products, Users, Branchs]), AuthModule],
  controllers: [TransactionController],
  providers: [TransactionService, TransactionsGateway,TransactionCleanerService],
  exports: [TransactionService],
})
export class TransactionModule {}