import { Controller, Post, Get, Param, Body, Delete, UseGuards } from '@nestjs/common';
import { PaymentService } from './payments.service';
import { CreatePaymentDto } from './dto/payment.dto';
import { ApiTags, ApiResponse, ApiBearerAuth, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { Payment } from './payment.entity';
import { JwtAuthGuard } from 'src/common/guard/jwt.auth.guard';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentService: PaymentService) {}

  // CREATE PAYMENT
  @Post()
  @ApiOperation({ summary: 'Yangi to‘lov yaratish' })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({
    status: 201,
    description: 'To‘lov muvaffaqiyatli yaratildi',
    type: Payment,
  })
  @ApiResponse({ status: 400, description: 'Xato: required field yoki validation' })
  async create(@Body() dto: CreatePaymentDto) {
    return await this.paymentService.create(dto);
  }

  // FIND ALL PAYMENTS
  @Get()
  @ApiOperation({ summary: 'Barcha to‘lovlarni olish' })
  @ApiResponse({
    status: 200,
    description: 'To‘lovlar ro‘yxati',
    type: [Payment],
  })
  @ApiResponse({ status: 500, description: 'Server xatosi' })
  async findAll() {
    return await this.paymentService.findAll();
  }

  // FIND PAYMENT BY ID
  @Get(':id')
  @ApiOperation({ summary: 'Bitta to‘lovni ID orqali olish' })
  @ApiParam({ name: 'id', description: 'To‘lov ID' })
  @ApiResponse({
    status: 200,
    description: 'To‘lov ma‘lumotlari',
    type: Payment,
  })
  @ApiResponse({ status: 404, description: 'To‘lov topilmadi' })
  async findOne(@Param('id') id: string) {
    return await this.paymentService.findOne(id);
  }

  // DELETE PAYMENT
  @Delete(':id')
  @ApiOperation({ summary: "To‘lovni o‘chirish" })
  @ApiParam({ name: 'id', description: "O‘chiriladigan to‘lov ID" })
  @ApiResponse({ status: 204, description: "To‘lov o‘chirildi" })
  @ApiResponse({ status: 404, description: 'To‘lov topilmadi' })
  async remove(@Param('id') id: string) {
    await this.paymentService.remove(id);
  }
}
