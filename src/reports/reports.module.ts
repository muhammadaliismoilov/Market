import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Transactions } from 'src/transactions/transaction.entity';
import { Products } from 'src/products/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transactions, Products])],
  providers: [ReportsService],
  controllers: [ReportsController],
  exports: [ReportsService],
})
export class ReportsModule {}