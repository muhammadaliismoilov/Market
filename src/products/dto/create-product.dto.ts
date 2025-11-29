import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional, MaxLength, Min, IsNotEmpty, Length } from 'class-validator';
import { ProductType } from '../product.entity';

export class CreateProductDto {
  @ApiProperty({ description: 'Mahsulot nomi' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Mahsulot soni', example: 10 })
  @IsNumber()
  @IsOptional()
  count?: number;

  @ApiProperty({ description: 'Mahsulot og\'irligi (KG bo\'lsa)', example: 1.5 })
  @IsNumber()
  @IsOptional()
  weight?: number;

  @ApiProperty({ description: 'Mahsulot sotish narxi', example: 25000 })
  @IsNumber()
  price: number;

  @ApiPropertyOptional({ description: 'Mahsulot shtrix-kodi, optional', maxLength: 13 })
  @IsOptional()
  @IsNumber()
  @Length(13, 13, { message: 'Barcode 13 xonali bo‘lishi kerak' })
  barcode?: number;

  @ApiProperty({ description: 'Mahsulot tannarxi', example: 20000 })
  @IsNumber()
  @IsNotEmpty()
  costPrice: number;

  @ApiProperty({ enum: ProductType, description: 'Mahsulot turi: dona yoki kg' })
  @IsEnum(ProductType)
  @IsNotEmpty()
  type: ProductType;

  @ApiProperty({ description: 'Branch ID', example: 'f2cba053-0064-4e7e-8264-2fb07b8ed74c', required: false })
  @IsOptional()
  @IsString()
  branchId?: string;

  
}
