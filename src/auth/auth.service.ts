// auth/auth.service.ts
import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config'; // TO'G'RILANDI: ConfigService import qilindi
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Users } from '../users/users.entity';
import { LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users)
    private userRepo: Repository<Users>,
    private jwtService: JwtService,
    private configService: ConfigService, // TO'G'RILANDI: ConfigService inject qilindi
  ) {}

  async login(loginDto: LoginDto) {
    try {
      const { phone, password } = loginDto;

      // Foydalanuvchini topish
      const user = await this.userRepo.findOne({ 
        where: { phone },
        relations: ['branch']
      });

      if (!user) {
        throw new NotFoundException('Foydalanuvchi topilmadi');
      }

      // Parolni tekshirish
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Telefon yoki parol noto\'g\'ri');
      }

      // Token yaratish
      const token = await this.generateToken(user);

      
      return {
        success: true,
        message: 'Tizimga kirish muvaffaqiyatli',
        user: {
          id: user.id,
          phone: user.phone,
          fullName: user.fullName,
          role: user.role,
        },
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  async logout(userId: string) {
    try {
      // Foydalanuvchini tekshirish
      const user = await this.userRepo.findOne({ 
        where: { id: userId }
      });

      if (!user) {
        throw new UnauthorizedException('Foydalanuvchi topilmadi');
      }

      // Client tomonida token o'chiriladi
      return {
        success: true,
        message: 'Tizimdan muvaffaqiyatli chiqdingiz',
      };
    } catch (error) {
      throw error;
    }
  }

  private async generateToken(user: Users) {
    const payload = {
      userId: user.id,
      phone: user.phone,
      role: user.role,
    };

    // TO'G'RILANDI: ConfigService orqali secret olinadi, default qiymatlar olib tashlandi
    // Eslatma: JWT_SECRET va JWT_REFRESH_SECRET .env faylida bo'lishi shart
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    const jwtRefreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    
    if (!jwtSecret || !jwtRefreshSecret) {
      throw new Error('JWT_SECRET va JWT_REFRESH_SECRET environment variable\'lari sozlanmagan');
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: jwtSecret,
        expiresIn: '1d',
      }),
      this.jwtService.signAsync(payload, {
        secret: jwtRefreshSecret,
        expiresIn: '7d',
      }),
    ]);
    return { accessToken, refreshToken };
  }

  async validateUser(userId: string) {
    const user = await this.userRepo.findOne({ 
      where: { id: userId },
      relations: ['branch']
    });

    if (!user) {
      throw new UnauthorizedException('Foydalanuvchi topilmadi');
    }

    return {
      userId: user.id,
      phone: user.phone,
      fullName: user.fullName,
      role: user.role,
      branchId: user.branch?.id,
    };
  }
}