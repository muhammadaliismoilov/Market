import { IsNumber } from 'class-validator';

export class RepayDebtDto {
  @IsNumber()
  amount: number;
}
