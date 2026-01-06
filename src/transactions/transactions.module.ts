// transaction.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config'; // TO'G'RILANDI: ConfigModule import qilindi (TransactionsGateway uchun)
import { Products } from '../products/product.entity';
import { Users } from '../users/users.entity';
import { Branchs } from '../branchs/branch.entity';
import { Transactions } from './transaction.entity';
import { TransactionController } from './transactions.controller';
import { TransactionService } from './transactions.service';
import { TransactionsGateway } from '../websockets/transactions.gateway';
import { AuthModule } from '../auth/auth.module';
import { TransactionCleanerService } from './transaction-cleaner.service';
import { Debt } from 'src/debt/debt.entity';
import { Payment } from 'src/peyments/payment.entity';

@Module({
  // TO'G'RILANDI: ConfigModule qo'shildi (TransactionsGateway ConfigService ishlatadi)
  imports: [TypeOrmModule.forFeature([Transactions, Products, Users,Debt,Payment, Branchs]), AuthModule, ConfigModule],
  controllers: [TransactionController],
  providers: [TransactionService, TransactionsGateway,TransactionCleanerService],
  exports: [TransactionService],
})
export class TransactionModule {}