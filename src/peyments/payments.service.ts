import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentMethod } from './payment.entity';
import { Debt } from '../debt/debt.entity';
import { CreatePaymentDto } from './dto/payment.dto';
import { Transactions } from 'src/transactions/transaction.entity';
import { PaymentGateway } from 'src/websockets/payment.gateway';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Debt) private debtRepo: Repository<Debt>,
    @InjectRepository(Transactions)
    private transactionRepo: Repository<Transactions>,
    private readonly paymentGateway: PaymentGateway,
  ) {}

  async create(dto: CreatePaymentDto) {
    try {
      const sessionExisist = await this.transactionRepo.find({
        where: { sessionId: dto.sessionId },
      });

      if (sessionExisist.length === 0) {
        throw new NotFoundException(
          'Bunday sessionId bilan transaction topilmadi',
        );
      }

      const totalSum = sessionExisist.reduce(
        (sum, item) => sum + (item.totalPrice || 0),
        0,
      );

      let paidCash = 0;
      let paidTerminal = 0;
      let paidClick = 0;
      let paidDebt = 0;

      for (const p of dto.payments) {
        if (p.method === PaymentMethod.CASH) paidCash = p.amount;
        if (p.method === PaymentMethod.TERMINAL) paidTerminal = p.amount;
        if (p.method === PaymentMethod.CLICK) paidClick = p.amount;
        if (p.method === PaymentMethod.DEBT) paidDebt = p.amount;
      }

      const totalPaid = paidCash + paidTerminal + paidClick + paidDebt;
      const remainingDebt = totalSum - totalPaid;
      const fullyPaid = remainingDebt <= 0;

      // Payment yozish
      const payment = this.paymentRepo.create({
        // transaction: sessionExisist.map((t) => t.id),
        sessionId: dto.sessionId,
        totalSum,
        items: sessionExisist.map((item) => ({
          barcode: item.barcode,
          transactionNumber: item.transactionNumber,
          quantity: item.quantity,
          weight: item.weight,
          subtotal: item.totalPrice,
        })),
        payments: dto.payments,
        paidBreakdown: {
          cash: paidCash,
          terminal: paidTerminal,
          click: paidClick,
          debt: paidDebt,
        },
        fullyPaid,
      });

      const savedPayment = await this.paymentRepo.save(payment);

      // ===================
      // 🔥 To'liq to'langan
      // ===================
      if (fullyPaid) {
        this.paymentGateway.emitPaymentCompleted(savedPayment);

        return {
          message: 'To‘lov to‘liq amalga oshirildi',
          payment: savedPayment,
        };
      }

      // ===================
      // 🔥 Qisman to‘lov
      // ===================
      if (paidDebt === 0 && remainingDebt > 0) {
        this.paymentGateway.emitPaymentPartial(savedPayment);

        return {
          message: 'To‘lov qisman amalga oshirildi',
          payment: savedPayment,
        };
      }

      // ===================
      // 🔥 Qarz yaratildi
      // ===================
      if (remainingDebt > 0) {
        if (!dto.fullName || !dto.phone) {
          throw new BadRequestException(
            'Qarzga yozish uchun fullName va phone shart',
          );
        }

        const debt = this.debtRepo.create({
          fullName: dto.fullName,
          phone: dto.phone,
          totalDebt: remainingDebt,
          repaidAmount: 0,
          remainingDebt,
          status: 'pending',
        });

        const savedDebt = await this.debtRepo.save(debt);

        // 🔹 To‘g‘ri chaqirish: 2 argument
        this.paymentGateway.emitDebtCreated({ savedDebt, savedPayment });

        return {
          message:
            'To‘lov qisman amalga oshirildi — mijoz qarzdorlar ro‘yxatiga qo‘shildi',
          payment: savedPayment,
          debt: savedDebt,
        };
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll() {
    return await this.paymentRepo.find();
  }

  async findOne(id: string) {
    const payment = await this.paymentRepo.findOne({ where: { id } });
    if (!payment) throw new NotFoundException('Payment topilmadi');
    return payment;
  }

  async remove(id: string) {
    const result = await this.paymentRepo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException('O‘chirilmadi, ID topilmadi');

    return { message: 'Payment o‘chirildi' };
  }
}
