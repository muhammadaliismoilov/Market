import { Controller, Get, Query, Patch, Param, Body, Post } from '@nestjs/common';
import { DebtService } from './debt.service';
import { RepayDebtDto } from './dto/debt.dto';
import { ApiConsumes } from '@nestjs/swagger';


@Controller('debt')
export class DebtController {
  constructor(private readonly service: DebtService) {}

  @Get()
  getAllDebts(){
    return this.service.getAllDebts()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get('status')
  list(@Query('status') status?: string) {
    return this.service.list(status);
  }

  @Patch(':id/repay')
  repay(@Param('id') id: string, @Body() dto: RepayDebtDto) {
    return this.service.repay(id, dto);
  }
}
