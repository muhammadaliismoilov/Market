import { Controller, Get, Query, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { DebtService } from './debt.service';
import { RepayDebtDto } from './dto/debt.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guard/jwt.auth.guard';

@ApiTags('Debt')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('debt')
export class DebtController {
  constructor(private readonly service: DebtService) {}

  @Get()
  @ApiOperation({ summary: 'Barcha qarzlarni olish' })
  @ApiResponse({ status: 200, description: 'Qarzlar ro\'yxati muvaffaqiyatli qaytarildi' })
  async getAllDebts() {
    return this.service.getAllDebts();
  }

  @Get('list')
  @ApiOperation({ summary: 'Qarzlarni status bo\'yicha filtrlash' })
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    enum: ['pending', 'partial', 'paid'],
    description: 'Qarz statusi (pending, partial, paid)'
  })
  @ApiResponse({ status: 200, description: 'Filtrlangan qarzlar ro\'yxati' })
  async list(@Query('status') status?: string) {
    return this.service.list(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Bitta qarzni ID bo\'yicha olish' })
  @ApiParam({ name: 'id', description: 'Qarz ID raqami', example: 'uuid-string' })
  @ApiResponse({ status: 200, description: 'Qarz va tranzaksiyalar ma\'lumoti' })
  @ApiResponse({ status: 404, description: 'Qarzdor topilmadi' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/repay')
  @ApiOperation({ summary: 'Qarzni to\'lash' })
  @ApiParam({ name: 'id', description: 'Qarz ID raqami', example: 'uuid-string' })
  @ApiBody({ 
    type: RepayDebtDto,
    description: 'To\'lov summasi',
    examples: {
      qisman: {
        summary: 'Qisman to\'lov',
        value: { amount: 50000 }
      },
      toliq: {
        summary: 'To\'liq to\'lov',
        value: { amount: 100000 }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Qarz muvaffaqiyatli to\'landi',
    schema: {
      example: {
        debt: {
          id: 'uuid',
          sessionId: 'session-123',
          fullName: 'Ali Valiyev',
          phone: '+998901234567',
          totalDebt: 100000,
          repaidAmount: 50000,
          remainingDebt: 50000,
          status: 'partial'
        },
        transactions: [],
        message: 'Qarz qisman to\'landi. Qolgan qarz: 50000'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Qarz topilmadi' })
  @ApiResponse({ status: 400, description: 'To\'lov summasi qarzdan katta' })
  async repay(@Param('id') id: string, @Body() dto: RepayDebtDto) {
    return this.service.repay(id, dto);
  }
}