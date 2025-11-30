// create-transaction.dto.ts
import { IsString, IsInt, IsNumber, IsOptional, IsEnum, Min, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '../transaction.entity';

export class CreateTransactionDto {
  @ApiProperty({ example: '1234567890123', description: 'Mahsulot barkodi' })
  @IsString()
  barcode: string;

  @ApiPropertyOptional({ example: 2, description: 'Mahsulot soni (dona)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({ example: 1.5, description: 'Mahsulot og\'irligi (kg)' })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  weight?: number;

  @ApiPropertyOptional({ example: 'session-123', description: 'Sessiya ID' })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiPropertyOptional({ example: 'Izoh', description: 'Qo\'shimcha ma\'lumot' })
  @IsOptional()
  @IsString()
  notes?: string;
}

// transaction-scan.dto.ts
export class TransactionScanDto {
  @ApiProperty({ example: '1234567890123', description: 'Mahsulot barkodi' })
  @IsString()
  barcode: string;

  @ApiPropertyOptional({ example: 'session-123', description: 'Sessiya ID' })
  @IsOptional()
  @IsString()
  sessionId?: string;
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
  @ApiProperty({ example: '1234567890123', description: 'Mahsulot barkodi' })
  @IsString()
  barcode: string;

  @ApiProperty({ example: 'TRX-20231129-001', description: 'Tranzaksiya raqami' })
  @IsString()
  transactionNumber: string;

  @ApiPropertyOptional({ example: 2, description: 'Qaytariladigan soni' })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({ example: 1.5, description: 'Qaytariladigan og\'irligi' })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  weight?: number;

  @ApiPropertyOptional({ example: 'Yaroqsiz mahsulot', description: 'Qaytarish sababi' })
  @IsOptional()
  @IsString()
  reason?: string;
}