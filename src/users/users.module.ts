import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './users.entity';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { Transactions } from 'src/transactions/transaction.entity';
import { Branchs } from 'src/branchs/branch.entity';



@Module({
  imports: [TypeOrmModule.forFeature([Users,Transactions,Branchs])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
