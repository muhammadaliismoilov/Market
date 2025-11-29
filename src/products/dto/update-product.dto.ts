import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { IsOptional } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiPropertyOptional({
    description: "Mahsulot o'chirilganligini belgilash",
    default: false,
    required: false,
  })
  @IsOptional()
  onDelete?: boolean;
}
