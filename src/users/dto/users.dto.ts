import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches, Max, Min } from 'class-validator';
import { UserRole } from '../users.entity';

export class CreateUserDto {
  @ApiProperty({
    example: 'Ali Ismoilov',
    description: 'Foydalanuvchining to‘liq ismi',
  })
  @IsString()
  // @Min(3)
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
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: 'password123',
    description: 'Foydalanuvchining paroli',
  })
  // @Min(6)
  // @Max(10)
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: 'cashier',
    enum: UserRole,
    default: UserRole.CASHIER,
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiProperty({example:'branch-uuid', description:'Fillialning UUID si kiritiladi'})
  @IsString()
  @IsOptional()
  branchId?: string;
}


export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'Ali Ismoilov',
    description: 'Foydalanuvchining to‘liq ismi',
  })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({
    example: '+998901234567',
    description: 'Telefon raqam (unikal bo‘lishi kerak)',
  })
  @IsString()
  @IsOptional()
  @Matches(/^998[0-9]{9}$/, {
    message: 'Telefon raqam 998 bilan boshlanishi va 12 xonali bo‘lishi kerak',
  })
  phone?: string;

  @ApiPropertyOptional({
      example: 'password123',
      description: 'Foydalanuvchining paroli',
    })
    @Min(6)
    @Max(10)
    @IsString()
    @IsOptional()
    password?: string;

  @ApiPropertyOptional({
    example: 'admin',
    enum: UserRole,
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({
    example: 'branch-uuid',
    description: 'Fillialning UUID si kiritiladi',
  })
  @IsString()
  @IsOptional()
  branchId?: string;
}