import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  MaxLength,
  Min,
  IsNotEmpty,
  Length,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import { ProductType } from '../product.entity';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ description: 'Mahsulot nomi' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Mahsulot soni', example: 10 })
  @IsNumber()
  @IsOptional()
  count?: number;

  @ApiProperty({ description: "Mahsulot og'irligi (KG bo'lsa)", example: 1.5 })
  @IsNumber()
  @IsOptional()
  weight?: number;

  @ApiProperty({ description: 'Mahsulot sotish narxi', example: 25000 })
  @IsNumber()
  price: number;

  @ApiPropertyOptional({
    description: 'Mahsulot shtrix-kodi, optional',
    maxLength: 13,
  })
  @IsOptional()
  @IsString()
  @Length(13, 13, { message: 'Barcode 13 xonali bo‘lishi kerak' })
  barcode?: string;

  @ApiProperty({ description: 'Mahsulot tannarxi', example: 20000 })
  @IsNumber()
  @IsNotEmpty()
  costPrice: number;

  @ApiProperty({ isArray: true, enum: ProductType })
  @IsEnum(ProductType, { each: true }) // 🔵 har bir element enum bo'lsin
  @IsArray()
  type: ProductType[];

  @ApiProperty({
    description: 'Branch ID',
    example: '157f2913-1cf1-470a-890c-c490b960ef49',
    required: false,
  })
  @IsOptional()
  @IsString()
  branchId?: string;
}

export class UpdateProductDto {
  @ApiPropertyOptional({ description: 'Mahsulot nomi' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Mahsulot soni', example: 10 })
  @IsNumber()
  @IsOptional()
  count?: number;

  @ApiPropertyOptional({
    description: "Mahsulot og'irligi (KG bo'lsa)",
    example: 1.5,
  })
  @IsNumber()
  @IsOptional()
  weight?: number;

  @ApiPropertyOptional({ description: 'Mahsulot sotish narxi', example: 25000 })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({
    description: 'Mahsulot shtrix-kodi, optional',
    maxLength: 13,
  })
  @IsOptional()
  @IsString()
  @Length(13, 13, { message: 'Barcode 13 xonali bo‘lishi kerak' })
  barcode?: string;

  @ApiPropertyOptional({ description: 'Mahsulot tannarxi', example: 20000 })
  @IsNumber()
  @IsOptional()
  costPrice?: number;

  @ApiPropertyOptional({ isArray: true, enum: ProductType ,example:[ProductType.DONA,ProductType.KG]})
  @IsEnum(ProductType, { each: true }) // 🔵 har bir element enum bo'lsin
  @IsArray()
    @IsOptional()
  type?: ProductType[];

  @ApiPropertyOptional({
    description: 'Branch ID',
    example: 'f2cba053-0064-4e7e-8264-2fb07b8ed74c',
    required: false,
  })
  @IsOptional()
  @IsString()
  branchId?: string;

  @ApiPropertyOptional({
    description: "Mahsulot o'chirilganligini belgilash",
    default: false,
    required: false,
  })
  @IsOptional()
  onDelete?: boolean;
}
