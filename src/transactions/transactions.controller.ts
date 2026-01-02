// transaction.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Request,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { TransactionService } from './transactions.service';
import {
  TransactionScanDto,
  CompleteSessionDto,
  ReturnTransactionDto,
} from './dto/transaction.dto';
import { JwtAuthGuard } from '../common/guard/jwt.auth.guard';
import { TransactionCleanerService } from './transaction-cleaner.service';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly transactionCleanerService: TransactionCleanerService,
  ) {}

  @Post('scan')
  @ApiOperation({
    summary: "Mahsulot barcode skanerlash (va sessiyaga qo'shish)",
  })
  @ApiResponse({
    status: 200,
    description: "Mahsulot ma'lumotlari yoki sessiyaga qo'shilgan tranzaksiya",
  })
  async scanProduct(@Request() req, @Body() scanDto: TransactionScanDto) {
    return this.transactionService.scanProduct(req.user.userId, scanDto);
  }

  // @Post('universal/:userId')
  // @ApiOperation({ summary: 'Bir yoki bir nechta mahsulotni sotish' })
  // @ApiResponse({ status: 201, description: 'Sotuv muvaffaqiyatli amalga oshirildi' })
  // @ApiResponse({ status: 400, description: 'Validation error / Omborda yetarli mahsulot yo‘q' })
  // async createUniversalTransaction(
  //   @Request() req,
  //   @Body() dto: CreateUniversalTransactionDto,
  // ) {
  //   return this.transactionService.createUniversalTransaction(req.user.userId, dto);
  // }

  @Get('session')
  @ApiOperation({ summary: "Sessiya bo'yicha tranzaksiyalarni ko'rish" })
  @ApiQuery({ name: 'sessionId', required: true })
  @ApiResponse({ status: 200, description: 'Sessiya tranzaksiyalari' })
  async getSessionTransactions(
    @Request() req,
    @Query('sessionId') sessionId: string,
  ) {
    return this.transactionService.getSessionTransactions(
      req.user.userId,
      sessionId,
    );
  }

  @Post('complete-session')
  @ApiOperation({ summary: "Sessiyani tugatish (to'lov)" })
  @ApiResponse({ status: 200, description: "To'lov amalga oshirildi" })
  async completeSession(
    @Request() req,
    @Body() completeDto: CompleteSessionDto,
  ) {
    return this.transactionService.completeSession(
      req.user.userId,
      completeDto,
    );
  }

  @Patch('return')
  @ApiOperation({ summary: 'Mahsulotni qaytarish' })
  @ApiResponse({ status: 200, description: 'Mahsulot qaytarildi' })
  async returnProduct(@Request() req, @Body() returnDto: ReturnTransactionDto) {
    return this.transactionService.returnProduct(req.user.userId, returnDto);
  }

  @Get('daily-report')
  @ApiOperation({ summary: 'Kassir kunlik hisoboti' })
  @ApiQuery({ name: 'date', required: false, example: '2025-12-01' })
  @ApiResponse({ status: 200, description: 'Kunlik hisobot' })
  async getDailyReport(@Request() req, @Query('date') date?: string) {
    return this.transactionService.getCashierDailyReport(req.user.userId, date);
  }

  @Delete('cancel-session/:sessionId')
  @ApiOperation({ summary: 'Sessionni bekor qilish (yakunlanmagan savdo)' })
  @ApiParam({
    name: 'sessionId',
    required: true,
    description: 'Bekor qilinadigan sessiya ID',
  })
  async cancelSession(@Param('sessionId') sessionId: string) {
    return this.transactionCleanerService.cancelSession(sessionId);
  }
}
