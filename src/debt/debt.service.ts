import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Debt } from './debt.entity';
import { RepayDebtDto } from './dto/debt.dto';


@Injectable()
export class DebtService {
  constructor(@InjectRepository(Debt) private debtRepo: Repository<Debt>) {}

  async create() {
    const debt = this.debtRepo.create({
      fullName: 'Unnamed',
      phone: '0000000000',
      totalDebt: 0,
      repaidAmount: 0,
      remainingDebt: 0,
      status: 'pending',
    });
    return await this.debtRepo.save(debt);
  }

  async list(status?: string) {
    if (status) return await this.debtRepo.find({ where: { status } });
    return await this.debtRepo.find();
  }

  async repay(id: string, dto: RepayDebtDto) {
    const debt = await this.debtRepo.findOne({ where: { id } });
    if (!debt) throw new NotFoundException('Debt not found');

    debt.repaidAmount += dto.amount;
    debt.remainingDebt = debt.totalDebt - debt.repaidAmount;

    if (debt.remainingDebt <= 0) {
      debt.remainingDebt = 0;
      debt.status = 'paid';
    } else {
      debt.status = 'partial';
    }

    return await this.debtRepo.save(debt);
  }
}
