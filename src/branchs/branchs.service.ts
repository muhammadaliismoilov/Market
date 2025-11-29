import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branchs } from './branch.entity';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchsService {
  constructor(
    @InjectRepository(Branchs)
    private branchRepo: Repository<Branchs>,
  ) {}

  async create(dto: CreateBranchDto) {
    try {
      const { name } = dto;

      const findBranch = await this.branchRepo.findOne({ where: [{ name }] });
      if (findBranch) {
        throw new ConflictException('Bu nom bilan allaqachon filial mavjud');
      }

      const branch = this.branchRepo.create(dto);
      return await this.branchRepo.save(branch);
    } catch (error) {
      if (error instanceof ConflictException) throw error;

      throw new InternalServerErrorException(
        'Branch yaratishda serverda xatolik yuz berdi',
        error?.message,
      );
    }
  }

  async findAll() {
    try {
      return await this.branchRepo.find();
    } catch (error) {
      throw new InternalServerErrorException(
        'Branchlarni olishda serverda xatolik yuz berdi',
        error?.message,
      );
    }
  }

  async findOne(id: string) {
    try {
      const branch = await this.branchRepo.findOne({
        where: { id },
        relations: ['users'],
      });

      if (!branch) throw new NotFoundException('Branch topilmadi');

      return branch;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      throw new InternalServerErrorException(
        'Branchni olishda serverda xatolik yuz berdi',
        error?.message,
      );
    }
  }

  async update(id: string, dto: UpdateBranchDto) {
    try {
      const branch = await this.branchRepo.findOne({ where: { id } });
      if (!branch) throw new NotFoundException('Branch topilmadi');

      // agar name yangilanayotgan bo'lsa, takrorlanmasligini tekshirish
      if (dto.name && dto.name !== branch.name) {
        const exists = await this.branchRepo.findOne({ where: [{ name: dto.name }] });
        if (exists) throw new ConflictException('Bu nom bilan boshqa filial mavjud');
      }

      Object.assign(branch, dto);
      return await this.branchRepo.save(branch);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof ConflictException) throw error;

      throw new InternalServerErrorException(
        'Branchni yangilashda serverda xatolik yuz berdi',
        error?.message,
      );
    }
  }

  async remove(id: string) {
    try {
      const branch = await this.branchRepo.findOne({ where: { id } });
      if (!branch) throw new NotFoundException('Branch topilmadi');

      await this.branchRepo.remove(branch);
      return { message: 'Branch muvaffaqiyatli o‘chirildi' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      throw new InternalServerErrorException(
        'Branchni o‘chirishda serverda xatolik yuz berdi',
        error?.message,
      );
    }
  }
}
