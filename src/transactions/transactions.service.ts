import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm'; // Like va Between import qilish
import {
  Transactions,
  TransactionType,
  TransactionStatus,
} from './transaction.entity';
import { Products } from '../products/product.entity';
import { Users } from '../users/users.entity';
import { Branchs } from '../branchs/branch.entity';
import {
  TransactionScanDto,
  CompleteSessionDto,
  ReturnTransactionDto,
  // CreateUniversalTransactionDto,
} from './dto/transaction.dto';
import { v4 as uuidv4 } from 'uuid';
import { TransactionsGateway } from '../websockets/transactions.gateway';
import { Debt } from 'src/debt/debt.entity';
// TO'G'RILANDI: Ishlatilmagan log import o'chirildi
import { Payment } from 'src/peyments/payment.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transactions)
    private readonly transactionRepo: Repository<Transactions>,

    @InjectRepository(Products)
    private readonly productRepo: Repository<Products>,

    @InjectRepository(Users)
    private readonly userRepo: Repository<Users>,

    @InjectRepository(Debt)
    private readonly debtRepo: Repository<Debt>,

    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,

    private readonly gateway: TransactionsGateway,
  ) {}

  // Barcode skanerlash
  async scanProduct(userId: string, scanDto: TransactionScanDto) {
    try {
      const { barcode, quantity, weight, notes } = scanDto;

      const user = await this.userRepo.findOne({
        where: { id: userId },
        relations: ['branch'],
      });
      if (!user || !user.branch) {
        throw new NotFoundException('Foydalanuvchi yoki filial topilmadi');
      }

      // Avvalgi pending sessiyani topish yoki yangisini yaratish
      const usedSessionId = await (async (): Promise<string> => {
        const pending = await this.transactionRepo.findOne({
          where: { user: { id: userId }, status: TransactionStatus.PENDING },
          order: { createdAt: 'DESC' },
        });
        return pending ? pending.sessionId : uuidv4();
      })();

      const product = await this.productRepo.findOne({ where: { barcode } });
      if (!product)
        throw new NotFoundException(
          `Barcode ${barcode} bo'yicha mahsulot topilmadi`,
        );

      let finalQuantity = 0;
      let finalWeight = 0;
      let totalPrice = 0;

      if (product.isByWeight) {
        if (!weight || weight <= 0) {
          throw new BadRequestException(
            `${product.name} uchun og‘irlik kiritilishi kerak.`,
          );
        }
        finalWeight = weight;
        totalPrice = finalWeight * product.price;
      } else {
        const q = quantity ?? 1;
        if (!q || q <= 0) {
          throw new BadRequestException(
            `${product.name} uchun dona soni kiritilishi kerak.`,
          );
        }
        finalQuantity = q;
        totalPrice = finalQuantity * product.price;
      }

      const transactionNumber = await this.generateTransactionNumber();

      const tx = new Transactions();
      tx.user = user;
      tx.product = product;
      tx.branch = user.branch;
      tx.transactionNumber = transactionNumber;
      tx.barcode = barcode;
      tx.quantity = finalQuantity;
      tx.weight = finalWeight;
      tx.unitPrice = product.price;
      tx.totalPrice = totalPrice;
      tx.type = TransactionType.SALE;
      tx.status = TransactionStatus.PENDING;
      tx.sessionId = usedSessionId;
      tx.notes = notes ?? '';

      await this.transactionRepo.save(tx);

      const pending = await this.transactionRepo.find({
        where: { sessionId: usedSessionId, status: TransactionStatus.PENDING },
      });

      const sessionTotal = pending.reduce((s, p) => s + p.totalPrice, 0);
      const itemsCount = pending.length;

      return {
        success: true,
        sessionId: tx.sessionId,
        transaction: {
          id: tx.id,
          transactionNumber: tx.transactionNumber,
          productName: product.name,
          barcode: tx.barcode,
          quantity: tx.quantity,
          weight: tx.weight,
          unitPrice: tx.unitPrice,
          totalPrice: tx.totalPrice,
        },
        totals: { total: sessionTotal, itemsCount },
      };
    } catch (error) {
      throw error;
    }
  }

  async getSessionTransactions(userId: string, sessionId: string) {
    try {
      const transactions = await this.transactionRepo.find({
        where: {
          sessionId,
          status: TransactionStatus.PENDING,
          user: { id: userId },
        },
        relations: ['product', 'user', 'branch'],
        order: { createdAt: 'ASC' },
      });

      const totalSum = transactions.reduce((sum, t) => sum + t.totalPrice, 0);

      return {
        success: true,
        sessionId,
        transactions: transactions.map((t) => ({
          id: t.id,
          transactionNumber: t.transactionNumber,
          productName: t.product.name,
          barcode: t.barcode,
          quantity: t.quantity,
          weight: t.weight,
          unitPrice: t.unitPrice,
          totalPrice: t.totalPrice,
          createdAt: t.createdAt,
        })),
        totalSum,
        cashier: {
          id: transactions[0]?.user?.id,
          name: transactions[0]?.user?.fullName,
        },
        branch: {
          id: transactions[0]?.branch?.id,
          name: transactions[0]?.branch?.name,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Sessiyani tugatish — shu yerda real mahsulot kamayadi
  // async completeSession(userId: string, completeDto: CompleteSessionDto) {
  //   try {
  //     const { sessionId, notes } = completeDto;

  //     const payments = await this.paymentRepo.find({where:{sessionId}})

  //  const debt = await this.debtRepo.find({where:{sessionId}})

  //     console.log(debt);

  //     const transactions = await this.transactionRepo.find({
  //       where: {
  //         sessionId,
  //         status: TransactionStatus.PENDING,
  //         user: { id: userId },
  //       },
  //       relations: ['product'],
  //     });

  //     if (transactions.length === 0) {
  //       throw new NotFoundException('Ushbu sessiyada tranzaksiyalar topilmadi');
  //     }

  //     for (const transaction of transactions) {
  //       const product = await this.productRepo.findOne({
  //         where: { id: transaction.product.id },
  //       });

  //       if (!product) continue;

  //       if (product.isByWeight) {
  //         if (!product.weight || product.weight < transaction.weight) {
  //           throw new BadRequestException(
  //             `${product.name} uchun omborda yetarli kg yo‘q. Mavjud: ${product.weight || 0} kg`
  //           );
  //         }
  //         product.weight -= transaction.weight;
  //       } else {
  //         if (!product.count || product.count < transaction.quantity) {
  //           throw new BadRequestException(
  //             `${product.name} uchun omborda yetarli dona yo‘q. Mavjud: ${product.count || 0} dona`
  //           );
  //         }
  //         product.count -= transaction.quantity;
  //       }

  //       if ((product.isByWeight && product.weight <= 0) || (!product.isByWeight && product.count <= 0)) {
  //         product.onDelete = true;
  //       }

  //       await this.productRepo.save(product);

  //       transaction.status = TransactionStatus.COMPLETED;
  //       if (notes) transaction.notes = notes;
  //       await this.transactionRepo.save(transaction);
  //     }

  //     const totalSum = transactions.reduce((sum, t) => sum + t.totalPrice, 0);

  //     return {
  //       success: true,
  //       message: "To'lov amalga oshirildi",
  //       sessionId,
  //       totalTransactions: transactions.length,
  //       totalSum,
  //     };
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // Mahsulotni qaytarish
  // transactionNumber va reason orqali qaytarish tranzaksiyasi yaratadi
  // Ombordagi mahsulotni qaytaradi va mijozga refund summasini qaytaradi

  async completeSession(userId: string, completeDto: CompleteSessionDto) {
    try {
      const { sessionId, notes } = completeDto;

      // To'lovlar va qarzlarni olish
      // TO'G'RILANDI: console.log production kodidan o'chirildi
      const payments = await this.paymentRepo.findOne({ where: { sessionId } });
      const debt = await this.debtRepo.findOne({ where: { sessionId } });

      // Tranzaksiyalarni olish
      const transactions = await this.transactionRepo.find({
        where: {
          sessionId,
          status: TransactionStatus.PENDING,
          user: { id: userId },
        },
        relations: ['product'],
      });

      if (transactions.length === 0) {
        throw new NotFoundException('Ushbu sessiyada tranzaksiyalar topilmadi');
      }

      // To'lov holatini aniqlash
      let transactionStatus: TransactionStatus;
      let paymentMessage: string;

      if (payments && payments.fullyPaid && !debt) {
        // To'liq to'langan (qarz yo'q)
        transactionStatus = TransactionStatus.COMPLETED;
        paymentMessage =
          "To'lov to'liq amalga oshirildi (naqd, click, terminal)";
      } else if (debt && debt.totalDebt === debt.remainingDebt) {
        // To'liq qarzga berilgan
        transactionStatus = TransactionStatus.DEBT;
        paymentMessage = "To'lov to'liq qarzga amalga oshirildi";
      } else if (debt && debt.repaidAmount > 0) {
        // Qisman to'langan, qolgan qismni qarzga
        transactionStatus = TransactionStatus.PARTIAL;
        paymentMessage =
          "To'lov qisman amalga oshirildi, qolgan qismi qarzga yozildi";
      } else {
        // Default holat
        transactionStatus = TransactionStatus.COMPLETED;
        paymentMessage = "To'lov amalga oshirildi";
      }

      // Mahsulotlarni o'zgartirish va tranzaksiya statusini yangilash
      for (const transaction of transactions) {
        const product = await this.productRepo.findOne({
          where: { id: transaction.product.id },
        });

        if (!product) continue;

        // Vazn bo'yicha mahsulot
        if (product.isByWeight) {
          if (!product.weight || product.weight < transaction.weight) {
            throw new BadRequestException(
              `${product.name} uchun omborda yetarli kg yo'q. Mavjud: ${product.weight || 0} kg`,
            );
          }
          product.weight -= transaction.weight;
        } else {
          // Dona bo'yicha mahsulot
          if (!product.count || product.count < transaction.quantity) {
            throw new BadRequestException(
              `${product.name} uchun omborda yetarli dona yo'q. Mavjud: ${product.count || 0} dona`,
            );
          }
          product.count -= transaction.quantity;
        }

        // Mahsulot tugagan bo'lsa, o'chirishga belgilash
        if (
          (product.isByWeight && product.weight <= 0) ||
          (!product.isByWeight && product.count <= 0)
        ) {
          product.onDelete = true;
        }

        await this.productRepo.save(product);

        // Tranzaksiya statusini yangilash
        transaction.status = transactionStatus;
        if (notes) transaction.notes = notes;

        await this.transactionRepo.save(transaction);
      }

      const totalSum = transactions.reduce((sum, t) => sum + t.totalPrice, 0);

      return {
        success: true,
        message: paymentMessage,
        sessionId,
        totalTransactions: transactions.length,
        totalSum,
        paymentStatus: transactionStatus,
        debtInfo: debt
          ? {
              totalDebt: debt.totalDebt,
              repaidAmount: debt.repaidAmount,
              remainingDebt: debt.remainingDebt,
            }
          : null,
      };
    } catch (error) {
      throw error;
    }
  }

  async returnProduct(userId: string, returnDto: ReturnTransactionDto) {
    try {
      const { transactionNumber, reason } = returnDto;

      // 1. Asl sotuv tranzaksiyasini topish
      const originalTransaction = await this.transactionRepo.findOne({
        where: {
          transactionNumber,
          type: TransactionType.SALE,
          status: TransactionStatus.COMPLETED,
        },
        relations: ['product', 'user', 'branch'],
      });

      if (!originalTransaction) {
        throw new NotFoundException(
          "Tranzaksiya topilmadi yoki qaytarib bo'lmaydi",
        );
      }

      // 2. Mahsulotni topish va omborda qaytarish
      const product = await this.productRepo.findOne({
        where: { id: originalTransaction.product.id },
      });

      if (!product) {
        throw new NotFoundException('Mahsulot topilmadi');
      }

      // 3. Qaytarish summasini hisoblash
      // Agar og'irlik bilan sotilgan bo'lsa weight ni, aks holda quantity ni qaytaradi
      let returnQuantity = 0;
      let returnWeight = 0;
      let refundAmount = 0;

      if (product.isByWeight) {
        returnWeight = originalTransaction.weight;
        refundAmount = returnWeight * originalTransaction.unitPrice;
        product.weight += returnWeight; // omborga qaytarish
      } else {
        returnQuantity = originalTransaction.quantity;
        refundAmount = returnQuantity * originalTransaction.unitPrice;
        product.count += returnQuantity; // omborga qaytarish
      }

      // onDelete flagini o'chirish (agar mahsulot qaytarilgan bo'lsa)
      if (product.onDelete && (product.count > 0 || product.weight > 0)) {
        product.onDelete = false;
      }

      await this.productRepo.save(product);

      // 4. Qaytarish tranzaksiyasi yaratish
      const user = await this.userRepo.findOne({
        where: { id: userId },
        relations: ['branch'],
      });

      if (!user || !user.branch) {
        throw new NotFoundException('Foydalanuvchi yoki filial topilmadi');
      }

      const returnTransactionNumber = await this.generateTransactionNumber();

      const returnTransaction = new Transactions();
      returnTransaction.user = user;
      returnTransaction.product = product;
      returnTransaction.branch = user.branch;
      returnTransaction.transactionNumber = returnTransactionNumber;
      returnTransaction.barcode = originalTransaction.barcode;
      returnTransaction.quantity = returnQuantity;
      returnTransaction.weight = returnWeight;
      returnTransaction.unitPrice = originalTransaction.unitPrice;
      returnTransaction.totalPrice = -refundAmount; // negative (refund)
      returnTransaction.type = TransactionType.RETURN;
      returnTransaction.status = TransactionStatus.COMPLETED;
      returnTransaction.sessionId = originalTransaction.sessionId;
      returnTransaction.notes = `Asl sotuv: ${transactionNumber}. Sabab: ${reason || "Ko'rsatilmagan"}`;

      await this.transactionRepo.save(returnTransaction);

      // 5. Realtime emit qaytarish hodisasi
      this.gateway.emitTransactionReturned(
        {
          id: returnTransaction.id,
          transactionNumber: returnTransaction.transactionNumber,
          refundAmount,
          productName: product.name,
        },
        user.branch?.id,
        userId,
      );

      return {
        success: true,
        message: 'Mahsulot muvaffaqiyatli qaytarildi',
        originalTransaction: {
          transactionNumber: originalTransaction.transactionNumber,
          productName: product.name,
          quantity: returnQuantity,
          weight: returnWeight,
          unitPrice: originalTransaction.unitPrice,
          originalTotal: originalTransaction.totalPrice,
        },
        refund: {
          returnTransactionNumber,
          refundAmount,
          reason,
        },
        stock: {
          productName: product.name,
          newQuantity: product.count,
          newWeight: product.weight,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Tranzaksiya raqami generatsiya
  private async generateTransactionNumber(): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');

    const count = await this.transactionRepo.count({
      where: {
        transactionNumber: Like(`TRX-${dateStr}-%`),
      },
    });

    return `TRX-${dateStr}-${String(count + 1).padStart(4, '0')}`;
  }

  // Kunlik hisobot
  async getCashierDailyReport(userId: string, date?: string) {
    try {
      const targetDate = date ? new Date(date) : new Date();
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

      const transactions = await this.transactionRepo.find({
        where: {
          user: { id: userId },
          status: TransactionStatus.COMPLETED,
          createdAt: Between(startOfDay, endOfDay),
        },
        relations: ['product', 'branch', 'user'],
      });

      const sales = transactions.filter((t) => t.type === TransactionType.SALE);
      const returns = transactions.filter(
        (t) => t.type === TransactionType.RETURN,
      );

      const totalSales = sales.reduce((sum, t) => sum + t.totalPrice, 0);
      const totalReturns = Math.abs(
        returns.reduce((sum, t) => sum + t.totalPrice, 0),
      );
      const netTotal = totalSales - totalReturns;

      return {
        success: true,
        date: targetDate.toISOString().split('T')[0],
        cashier: {
          id: userId,
          name: transactions[0]?.user?.fullName || 'N/A',
        },
        branch: {
          id: transactions[0]?.branch?.id,
          name: transactions[0]?.branch?.name,
        },
        summary: {
          totalSales,
          totalReturns,
          netTotal,
          salesCount: sales.length,
          returnsCount: returns.length,
        },
        transactions: transactions.map((t) => ({
          transactionNumber: t.transactionNumber,
          type: t.type,
          productName: t.product.name,
          quantity: t.quantity,
          weight: t.weight,
          totalPrice: t.totalPrice,
          createdAt: t.createdAt,
        })),
      };
    } catch (error) {
      throw error;
    }
  }
}
