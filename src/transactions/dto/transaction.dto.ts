// create-transaction.dto.ts
import { IsString, IsInt, IsNumber, IsOptional, IsEnum, Min, IsUUID, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '../transaction.entity';
import { Type } from 'class-transformer';



// export class UniversalTransactionItemDto {
//   @ApiProperty({ example: '123456789', description: 'Mahsulot barcode' })
//   @IsString()
//   barcode: string;

//   @ApiProperty({ example: 3, description: 'Agar dona bo‘yicha sotilsa', required: false })
//   @IsOptional()
//   @IsNumber()
//   @Min(1)
//   quantity?: number;

//   @ApiProperty({ example: 1.5, description: 'Agar og‘irlik bo‘yicha sotilsa (kg)', required: false })
//   @IsOptional()
//   @IsNumber()
//   @Min(0.001)
//   weight?: number;

//   @ApiProperty({ example: 'Qo‘shimcha izoh', required: false })
//   @IsOptional()
//   @IsString()
//   notes?: string;
// }

// export class CreateUniversalTransactionDto {
//   @ApiProperty({ example: 'UUID', description: 'Optional session ID', required: false })
//   @IsOptional()
//   @IsUUID()
//   sessionId?: string;

//   @ApiProperty({ type: [UniversalTransactionItemDto], description: 'Mahsulotlar ro‘yxati' })
//   @IsArray()
//   @ValidateNested({ each: true })
//   @Type(() => UniversalTransactionItemDto)
//   items: UniversalTransactionItemDto[];
// }

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