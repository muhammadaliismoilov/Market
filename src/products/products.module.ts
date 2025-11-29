import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Products } from './product.entity';
import { Branchs } from 'src/branchs/branch.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([Products, Branchs])
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
