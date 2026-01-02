// create-transaction.dto.ts
import { IsString, IsInt, IsNumber, IsOptional, IsEnum, Min, IsUUID, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '../transaction.entity';
import { Type } from 'class-transformer';

// transaction-scan.dto.ts
export class TransactionScanDto {
  @ApiProperty({ example: '1234567890123', description: 'Mahsulot barkodi' })
  @IsString()
  barcode: string;

  @ApiPropertyOptional({ example: 1, description: 'Dona soni (dona bo‘lsa)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({ example: 0.5, description: 'Og\'irlik (kg) (og\'irlik bo‘lsa)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0.001)
  weight?: number;

  @ApiPropertyOptional({ example: 'Qo\'shimcha izoh', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

// complete-session.dto.ts
export class CompleteSessionDto {
  @ApiProperty({ example: 'session-123', description: 'Sessiya ID' })
  @IsString()
  sessionId: string;

  @ApiPropertyOptional({ example: 'Mijoz to\'ladi', description: 'Izoh' })
  @IsOptional()
  @IsString()
  notes?: string;
}

// return-transaction.dto.ts
export class ReturnTransactionDto {

  @ApiProperty({ example: 'TRX-20231129-001', description: 'Tranzaksiya raqami' })
  @IsString()
  transactionNumber: string;

  @ApiPropertyOptional({ example: 'Yaroqsiz mahsulot', description: 'Qaytarish sababi' })
  @IsOptional()
  @IsString()
  reason?: string;
}