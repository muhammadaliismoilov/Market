import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guard/jwt.auth.guard';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('daily')
  @ApiOperation({ summary: 'Kunlik hisobot (grafik uchun labels/series)' })
  @ApiQuery({ name: 'date', required: false, example: '2025-12-01' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiResponse({ status: 200 })
  async daily(@Query('date') date?: string, @Query('branchId') branchId?: string) {
    return this.reports.dailyReport(date, branchId);
  }

  @Get('weekly')
  @ApiOperation({ summary: 'Haftalik hisobot (Mon-Sun)' })
  @ApiQuery({ name: 'date', required: false, example: '2025-12-01' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiResponse({ status: 200 })
  async weekly(@Query('date') date?: string, @Query('branchId') branchId?: string) {
    return this.reports.weeklyReport(date, branchId);
  }

  @Get('monthly')
  @ApiOperation({ summary: 'Oylik hisobot (oy kunlari bo\'yicha)' })
  @ApiQuery({ name: 'date', required: false, example: '2025-12-01' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiResponse({ status: 200 })
  async monthly(@Query('date') date?: string, @Query('branchId') branchId?: string) {
    return this.reports.monthlyReport(date, branchId);
  }

  @Get('yearly')
  @ApiOperation({ summary: 'Yillik hisobot (oylar bo\'yicha)' })
  @ApiQuery({ name: 'year', required: false, example: 2025 })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiResponse({ status: 200 })
  async yearly(@Query('year') year?: string, @Query('branchId') branchId?: string) {
    const y = year ? Number(year) : undefined;
    return this.reports.yearlyReport(y, branchId);
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Eng ko\'p sotilayotgan mahsulotlar (period orqali)' })
  @ApiQuery({ name: 'start', required: true, example: '2025-12-01' })
  @ApiQuery({ name: 'end', required: true, example: '2025-12-31' })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiResponse({ status: 200 })
  async topProducts(
    @Query('start') start: string,
    @Query('end') end: string,
    @Query('limit') limit?: string,
    @Query('branchId') branchId?: string,
  ) {
    const s = new Date(start);
    const e = new Date(end);
    const l = limit ? Number(limit) : 10;
    return this.reports.topProducts(s, e, l, branchId);
  }
}