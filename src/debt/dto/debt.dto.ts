import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsPhoneNumber,
  IsNumber,
  Min,
  Matches,
} from 'class-validator';


export class RepayDebtDto {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  amount: number;
}


