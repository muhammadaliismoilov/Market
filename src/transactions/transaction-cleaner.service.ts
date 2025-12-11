
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThan } from 'typeorm';
import { Transactions } from './transaction.entity';
import { TransactionStatus } from './transaction.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TransactionCleanerService {
  private readonly logger = new Logger(TransactionCleanerService.name);
  private readonly SESSION_EXPIRE_MS = 10 * 60 * 1000; // 10 daqiqa

  constructor(
    @InjectRepository(Transactions)
    private readonly transactionRepo: Repository<Transactions>,
  ) {}

  /** 
   * 🧹 Har 1 daqiqada pending sessiyalarni tekshiradi 
   * 10 daqiqadan oshganlarni o'chiradi
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async cleanupExpiredSessions() {
    try {
      const expirationTime = new Date(Date.now() - this.SESSION_EXPIRE_MS);

      const expiredSessions = await this.transactionRepo.find({
        where: {
          status: TransactionStatus.PENDING,
          createdAt: LessThan(expirationTime),
        },
      });

      if (expiredSessions.length > 0) {
        const sessionIds = [...new Set(expiredSessions.map(e => e.sessionId))];

        await this.transactionRepo.delete({ sessionId: In(sessionIds) });

        this.logger.warn(`⛔ O'chirildi | Pending sessiyalar: ${sessionIds}`);
      } else {
        this.logger.log(`✓ O'chirish uchun session topilmadi`);
      }
    } catch (err) {
      this.logger.error('Cron error: ' + err.message);
    }
  }
  /**
   * ❌ Sessionni qo‘lda bekor qilish
   * Foydalanuvchi yoki admin tomonidan chaqiriladi
   */
  async cancelSession(sessionId: string) {
    const exists = await this.transactionRepo.count({ where: { sessionId } });

    if (!exists) {
      this.logger.error(`❗ Session topilmadi: ${sessionId}`);
      throw new NotFoundException('Sessiya topilmadi yoki allaqachon yakunlangan');
    }

    await this.transactionRepo.delete({ sessionId });

    this.logger.warn(`❌ Sessiya qo'lda bekor qilindi: ${sessionId}`);

    return {
      success: true,
      message: 'Sessiya muvaffaqiyatli bekor qilindi va barcha tranzaksiyalar o‘chirildi',
      sessionId,
    };
  }
}
