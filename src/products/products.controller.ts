import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Products } from './product.entity';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  //  CREATE
  @Post()
  @ApiOperation({ summary: 'Yangi mahsulot yaratish' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({
    status: 201,
    description: 'Mahsulot yaratildi',
    type: Products,
  })
  @ApiResponse({ status: 500, description: 'Server xatosi' })
  async create(@Body() dto: CreateProductDto) {
    return await this.productsService.create(dto);
  }
  // FIND ACTIVE PRODUCTS
  @Get('active')
  @ApiOperation({ summary: 'Faqat faol mahsulotlarni olish' })
  @ApiResponse({
    status: 200,
    description: 'Faol mahsulotlar ro‘yxati',
    type: [Products],
  })
  async findActive() {
    return await this.productsService.findActiveProducts();
  }

  //  FIND ALL
  @Get()
  @ApiOperation({ summary: 'Barcha mahsulotlarni olish' })
  @ApiResponse({
    status: 200,
    description: "Mahsulotlar ro'yxati",
    type: [Products],
  })
  @ApiResponse({ status: 500, description: 'Server xatosi' })
  async findAll() {
    return await this.productsService.findAll();
  }

  //  FIND ONE
  @Get(':id')
  @ApiOperation({ summary: 'Bitta mahsulotni ID orqali olish' })
  @ApiParam({ name: 'id', description: 'Mahsulot ID' })
  @ApiResponse({
    status: 200,
    description: "Mahsulot ma'lumotlari",
    type: Products,
  })
  @ApiResponse({ status: 404, description: 'Mahsulot topilmadi' })
  async findOne(@Param('id') id: string) {
    return await this.productsService.findOne(id);
  }

  //  UPDATE
  @Patch(':id')
  @ApiOperation({ summary: 'Mahsulotni yangilash' })
  @ApiParam({ name: 'id', description: 'Yangilanadigan mahsulot ID' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({
    status: 200,
    description: 'Mahsulot yangilandi',
    type: Products,
  })
  @ApiResponse({ status: 404, description: 'Mahsulot topilmadi' })
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return await this.productsService.update(id, dto);
  }

  //  DELETE
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Mahsulotni o'chirish" })
  @ApiParam({ name: 'id', description: "O'chiriladigan mahsulot ID" })
  @ApiResponse({ status: 204, description: "Mahsulot o'chirildi" })
  @ApiResponse({ status: 404, description: 'Mahsulot topilmadi' })
  async remove(@Param('id') id: string) {
    await this.productsService.remove(id);
  }
}
