import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transactions, TransactionStatus } from 'src/transactions/transaction.entity';
import { Products } from 'src/products/product.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Transactions)
    private readonly txRepo: Repository<Transactions>,
    @InjectRepository(Products)
    private readonly productRepo: Repository<Products>,
  ) {}

  // helper to convert raw numeric strings
  private toNumber(v: any): number {
    if (v === null || v === undefined) return 0;
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  }

  async dailyReport(date?: string, branchId?: string) {
    const target = date ? new Date(date) : new Date();
    const start = new Date(target);
    start.setHours(0, 0, 0, 0);
    const end = new Date(target);
    end.setHours(23, 59, 59, 999);

    const qb = this.txRepo.createQueryBuilder('t')
      .select("date_trunc('hour', t.\"createdAt\")", 'interval')
      .addSelect('SUM(t."totalPrice")', 'total')
      .addSelect('COUNT(*)', 'count')
      .where('t.status = :status', { status: TransactionStatus.COMPLETED })
      .andWhere('t."createdAt" BETWEEN :start AND :end', { start, end });

    if (branchId) qb.andWhere('t.branch_id = :branchId', { branchId });

    qb.groupBy('interval').orderBy('interval');

    const rows = await qb.getRawMany();

    // prepare labels 00-23
    const labels: string[] = [];
    const series: number[] = [];
    const counts: number[] = [];
    for (let h = 0; h < 24; h++) {
      labels.push(String(h).padStart(2, '0') + ':00');
      series.push(0);
      counts.push(0);
    }

    for (const r of rows) {
      const dt = new Date(r.interval);
      const hour = dt.getHours();
      series[hour] = this.toNumber(r.total);
      counts[hour] = this.toNumber(r.count);
    }

    // summary totals for the day
    const summaryQ = await this.txRepo.createQueryBuilder('t')
      .select('SUM(t."totalPrice")', 'totalSales')
      .addSelect('SUM(CASE WHEN t."totalPrice" < 0 THEN t."totalPrice" ELSE 0 END)', 'totalReturns')
      .addSelect('COUNT(*)', 'transactionsCount')
      .where('t.status = :status', { status: TransactionStatus.COMPLETED })
      .andWhere('t."createdAt" BETWEEN :start AND :end', { start, end });

    if (branchId) summaryQ.andWhere('t.branch_id = :branchId', { branchId });

    const summaryRaw = await summaryQ.getRawOne();
    const totalSales = this.toNumber(summaryRaw?.totalSales);
    const totalReturns = Math.abs(this.toNumber(summaryRaw?.totalReturns || 0));
    const netTotal = totalSales - totalReturns;
    const transactionsCount = this.toNumber(summaryRaw?.transactionsCount);

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
    const diffToMonday = ((day + 6) % 7);
    const monday = new Date(ref);
    monday.setDate(ref.getDate() - diffToMonday);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const qb = this.txRepo.createQueryBuilder('t')
      .select("date_trunc('day', t.\"createdAt\")", 'day')
      .addSelect('SUM(t."totalPrice")', 'total')
      .addSelect('COUNT(*)', 'count')
      .where('t.status = :status', { status: TransactionStatus.COMPLETED })
      .andWhere('t."createdAt" BETWEEN :start AND :end', { start: monday, end: sunday });

    if (branchId) qb.andWhere('t.branch_id = :branchId', { branchId });

    qb.groupBy('day').orderBy('day');

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
      const idx = ((dt.getDay() + 6) % 7);
      series[idx] = this.toNumber(r.total);
      counts[idx] = this.toNumber(r.count);
    }

    const summaryQ = this.txRepo.createQueryBuilder('t')
      .select('SUM(t."totalPrice")', 'totalSales')
      .addSelect('SUM(CASE WHEN t."totalPrice" < 0 THEN t."totalPrice" ELSE 0 END)', 'totalReturns')
      .addSelect('COUNT(*)', 'transactionsCount')
      .where('t.status = :status', { status: TransactionStatus.COMPLETED })
      .andWhere('t."createdAt" BETWEEN :start AND :end', { start: monday, end: sunday });

    if (branchId) summaryQ.andWhere('t.branch_id = :branchId', { branchId });

    const summaryRaw = await summaryQ.getRawOne();
    const totalSales = this.toNumber(summaryRaw?.totalSales);
    const totalReturns = Math.abs(this.toNumber(summaryRaw?.totalReturns || 0));
    const netTotal = totalSales - totalReturns;
    const transactionsCount = this.toNumber(summaryRaw?.transactionsCount);

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

    const qb = this.txRepo.createQueryBuilder('t')
      .select("to_char(t.\"createdAt\", 'DD')", 'day')
      .addSelect('SUM(t."totalPrice")', 'total')
      .addSelect('COUNT(*)', 'count')
      .where('t.status = :status', { status: TransactionStatus.COMPLETED })
      .andWhere('t."createdAt" BETWEEN :start AND :end', { start, end });

    if (branchId) qb.andWhere('t.branch_id = :branchId', { branchId });

    qb.groupBy('day').orderBy('day');

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
        series[idx] = this.toNumber(r.total);
        counts[idx] = this.toNumber(r.count);
      }
    }

    const summaryQ = this.txRepo.createQueryBuilder('t')
      .select('SUM(t."totalPrice")', 'totalSales')
      .addSelect('SUM(CASE WHEN t."totalPrice" < 0 THEN t."totalPrice" ELSE 0 END)', 'totalReturns')
      .addSelect('COUNT(*)', 'transactionsCount')
      .where('t.status = :status', { status: TransactionStatus.COMPLETED })
      .andWhere('t."createdAt" BETWEEN :start AND :end', { start, end });

    if (branchId) summaryQ.andWhere('t.branch_id = :branchId', { branchId });

    const summaryRaw = await summaryQ.getRawOne();
    const totalSales = this.toNumber(summaryRaw?.totalSales);
    const totalReturns = Math.abs(this.toNumber(summaryRaw?.totalReturns || 0));
    const netTotal = totalSales - totalReturns;
    const transactionsCount = this.toNumber(summaryRaw?.transactionsCount);

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

    const qb = this.txRepo.createQueryBuilder('t')
      .select("to_char(t.\"createdAt\", 'MM')", 'month')
      .addSelect('SUM(t."totalPrice")', 'total')
      .addSelect('COUNT(*)', 'count')
      .where('t.status = :status', { status: TransactionStatus.COMPLETED })
      .andWhere('t."createdAt" BETWEEN :start AND :end', { start, end });

    if (branchId) qb.andWhere('t.branch_id = :branchId', { branchId });

    qb.groupBy('month').orderBy('month');

    const rows = await qb.getRawMany();

    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const labels = monthNames.slice();
    const series = new Array(12).fill(0);
    const counts = new Array(12).fill(0);

    for (const r of rows) {
      const idx = Number(r.month) - 1;
      if (idx >=0 && idx < 12) {
        series[idx] = this.toNumber(r.total);
        counts[idx] = this.toNumber(r.count);
      }
    }

    const summaryQ = this.txRepo.createQueryBuilder('t')
      .select('SUM(t."totalPrice")', 'totalSales')
      .addSelect('SUM(CASE WHEN t."totalPrice" < 0 THEN t."totalPrice" ELSE 0 END)', 'totalReturns')
      .addSelect('COUNT(*)', 'transactionsCount')
      .where('t.status = :status', { status: TransactionStatus.COMPLETED })
      .andWhere('t."createdAt" BETWEEN :start AND :end', { start, end });

    if (branchId) summaryQ.andWhere('t.branch_id = :branchId', { branchId });

    const summaryRaw = await summaryQ.getRawOne();
    const totalSales = this.toNumber(summaryRaw?.totalSales);
    const totalReturns = Math.abs(this.toNumber(summaryRaw?.totalReturns || 0));
    const netTotal = totalSales - totalReturns;
    const transactionsCount = this.toNumber(summaryRaw?.transactionsCount);

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
    const qb = this.txRepo.createQueryBuilder('t')
      .select('t."productId"', 'productId')
      .addSelect('SUM(COALESCE(t.quantity, 0))', 'totalQuantity')
      .addSelect('SUM(t."totalPrice")', 'totalRevenue')
      .where('t.status = :status', { status: TransactionStatus.COMPLETED })
      .andWhere('t."created_at" BETWEEN :start AND :end', { start, end });

    if (branchId) qb.andWhere('t.branch_id = :branchId', { branchId });

    qb.groupBy('t."productId"')
      .orderBy('SUM(COALESCE(t.quantity, 0))', 'DESC')
      .limit(limit);

    const rows = await qb.getRawMany();

    const productIds = rows.map(r => r.productid || r.productId);
    const products = productIds.length ? await this.productRepo.findByIds(productIds) : [];

    const map = new Map<string, any>();
    for (const p of products) map.set(p.id, p);

    const result = rows.map(r => {
      const pid = r.productid || r.productId;
      const p = map.get(pid);
      return {
        productId: pid,
        name: p?.name || null,
        barcode: p?.barcode || null,
        totalQuantity: this.toNumber(r.totalQuantity),
        totalRevenue: this.toNumber(r.totalRevenue),
      };
    });

    return { success: true, start: start.toISOString(), end: end.toISOString(), items: result };
  }
}