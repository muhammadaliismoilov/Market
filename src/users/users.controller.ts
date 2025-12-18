import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';

import { CreateUserDto ,UpdateUserDto} from './dto/users.dto';

import { UserService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Yangi user yaratish' })
  @ApiResponse({ status: 201, description: 'User yaratildi' })
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Barcha userlarni olish' })
  @ApiResponse({ status: 200 })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Bitta userni olish' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'User topilmadi' })
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new NotFoundException('User topilmadi');
    }
    return user;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Userni yangilash' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Userni o‘chirish' })
  @ApiResponse({ status: 200, description: 'User o‘chirildi' })
  @ApiResponse({ status: 404 })
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
