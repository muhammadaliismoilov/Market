import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Transactions } from 'src/transactions/transaction.entity';
import { Products } from 'src/products/product.entity';
import { Debt } from 'src/debt/debt.entity';
import { Payment } from 'src/peyments/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transactions, Debt,Payment,Products])],
  providers: [ReportsService],
  controllers: [ReportsController],
  exports: [ReportsService],
})
export class ReportsModule {}