import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Products, ProductType } from './product.entity';
import { Branchs } from 'src/branchs/branch.entity';
import { CreateProductDto ,UpdateProductDto} from './dto/product.dto';
import * as crypto from 'crypto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Products)
    private productRepo: Repository<Products>,

    @InjectRepository(Branchs)
    private branchRepo: Repository<Branchs>,
  ) {}

  // CREATE — mahsulot yaratish va isByWeight flagini to'g'ri belgilash
  async create(dto: CreateProductDto) {
    try {
      // isByWeight: agar weight > 0 bo'lsa true, aks holda false
      const isByWeight = dto.weight && dto.weight > 0 ? true : false;

      // Product yaratish
      const product = this.productRepo.create({
        ...dto,
        isByWeight,
        barcode: dto.barcode ? String(dto.barcode) : undefined,
      });

      // Branch tekshirish va biriktirish
      if (dto.branchId) {
        const branch = await this.branchRepo.findOne({
          where: { id: dto.branchId },
        });
        if (!branch) throw new NotFoundException('Fillial topilmadi');
        product.branch = branch;
      }

      // Agar barcode kelmasa avtomatik generatsiya
      if (!product.barcode) {
        product.barcode = String(
          crypto.randomInt(1000000000000, 9999999999999),
        );
      }

      return await this.productRepo.save(product);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Mahsulot yaratishda serverda xatolik yuz berdi',
        error?.message,
      );
    }
  }

  async findActiveProducts() {
    try {
      // faqat onDelete false bo'lgan mahsulotlar va branch bilan
      return await this.productRepo.find({
        where: { onDelete: false },
        relations: ['branch'],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Faol mahsulotlarni olishda serverda xatolik yuz berdi',
        error?.message,
      );
    }
  }

  //  FIND ALL
  async findAll() {
    try {
      return await this.productRepo.find({ relations: ['branch'] });
    } catch (error) {
      throw new InternalServerErrorException(
        'Mahsulotlarni olishda serverda xatolik yuz berdi',
        error?.message,
      );
    }
  }

  //  FIND ONE
  async findOne(id: string) {
    try {
      const product = await this.productRepo.findOne({
        where: { id },
        relations: ['branch'],
      });
      if (!product) throw new NotFoundException('Mahsulot topilmadi');
      return product;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Mahsulotni olishda serverda xatolik yuz berdi',
        error?.message,
      );
    }
  }

  // UPDATE
  async update(id: string, dto: UpdateProductDto) {
    try {
      const product = await this.findOne(id);
      if (!product) throw new NotFoundException('Mahsulot topilmadi');

      if (dto.branchId) {
        const branch = await this.branchRepo.findOne({
          where: { id: dto.branchId },
        });
        if (!branch) throw new NotFoundException('Fillial topilmadi');
        product.branch = branch;
      }

      const allowedFields: (keyof UpdateProductDto)[] = [
        'name',
        'count',
        'weight',
        'price',
        'costPrice',
        'type',
        'barcode',
        'onDelete',
      ];

      allowedFields.forEach((field) => {
        if (dto[field] !== undefined) {
          product[field] = dto[field];
        }
      });

      if (!product.barcode) {
        product.barcode = String(
          crypto.randomInt(1000000000000, 9999999999999),
        );
      }

      return await this.productRepo.save(product);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Mahsulotni yangilashda serverda xatolik yuz berdi',
        error?.message,
      );
    }
  }

  //  DELETE
  async remove(id: string) {
    try {
      const product = await this.findOne(id);
      if (!product) throw new NotFoundException('Mahsulottopilmadi');
      return await this.productRepo.remove(product);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        "Mahsulotni o'chirishda serverda xatolik yuz berdi",
        error?.message,
      );
    }
  }
}
