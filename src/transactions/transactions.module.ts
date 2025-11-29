import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transactions } from './transaction.entity';
import { Users } from 'src/users/users.entity';
import { Products } from 'src/products/product.entity';
import { Branchs } from 'src/branchs/branch.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Transactions,Users,Products,Branchs])],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
