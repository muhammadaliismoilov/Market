import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Transactions,
  TransactionStatus,
} from 'src/transactions/transaction.entity';
import { Products } from 'src/products/product.entity';
import { Debt } from 'src/debt/debt.entity';
import { In, Between } from 'typeorm';
import { Payment } from 'src/peyments/payment.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Transactions)
    private readonly txRepo: Repository<Transactions>,
    @InjectRepository(Products)
    private readonly productRepo: Repository<Products>,
    @InjectRepository(Debt)
    private readonly debtRepo: Repository<Debt>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
  ) {}

  // helper to convert raw numeric strings
  private toNumber(v: any): number {
    if (v === null || v === undefined) return 0;
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  }

  // Helper: sessionId bo'yicha to'langan summani hisoblash
  private async getActualPaidAmount(sessionId: string): Promise<number> {
    const payment = await this.paymentRepo.findOne({
      where: { sessionId },
    });

    if (!payment) return 0;

    if (!payment || !payment.paidBreakdown) return 0;

    const cash = payment.paidBreakdown.cash || 0;
    const terminal = payment.paidBreakdown.terminal || 0;
    const click = payment.paidBreakdown.click || 0;

    return cash + terminal + click;
  }

  async dailyReport(date?: string, branchId?: string) {
    const target = date ? new Date(date) : new Date();
    const start = new Date(target);
    start.setHours(0, 0, 0, 0);
    const end = new Date(target);
    end.setHours(23, 59, 59, 999);

    const qb = this.txRepo
      .createQueryBuilder('t')
      .select('date_trunc(\'hour\', t."createdAt")', 'interval')
      .addSelect('t."sessionId"', 'sessionId')
      .addSelect('SUM(t."totalPrice")', 'totalPrice')
      .addSelect('COUNT(*)', 'count')
      .where('t.status IN (:...statuses)', {
        statuses: [
          TransactionStatus.COMPLETED,
          TransactionStatus.PARTIAL,
          TransactionStatus.DEBT,
        ],
      })
      .andWhere('t."createdAt" BETWEEN :start AND :end', { start, end });

    if (branchId) qb.andWhere('t.branch_id = :branchId', { branchId });

    qb.groupBy('interval, t."sessionId"').orderBy('interval');

    const rows = await qb.getRawMany();

    // Prepare labels 00-23
    const labels: string[] = [];
    const series: number[] = [];
    const counts: number[] = [];
    for (let h = 0; h < 24; h++) {
      labels.push(String(h).padStart(2, '0') + ':00');
      series.push(0);
      counts.push(0);
    }

    // Har bir session uchun haqiqiy to'langan summani hisoblash
    for (const r of rows) {
      const dt = new Date(r.interval);
      const hour = dt.getHours();

      // To'langan summani olish
      const paidAmount = await this.getActualPaidAmount(r.sessionId);

      series[hour] += paidAmount;
      counts[hour] += this.toNumber(r.count);
    }

    // Summary totals for the day
    const allTxs = await this.txRepo.find({
      where: {
        status: In([
          TransactionStatus.COMPLETED,
          TransactionStatus.PARTIAL,
          TransactionStatus.DEBT,
        ]),
        createdAt: Between(start, end),
        ...(branchId && { branch: { id: branchId } }),
      },
    });

    let totalSales = 0;
    let totalReturns = 0;
    const processedSessions = new Set<string>();

    for (const tx of allTxs) {
      if (processedSessions.has(tx.sessionId)) continue;
      processedSessions.add(tx.sessionId);

      const paidAmount = await this.getActualPaidAmount(tx.sessionId);

      if (tx.totalPrice < 0) {
        totalReturns += Math.abs(tx.totalPrice);
      } else {
        totalSales += paidAmount;
      }
    }

    const netTotal = totalSales - totalReturns;
    const transactionsCount = allTxs.length;

    return {
      success: true,
      period: 'daily',
      date: start.toISOString().split('T')[0],
      labels,
      series,
      counts,
      summary: { totalSales, totalReturns, netTotal, transactionsCount },
    };
  }

  async weeklyReport(isoWeekStart?: string, branchId?: string) {
    const ref = isoWeekStart ? new Date(isoWeekStart) : new Date();
    const day = ref.getDay();
    const diffToMonday = (day + 6) % 7;
    const monday = new Date(ref);
    monday.setDate(ref.getDate() - diffToMonday);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const qb = this.txRepo
      .createQueryBuilder('t')
      .select('date_trunc(\'day\', t."createdAt")', 'day')
      .addSelect('t."sessionId"', 'sessionId')
      .addSelect('SUM(t."totalPrice")', 'totalPrice')
      .addSelect('COUNT(*)', 'count')
      .where('t.status IN (:...statuses)', {
        statuses: [
          TransactionStatus.COMPLETED,
          TransactionStatus.PARTIAL,
          TransactionStatus.DEBT,
        ],
      })
      .andWhere('t."createdAt" BETWEEN :start AND :end', {
        start: monday,
        end: sunday,
      });

    if (branchId) qb.andWhere('t.branch_id = :branchId', { branchId });

    qb.groupBy('day, t."sessionId"').orderBy('day');

    const rows = await qb.getRawMany();

    const labels: string[] = [];
    const series: number[] = [];
    const counts: number[] = [];

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    for (let i = 0; i < 7; i++) {
      labels.push(dayNames[i]);
      series.push(0);
      counts.push(0);
    }

    for (const r of rows) {
      const dt = new Date(r.day);
      const idx = (dt.getDay() + 6) % 7;

      const paidAmount = await this.getActualPaidAmount(r.sessionId);

      series[idx] += paidAmount;
      counts[idx] += this.toNumber(r.count);
    }

    // Summary
    const allTxs = await this.txRepo.find({
      where: {
        status: In([
          TransactionStatus.COMPLETED,
          TransactionStatus.PARTIAL,
          TransactionStatus.DEBT,
        ]),
        createdAt: Between(monday, sunday),
        ...(branchId && { branch: { id: branchId } }),
      },
    });

    let totalSales = 0;
    let totalReturns = 0;
    const processedSessions = new Set<string>();

    for (const tx of allTxs) {
      if (processedSessions.has(tx.sessionId)) continue;
      processedSessions.add(tx.sessionId);

      const paidAmount = await this.getActualPaidAmount(tx.sessionId);

      if (tx.totalPrice < 0) {
        totalReturns += Math.abs(tx.totalPrice);
      } else {
        totalSales += paidAmount;
      }
    }

    const netTotal = totalSales - totalReturns;
    const transactionsCount = allTxs.length;

    return {
      success: true,
      period: 'weekly',
      weekStart: monday.toISOString().split('T')[0],
      weekEnd: sunday.toISOString().split('T')[0],
      labels,
      series,
      counts,
      summary: { totalSales, totalReturns, netTotal, transactionsCount },
    };
  }

  async monthlyReport(monthDate?: string, branchId?: string) {
    const ref = monthDate ? new Date(monthDate) : new Date();
    const year = ref.getFullYear();
    const month = ref.getMonth();
    const start = new Date(year, month, 1, 0, 0, 0, 0);
    const end = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const qb = this.txRepo
      .createQueryBuilder('t')
      .select('to_char(t."createdAt", \'DD\')', 'day')
      .addSelect('t."sessionId"', 'sessionId')
      .addSelect('SUM(t."totalPrice")', 'totalPrice')
      .addSelect('COUNT(*)', 'count')
      .where('t.status IN (:...statuses)', {
        statuses: [
          TransactionStatus.COMPLETED,
          TransactionStatus.PARTIAL,
          TransactionStatus.DEBT,
        ],
      })
      .andWhere('t."createdAt" BETWEEN :start AND :end', { start, end });

    if (branchId) qb.andWhere('t.branch_id = :branchId', { branchId });

    qb.groupBy('day, t."sessionId"').orderBy('day');

    const rows = await qb.getRawMany();

    const daysInMonth = end.getDate();
    const labels: string[] = [];
    const series: number[] = [];
    const counts: number[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      labels.push(String(d).padStart(2, '0'));
      series.push(0);
      counts.push(0);
    }

    for (const r of rows) {
      const dayStr = r.day;
      const idx = Number(dayStr) - 1;
      if (idx >= 0 && idx < daysInMonth) {
        const paidAmount = await this.getActualPaidAmount(r.sessionId);
        series[idx] += paidAmount;
        counts[idx] += this.toNumber(r.count);
      }
    }

    // Summary
    const allTxs = await this.txRepo.find({
      where: {
        status: In([
          TransactionStatus.COMPLETED,
          TransactionStatus.PARTIAL,
          TransactionStatus.DEBT,
        ]),
        createdAt: Between(start, end),
        ...(branchId && { branch: { id: branchId } }),
      },
    });

    let totalSales = 0;
    let totalReturns = 0;
    const processedSessions = new Set<string>();

    for (const tx of allTxs) {
      if (processedSessions.has(tx.sessionId)) continue;
      processedSessions.add(tx.sessionId);

      const paidAmount = await this.getActualPaidAmount(tx.sessionId);

      if (tx.totalPrice < 0) {
        totalReturns += Math.abs(tx.totalPrice);
      } else {
        totalSales += paidAmount;
      }
    }

    const netTotal = totalSales - totalReturns;
    const transactionsCount = allTxs.length;

    return {
      success: true,
      period: 'monthly',
      month: `${year}-${String(month + 1).padStart(2, '0')}`,
      labels,
      series,
      counts,
      summary: { totalSales, totalReturns, netTotal, transactionsCount },
    };
  }

  async yearlyReport(yearParam?: number, branchId?: string) {
    const year = yearParam || new Date().getFullYear();
    const start = new Date(year, 0, 1, 0, 0, 0, 0);
    const end = new Date(year, 11, 31, 23, 59, 59, 999);

    const qb = this.txRepo
      .createQueryBuilder('t')
      .select('to_char(t."createdAt", \'MM\')', 'month')
      .addSelect('t."sessionId"', 'sessionId')
      .addSelect('SUM(t."totalPrice")', 'totalPrice')
      .addSelect('COUNT(*)', 'count')
      .where('t.status IN (:...statuses)', {
        statuses: [
          TransactionStatus.COMPLETED,
          TransactionStatus.PARTIAL,
          TransactionStatus.DEBT,
        ],
      })
      .andWhere('t."createdAt" BETWEEN :start AND :end', { start, end });

    if (branchId) qb.andWhere('t.branch_id = :branchId', { branchId });

    qb.groupBy('month, t."sessionId"').orderBy('month');

    const rows = await qb.getRawMany();

    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const labels = monthNames.slice();
    const series = new Array(12).fill(0);
    const counts = new Array(12).fill(0);

    for (const r of rows) {
      const idx = Number(r.month) - 1;
      if (idx >= 0 && idx < 12) {
        const paidAmount = await this.getActualPaidAmount(r.sessionId);
        series[idx] += paidAmount;
        counts[idx] += this.toNumber(r.count);
      }
    }

    // Summary
    const allTxs = await this.txRepo.find({
      where: {
        status: In([
          TransactionStatus.COMPLETED,
          TransactionStatus.PARTIAL,
          TransactionStatus.DEBT,
        ]),
        createdAt: Between(start, end),
        ...(branchId && { branch: { id: branchId } }),
      },
    });

    let totalSales = 0;
    let totalReturns = 0;
    const processedSessions = new Set<string>();

    for (const tx of allTxs) {
      if (processedSessions.has(tx.sessionId)) continue;
      processedSessions.add(tx.sessionId);

      const paidAmount = await this.getActualPaidAmount(tx.sessionId);

      if (tx.totalPrice < 0) {
        totalReturns += Math.abs(tx.totalPrice);
      } else {
        totalSales += paidAmount;
      }
    }

    const netTotal = totalSales - totalReturns;
    const transactionsCount = allTxs.length;

    return {
      success: true,
      period: 'yearly',
      year,
      labels,
      series,
      counts,
      summary: { totalSales, totalReturns, netTotal, transactionsCount },
    };
  }

  // top selling products for given period
  async topProducts(start: Date, end: Date, limit = 10, branchId?: string) {
    const qb = this.txRepo
      .createQueryBuilder('t')
      .select('t."productId"', 'productId')
      .addSelect('t."sessionId"', 'sessionId')
      .addSelect('SUM(COALESCE(t.quantity, 0))', 'totalQuantity')
      .addSelect('SUM(t."totalPrice")', 'totalPrice')
      .where('t.status IN (:...statuses)', {
        statuses: [
          TransactionStatus.COMPLETED,
          TransactionStatus.PARTIAL,
          TransactionStatus.DEBT,
        ],
      })
      .andWhere('t."createdAt" BETWEEN :start AND :end', { start, end });

    if (branchId) qb.andWhere('t.branch_id = :branchId', { branchId });

    qb.groupBy('t."productId", t."sessionId"').orderBy(
      'SUM(COALESCE(t.quantity, 0))',
      'DESC',
    );

    const rows = await qb.getRawMany();

    // Mahsulotlar bo'yicha guruhlash va haqiqiy daromadni hisoblash
    const productMap = new Map<
      string,
      {
        quantity: number;
        revenue: number;
        sessions: Set<string>;
      }
    >();

    for (const r of rows) {
      const pid = r.productid || r.productId;
      const sessionId = r.sessionId;

      if (!productMap.has(pid)) {
        productMap.set(pid, {
          quantity: 0,
          revenue: 0,
          sessions: new Set(),
        });
      }

      const data = productMap.get(pid)!;
      data.quantity += this.toNumber(r.totalQuantity);

      // Agar session avval qaralgan bo'lsa, o'tkazib yuborish
      if (!data.sessions.has(sessionId)) {
        data.sessions.add(sessionId);

        // Session uchun haqiqiy to'langan summani hisoblash
        const payment = await this.paymentRepo.findOne({
          where: { sessionId },
        });

        if (payment && payment.paidBreakdown) {
          const totalPaid =
            (payment.paidBreakdown.cash || 0) +
            (payment.paidBreakdown.terminal || 0) +
            (payment.paidBreakdown.click || 0);

          const totalSum = payment.totalSum || 0;
          const totalPrice = this.toNumber(r.totalPrice);

          // Proportional hisoblash: mahsulot narxining to'langan qismi
          const paidRatio = totalSum > 0 ? totalPaid / totalSum : 0;
          const productRevenue = totalPrice * paidRatio;

          data.revenue += productRevenue;
        }
      }
    }

    // Map'dan array'ga o'tkazish va saralash
    const productData = Array.from(productMap.entries())
      .map(([productId, data]) => ({
        productId,
        totalQuantity: data.quantity,
        totalRevenue: data.revenue,
      }))
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, limit);

    // Mahsulot ma'lumotlarini olish
    const productIds = productData.map((d) => d.productId);
    const products = productIds.length
      ? await this.productRepo.findByIds(productIds)
      : [];

    const productInfoMap = new Map<string, any>();
    for (const p of products) productInfoMap.set(p.id, p);

    const result = productData.map((d) => {
      const p = productInfoMap.get(d.productId);
      return {
        productId: d.productId,
        name: p?.name || null,
        barcode: p?.barcode || null,
        totalQuantity: d.totalQuantity,
        totalRevenue: Math.round(d.totalRevenue),
      };
    });

    return {
      success: true,
      start: start.toISOString(),
      end: end.toISOString(),
      items: result,
    };
  }
}
