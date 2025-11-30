// transaction.controller.ts
import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Query, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiQuery 
} from '@nestjs/swagger';
import { TransactionService } from './transactions.service';
import { 
  CreateTransactionDto, 
  TransactionScanDto, 
  CompleteSessionDto, 
  ReturnTransactionDto 
} from './dto/create-transaction.dto';
import { JwtAuthGuard } from '../common/guard/jwt.auth.guard';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('scan')
  @ApiOperation({ summary: 'Mahsulot barcode skanerlash' })
  @ApiResponse({ status: 200, description: 'Mahsulot ma\'lumotlari' })
  async scanProduct(
    @Request() req,
    @Body() scanDto: TransactionScanDto
  ) {
    return this.transactionService.scanProduct(req.user.userId, scanDto);
  }

  @Post('create')
  @ApiOperation({ summary: 'Mahsulot sotish (tranzaksiya yaratish)' })
  @ApiResponse({ status: 201, description: 'Tranzaksiya yaratildi' })
  async createTransaction(
    @Request() req,
    @Body() createDto: CreateTransactionDto
  ) {
    return this.transactionService.createTransaction(req.user.userId, createDto);
  }

  @Get('session')
  @ApiOperation({ summary: 'Sessiya bo\'yicha tranzaksiyalarni ko\'rish' })
  @ApiQuery({ name: 'sessionId', required: true })
  @ApiResponse({ status: 200, description: 'Sessiya tranzaksiyalari' })
  async getSessionTransactions(
    @Request() req,
    @Query('sessionId') sessionId: string
  ) {
    return this.transactionService.getSessionTransactions(req.user.userId, sessionId);
  }

  @Post('complete-session')
  @ApiOperation({ summary: 'Sessiyani tugatish (to\'lov)' })
  @ApiResponse({ status: 200, description: 'To\'lov amalga oshirildi' })
  async completeSession(
    @Request() req,
    @Body() completeDto: CompleteSessionDto
  ) {
    return this.transactionService.completeSession(req.user.userId, completeDto);
  }

  @Post('return')
  @ApiOperation({ summary: 'Mahsulotni qaytarish' })
  @ApiResponse({ status: 200, description: 'Mahsulot qaytarildi' })
  async returnProduct(
    @Request() req,
    @Body() returnDto: ReturnTransactionDto
  ) {
    return this.transactionService.returnProduct(req.user.userId, returnDto);
  }

  @Get('daily-report')
  @ApiOperation({ summary: 'Kassir kunlik hisoboti' })
  @ApiQuery({ name: 'date', required: false, example: '2023-11-29' })
  @ApiResponse({ status: 200, description: 'Kunlik hisobot' })
  async getDailyReport(
    @Request() req,
    @Query('date') date?: string
  ) {
    return this.transactionService.getCashierDailyReport(req.user.userId, date);
  }
}