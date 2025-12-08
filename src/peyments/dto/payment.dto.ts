

// import { ApiProperty } from '@nestjs/swagger';
// import {
//   IsArray,
//   IsEnum,
//   IsNumber,
//   ValidateNested,
//   IsNotEmpty,
//   IsOptional,
//   IsString,
//   Matches,
// } from 'class-validator';
// import { Type } from 'class-transformer';
// import { PaymentMethod } from '../payment.entity';

// export class PaymentItemDto {
//   @ApiProperty({
//     enum: PaymentMethod,
//     example: PaymentMethod.CASH,
//     description: 'Payment type: naqt | terminal | click | qarzdorlik',
//   })
//   @IsEnum(PaymentMethod)
//   method: PaymentMethod;

//   @ApiProperty({ example: 20000 })
//   @IsNumber()
//   amount: number;
// }

// export class CreatePaymentDto {
//    @ApiProperty()
//   @IsString()
//   @IsNotEmpty()
//   sessionId: string;


//   @ApiProperty({
//     type: [PaymentItemDto],
//     example: [
//       { method: 'cash', amount: 30000 },
//       { method: 'terminal', amount: 20000 },
//     ],
//   })
//   @IsArray()
//   @ValidateNested({ each: true })
//   @Type(() => PaymentItemDto)
//   payments: PaymentItemDto[];

//   @ApiProperty({ example:'Satdor', description:'Qarzdorning ismi', required: false })
//   @IsOptional()
//   @IsString()
//   fullName?: string;

//  @ApiProperty({ example: '998901234567', description: 'Telefon raqami' ,required:false})
//  @Matches(/^998[0-9]{9}$/, {
//      message: 'Telefon raqam 998 bilan boshlanishi va 12 xonali bo‘lishi kerak',
//    })
//   @IsOptional()
//   @IsString()
//   phone?: string;
// }

import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNumber,
  ValidateNested,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../payment.entity';

export class PaymentItemDto {
  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.CASH,
    description: 'Payment type: naqt | terminal | click | qarzdorlik',
  })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiProperty({ example: 20000 })
  @IsNumber()
  amount: number;
}

export class CreatePaymentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({
    type: [PaymentItemDto],
    example: [
      { method: 'cash', amount: 30000 },
      { method: 'terminal', amount: 20000 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentItemDto)
  payments: PaymentItemDto[];

  @ApiProperty({ example:'Satdor', description:'Qarzdorning ismi', required: false })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ example: '998901234567', description: 'Telefon raqami' ,required:false})
  @Matches(/^998[0-9]{9}$/, {
    message: 'Telefon raqam 998 bilan boshlanishi va 12 xonali bo‘lishi kerak',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    example: 50000,
    description: 'To‘lov summasi (server tomonidan hisoblanadi)',
    required: false,
    readOnly: true,
  })
  @IsOptional()
  @IsNumber()
  totalSum?: number; // server tomonidan hisoblanadi
}
