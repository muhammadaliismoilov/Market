// common/guard/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from '../../users/users.entity';

export interface JwtPayload {
  userId: string;
  phone: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(Users)
    private userRepo: Repository<Users>,
  ) {
    // TO'G'RILANDI: Secret'ni tekshirish va TypeScript xatosini hal qilish
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET environment variable sozlanmagan');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret, // Artiq undefined bo'lishi mumkin emas
    });
  }

  async validate(payload: JwtPayload) {
    const { userId } = payload;

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
      role: user.role,
      fullName: user.fullName,
      branchId: user.branch?.id
    };
  }
}