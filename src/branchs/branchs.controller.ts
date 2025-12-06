import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BranchsService } from './branchs.service';
import { JwtAuthGuard } from 'src/common/guard/jwt.auth.guard';

@ApiTags('Branches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('branches')
export class BranchsController {
  constructor(private readonly branchesService: BranchsService) {}

  // CREATE
  @Post()
  @ApiOperation({ summary: 'Yangi filial yaratish' })
  @ApiResponse({ status: 201, description: 'Filial muvaffaqiyatli yaratildi' })
  @ApiResponse({ status: 409, description: 'Bu nom bilan filial allaqachon mavjud' })
  @ApiResponse({ status: 500, description: 'Server xatoligi' })
  async create(@Body() dto: CreateBranchDto) {
    return this.branchesService.create(dto);
  }

  // GET ALL
  @Get()
  @ApiOperation({ summary: 'Barcha filiallarni olish' })
  @ApiResponse({ status: 200, description: 'Filiallar ro’yxati' })
  @ApiResponse({ status: 500, description: 'Server xatoligi' })
  async findAll() {
    return this.branchesService.findAll();
  }

  // GET ONE
  @Get(':id')
  @ApiOperation({ summary: 'Bitta filial haqida ma’lumot olish' })
  @ApiParam({ name: 'id', description: 'Filial ID' })
  @ApiResponse({ status: 200, description: 'Filial ma’lumotlari' })
  @ApiResponse({ status: 404, description: 'Filial topilmadi' })
  @ApiResponse({ status: 500, description: 'Server xatoligi' })
  async findOne(@Param('id') id: string) {
    return this.branchesService.findOne(id);
  }

  // UPDATE
  @Patch(':id')
  @ApiOperation({ summary: 'Filial ma’lumotlarini yangilash' })
  @ApiParam({ name: 'id', description: 'Filial ID' })
  @ApiResponse({ status: 200, description: 'Filial muvaffaqiyatli yangilandi' })
  @ApiResponse({ status: 404, description: 'Filial topilmadi' })
  @ApiResponse({ status: 409, description: 'Bu nom bilan filial mavjud' })
  @ApiResponse({ status: 500, description: 'Server xatoligi' })
  async update(@Param('id') id: string, @Body() dto: UpdateBranchDto) {
    return this.branchesService.update(id, dto);
  }

  // DELETE
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Filialni o‘chirish' })
  @ApiParam({ name: 'id', description: 'Filial ID' })
  @ApiResponse({ status: 200, description: 'Filial muvaffaqiyatli o‘chirildi' })
  @ApiResponse({ status: 404, description: 'Filial topilmadi' })
  @ApiResponse({ status: 500, description: 'Server xatoligi' })
  async remove(@Param('id') id: string) {
    return this.branchesService.remove(id);
  }
}
