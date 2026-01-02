// auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/auth.dto';
import { JwtAuthGuard } from 'src/common/guard/jwt.auth.guard';
import { Roles } from 'src/common/guard/jwt.decarator';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { UserRole } from 'src/users/users.entity';
import type { Response } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Tizimga kirish' })
  @ApiResponse({ status: 200, description: 'Tizimga kirish muvaffaqiyatli' })
  @ApiResponse({ status: 401, description: "Telefon yoki parol noto'g'ri" })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto);

    const { accessToken, refreshToken } = result;

    // 🍪 ACCESS TOKEN
    // TO'G'RILANDI: secure environment variable ga bog'landi va maxAge comment to'g'rilandi (1 soat)
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // productionda true, developmentda false
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000, // 1 soat (3600 sekund)
    });

    // 🍪 REFRESH TOKEN
    // TO'G'RILANDI: secure environment variable ga bog'landi
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // productionda true, developmentda false
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 kun
    });

    return {
      success: true,
      message: 'Tizimga kirildi',
      user: result.user,
      accessToken,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tizimdan chiqish' })
  @ApiResponse({
    status: 200,
    description: 'Tizimdan muvaffaqiyatli chiqdingiz',
  })
  @ApiResponse({ status: 401, description: 'Authentifikatsiya xatosi' })
  async logout(@Request() req, @Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return this.authService.logout(req.user.userId);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('bearer')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  @ApiOperation({ summary: "Foydalanuvchi profilini ko'rish" })
  @ApiResponse({ status: 200, description: "Profil ma'lumotlari" })
  @ApiResponse({ status: 401, description: 'Token yaroqsiz' })
  @ApiResponse({ status: 403, description: "Ruxsat yo'q" })
  async getProfile(@Request() req) {
    return {
      success: true,
      user: req.user,
    };
  }
}
