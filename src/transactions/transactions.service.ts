import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm'; // Like va Between import qilish
import { Transactions, TransactionType, TransactionStatus } from './transaction.entity';
import { Products } from '../products/product.entity';
import { Users } from '../users/users.entity';
import { Branchs } from '../branchs/branch.entity';
import { CreateTransactionDto, TransactionScanDto, CompleteSessionDto, ReturnTransactionDto } from './dto/create-transaction.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transactions)
    private readonly transactionRepo: Repository<Transactions>,
    
    @InjectRepository(Products)
    private readonly productRepo: Repository<Products>,
    
    @InjectRepository(Users)
    private readonly userRepo: Repository<Users>,
    
    @InjectRepository(Branchs)
    private readonly branchRepo: Repository<Branchs>,
  ) {}

  // Barcode skanerlash
  async scanProduct(userId: string, scanDto: TransactionScanDto) {
    try {
      const { barcode, sessionId } = scanDto;

      const user = await this.userRepo.findOne({ 
        where: { id: userId },
        relations: ['branch']
      });

      if (!user) {
        throw new NotFoundException('Foydalanuvchi topilmadi');
      }

      const product = await this.productRepo.findOne({ 
        where: { barcode }
      });

      if (!product) {
        throw new NotFoundException(`Barcode ${barcode} bo'yicha mahsulot topilmadi`);
      }

      // Omborda mahsulot borligini tekshirish
      if (product.isByWeight) {
        if (!product.weight || product.weight <= 0) {
          throw new BadRequestException(`${product.name} omborda yo'q (og'irligi: ${product.weight} kg)`);
        }
      } else {
        if (!product.count || product.count <= 0) {
          throw new BadRequestException(`${product.name} omborda yo'q (soni: ${product.count} dona)`);
        }
      }

      return {
        success: true,
        product: {
          id: product.id,
          name: product.name,
          barcode: product.barcode,
          price: product.price,
          isByWeight: product.isByWeight,
          availableCount: product.count,
          availableWeight: product.weight,
          type: product.type,
        },
        sessionId: sessionId || uuidv4(),
        message: `${product.name} - ${product.price} so'm`,
      };
    } catch (error) {
      throw error;
    }
  }

 async createTransaction(userId: string, createDto: CreateTransactionDto) {
  try {
    const { barcode, quantity, weight, sessionId, notes } = createDto;

    const user = await this.userRepo.findOne({ 
      where: { id: userId },
      relations: ['branch']
    });

    if (!user || !user.branch) {
      throw new NotFoundException('Foydalanuvchi yoki filial topilmadi');
    }

    const product = await this.productRepo.findOne({ 
      where: { barcode }
    });

    if (!product) {
      throw new NotFoundException('Mahsulot topilmadi');
    }

    let finalQuantity: number | null = null;
    let finalWeight: number | null = null;
    let totalPrice = 0;

    if (product.isByWeight) {
      if (!weight || weight <= 0) {
        throw new BadRequestException('Og\'irlik kiritilishi shart');
      }
      if (!product.weight || product.weight < weight) {
        throw new BadRequestException(
          `Omborda yetarli mahsulot yo'q. Mavjud: ${product.weight || 0} kg, Talab: ${weight} kg`
        );
      }
      finalWeight = weight;
      totalPrice = weight * product.price;
    } else {
      if (!quantity || quantity <= 0) {
        throw new BadRequestException('Son kiritilishi shart');
      }
      if (!product.count || product.count < quantity) {
        throw new BadRequestException(
          `Omborda yetarli mahsulot yo'q. Mavjud: ${product.count || 0} dona, Talab: ${quantity} dona`
        );
      }
      finalQuantity = quantity;
      totalPrice = quantity * product.price;
    }

    const transactionNumber = await this.generateTransactionNumber();

    const transaction = new Transactions();
    transaction.user = user;
    transaction.product = product;
    transaction.branch = user.branch;
    transaction.transactionNumber = transactionNumber;
    transaction.barcode = barcode;
    transaction.quantity = finalQuantity ?? 0;
    transaction.weight = finalWeight ?? 0;
    transaction.unitPrice = product.price;
    transaction.totalPrice = totalPrice;
    transaction.type = TransactionType.SALE;
    transaction.status = TransactionStatus.PENDING;
    transaction.sessionId = sessionId || uuidv4();
    transaction.notes = notes ?? '';

    await this.transactionRepo.save(transaction);

    // Mahsulot sonini kamaytirish
    if (product.isByWeight && finalWeight) {
      product.weight = (product.weight || 0) - finalWeight;
    } else if (finalQuantity) {
      product.count = (product.count || 0) - finalQuantity;
    }

    if (((product.count !== null && product.count !== undefined) && product.count <= 0) || 
        ((product.weight !== null && product.weight !== undefined) && product.weight <= 0)) {
      product.onDelete = true;
    }

    await this.productRepo.save(product);

    return {
      success: true,
      transaction: {
        id: transaction.id,
        transactionNumber: transaction.transactionNumber,
        productName: product.name,
        quantity: finalQuantity || 0,
        weight: finalWeight || 0,
        unitPrice: product.price,
        totalPrice,
        sessionId: transaction.sessionId,
      },
      message: 'Tranzaksiya muvaffaqiyatli yaratildi',
    };
  } catch (error) {
    throw error;
  }
}

  // Sessiya tranzaksiyalari
  async getSessionTransactions(userId: string, sessionId: string) {
    try {
      const transactions = await this.transactionRepo.find({
        where: { 
          sessionId,
          status: TransactionStatus.PENDING,
          user: { id: userId }
        },
        relations: ['product', 'user', 'branch'],
        order: { createdAt: 'ASC' }
      });

      const totalSum = transactions.reduce((sum, t) => sum + t.totalPrice, 0);

      return {
        success: true,
        sessionId,
        transactions: transactions.map(t => ({
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

  // Sessiyani tugatish
  async completeSession(userId: string, completeDto: CompleteSessionDto) {
    try {
      const { sessionId, notes } = completeDto;

      const transactions = await this.transactionRepo.find({
        where: { 
          sessionId,
          status: TransactionStatus.PENDING,
          user: { id: userId }
        }
      });

      if (transactions.length === 0) {
        throw new NotFoundException('Ushbu sessiyada tranzaksiyalar topilmadi');
      }

      for (const transaction of transactions) {
        transaction.status = TransactionStatus.COMPLETED;
        if (notes) {
          transaction.notes = notes;
        }
        await this.transactionRepo.save(transaction);
      }

      const totalSum = transactions.reduce((sum, t) => sum + t.totalPrice, 0);

      return {
        success: true,
        message: 'To\'lov muvaffaqiyatli amalga oshirildi',
        sessionId,
        totalTransactions: transactions.length,
        totalSum,
      };
    } catch (error) {
      throw error;
    }
  }

  // Mahsulotni qaytarish
  async returnProduct(userId: string, returnDto: ReturnTransactionDto) {
    try {
      const { barcode, transactionNumber, quantity, weight, reason } = returnDto;

      const originalTransaction = await this.transactionRepo.findOne({
        where: { 
          transactionNumber,
          barcode,
          type: TransactionType.SALE,
          status: TransactionStatus.COMPLETED
        },
        relations: ['product', 'user', 'branch']
      });

      if (!originalTransaction) {
        throw new NotFoundException('Tranzaksiya topilmadi yoki qaytarib bo\'lmaydi');
      }

      const product = await this.productRepo.findOne({ 
        where: { barcode }
      });

      if (!product) {
        throw new NotFoundException('Mahsulot topilmadi');
      }

      let returnQuantity = 0;
      let returnWeight = 0;
      let returnPrice = 0;

      if (product.isByWeight) {
        if (!weight || weight <= 0) {
          throw new BadRequestException('Qaytariladigan og\'irlik kiritilishi shart');
        }
        if (weight > originalTransaction.weight) {
          throw new BadRequestException(
            `Qaytariladigan og\'irlik sotilgan og\'irlikdan oshib ketdi. Sotilgan: ${originalTransaction.weight} kg`
          );
        }
        returnWeight = weight;
        returnPrice = weight * originalTransaction.unitPrice;
      } else {
        if (!quantity || quantity <= 0) {
          throw new BadRequestException('Qaytariladigan son kiritilishi shart');
        }
        if (quantity > originalTransaction.quantity) {
          throw new BadRequestException(
            `Qaytariladigan son sotilgan sondan oshib ketdi. Sotilgan: ${originalTransaction.quantity} dona`
          );
        }
        returnQuantity = quantity;
        returnPrice = quantity * originalTransaction.unitPrice;
      }

      const user = await this.userRepo.findOne({ 
        where: { id: userId },
        relations: ['branch']
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
      returnTransaction.barcode = barcode;
      returnTransaction.quantity = returnQuantity > 0 ? returnQuantity : 0;
      returnTransaction.weight = returnWeight > 0 ? returnWeight : 0;
      returnTransaction.unitPrice = originalTransaction.unitPrice;
      returnTransaction.totalPrice = -returnPrice;
      returnTransaction.type = TransactionType.RETURN;
      returnTransaction.status = TransactionStatus.COMPLETED;
      returnTransaction.sessionId = originalTransaction.sessionId;
      returnTransaction.notes = `Qaytarish: ${transactionNumber}. Sabab: ${reason || 'Ko\'rsatilmagan'}`;

      await this.transactionRepo.save(returnTransaction);

      if (product.isByWeight) {
        product.weight += returnWeight;
      } else {
        product.count += returnQuantity;
      }

      if (product.onDelete && (product.count > 0 || product.weight > 0)) {
        product.onDelete = false;
      }

      await this.productRepo.save(product);

      return {
        success: true,
        returnTransaction: {
          id: returnTransaction.id,
          transactionNumber: returnTransaction.transactionNumber,
          productName: product.name,
          returnedQuantity: returnQuantity,
          returnedWeight: returnWeight,
          refundAmount: returnPrice,
        },
        message: 'Mahsulot muvaffaqiyatli qaytarildi va pul qaytarildi',
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
        transactionNumber: Like(`TRX-${dateStr}-%`)
      }
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
          createdAt: Between(startOfDay, endOfDay)
        },
        relations: ['product', 'branch', 'user']
      });

      const sales = transactions.filter(t => t.type === TransactionType.SALE);
      const returns = transactions.filter(t => t.type === TransactionType.RETURN);

      const totalSales = sales.reduce((sum, t) => sum + t.totalPrice, 0);
      const totalReturns = Math.abs(returns.reduce((sum, t) => sum + t.totalPrice, 0));
      const netTotal = totalSales - totalReturns;

      return {
        success: true,
        date: targetDate.toISOString().split('T')[0],
        cashier: {
          id: userId,
          name: transactions[0]?.user?.fullName || 'N/A'
        },
        branch: {
          id: transactions[0]?.branch?.id,
          name: transactions[0]?.branch?.name
        },
        summary: {
          totalSales,
          totalReturns,
          netTotal,
          salesCount: sales.length,
          returnsCount: returns.length,
        },
        transactions: transactions.map(t => ({
          transactionNumber: t.transactionNumber,
          type: t.type,
          productName: t.product.name,
          quantity: t.quantity,
          weight: t.weight,
          totalPrice: t.totalPrice,
          createdAt: t.createdAt,
        }))
      };
    } catch (error) {
      throw error.message;
    }
  }
}