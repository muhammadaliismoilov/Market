import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { UserRole } from '../users.entity';

export class CreateUserDto {
  @ApiProperty({
    example: 'Ali Ismoilov',
    description: 'Foydalanuvchining to‘liq ismi',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    example: '998901234567',
    description: 'Foydalanuvchining telefon raqami (unikal bo‘lishi kerak)',
  })
  @IsString()
  @Matches(/^998[0-9]{9}$/, {
    message: 'Telefon raqam 998 bilan boshlanishi va 12 xonali bo‘lishi kerak',
  })
  phone: string;

  @ApiProperty({
    example: 'cashier',
    enum: UserRole,
    default: UserRole.CASHIER,
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
