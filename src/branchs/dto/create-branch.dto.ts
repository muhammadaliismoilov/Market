import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBranchDto {
  @ApiProperty(
    { example: 'Gurlan bozor',
    description: 'Filial nomi',}
  )
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty(
    { example: 'Gurlan shahar, Xorazm viloyati',
    description: 'Filial manzili',}
  )
  @IsString()
  @IsNotEmpty()
  location: string;
}

