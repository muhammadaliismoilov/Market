import { Module } from '@nestjs/common';
import { BranchsService } from './branchs.service';
import { BranchsController } from './branchs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branchs } from './branch.entity';
import { Users } from 'src/users/users.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Branchs,Users])],
  controllers: [BranchsController],
  providers: [BranchsService],
})
export class BranchsModule {}
