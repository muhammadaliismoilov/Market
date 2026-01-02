import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DebtService } from './debt.service';
import { DebtController } from './debt.controller';
import { Debt } from './debt.entity';
import { Transactions } from 'src/transactions/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Debt,Transactions])],
  controllers: [DebtController],
  providers: [DebtService],
})
export class DebtModule {}
