import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Debt } from './debt.entity';
import { RepayDebtDto } from './dto/debt.dto';
import { Transactions, TransactionStatus } from 'src/transactions/transaction.entity';


@Injectable()
export class DebtService {
  constructor(
    @InjectRepository(Debt) 
    private debtRepo: Repository<Debt>,
    @InjectRepository(Transactions) 
    private transactionRepo: Repository<Transactions>
  ) {}

  async getAllDebts() {
    return await this.debtRepo.find();
  }

  async findOne(id: string) {
    const debt = await this.debtRepo.findOne({ where: { id } });
    if (!debt) throw new NotFoundException('Qarzdor topilmadi');
    
    const transactions = await this.transactionRepo.find({ 
      where: { sessionId: debt.sessionId },
      relations: ['product']
    });
    
    return { debt, transactions };
  }

  async list(status?: string) {
    if (status) return await this.debtRepo.find({ where: { status } });
    return await this.debtRepo.find();
  }

  async repay(id: string, dto: RepayDebtDto) {
    const debt = await this.debtRepo.findOne({ where: { id } });
    if (!debt) throw new NotFoundException('Qarz topilmadi');

    // To'lov summasi qarzdan katta bo'lmasligini tekshirish
    if (dto.amount > debt.remainingDebt) {
      throw new BadRequestException(
        `To'lov summasi qolgan qarzdan katta bo'lmasligi kerak. Qolgan qarz: ${debt.remainingDebt}`
      );
    }

    // To'langan summani qo'shish
    debt.repaidAmount += dto.amount;
    debt.remainingDebt = debt.totalDebt - debt.repaidAmount;

    // Status yangilash
    if (debt.remainingDebt <= 0) {
      // To'liq to'landi - hammasini 0 ga teng qilish
      debt.remainingDebt = 0;
      debt.status = 'paid';

      // Qarz to'liq to'langanda transaction statusini COMPLETED ga o'zgartirish
      await this.transactionRepo.update(
        { sessionId: debt.sessionId },
        { status: TransactionStatus.COMPLETED }
      );
    } else {
      // Qisman to'landi - status partial
      debt.status = 'partial';

      // Transaction statusini PARTIAL ga o'zgartirish
      await this.transactionRepo.update(
        { sessionId: debt.sessionId },
        { status: TransactionStatus.PARTIAL }
      );
    }

    const savedDebt = await this.debtRepo.save(debt);

    // Yangilangan tranzaksiyalarni olish
    const updatedTransactions = await this.transactionRepo.find({ 
      where: { sessionId: debt.sessionId },
      relations: ['product']
    });

    return {
      debt: savedDebt,
      transactions: updatedTransactions,
      message: debt.status === 'paid' 
        ? 'Qarz to\'liq to\'landi' 
        : `Qarz qisman to\'landi. Qolgan qarz: ${debt.remainingDebt}`,
    };
  }
}