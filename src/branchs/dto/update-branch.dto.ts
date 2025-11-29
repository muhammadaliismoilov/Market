import { PartialType } from '@nestjs/mapped-types';
import { CreateBranchDto } from './create-branch.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateBranchDto extends PartialType(CreateBranchDto) {
  @ApiPropertyOptional({ example: 'Gurlan bozor', description: 'Filial nomi' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: 'Gurlan shahar, Xorazm viloyati',
    description: 'Filial manzili',
  })
  @IsString()
  @IsOptional()
  location?: string;
}
