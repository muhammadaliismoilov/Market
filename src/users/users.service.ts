import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Users } from '../users/users.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Branchs } from 'src/branchs/branch.entity';
import { log } from 'node:console';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepo: Repository<Users>,
    @InjectRepository(Branchs)
    private readonly branchRepo: Repository<Branchs>,
  ) {}

  async create(dto: CreateUserDto) {
    try {
      const { phone, branchId, password } = dto;

      // const findBranch = await this.branchRepo.findOne({
      //   where: { id: branchId },
      // });
      // if (!findBranch) throw new NotFoundException('Fillial topilmadi');

      const findUser = await this.userRepo.findOne({ where: [{ phone }] });
      if (findUser)
        throw new ConflictException(
          'Bu raqam bilan ro`yxatdan o`tgan user mavjud',
        );

      const hashedPassword = await bcrypt.hash(password, 10);
      dto.password = hashedPassword;
      const user = this.userRepo.create(dto);
      return this.userRepo.save(user);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'User yaratishda serverda xatolik yuz berdi',
        error.message,
      );
      error.message;
    }
  }

  async findAll() {
    try {
      return this.userRepo.find({relations:['branch']});
    } catch (error) {
      throw new InternalServerErrorException(
        'Userlarni olishda serverda xatolik yuz berdi',
      );
    }
  }

  async findOne(id: string) {
    try {
      const findUser = await this.userRepo.findOne({ where: [{ id }] });
      if (!findUser) throw new NotFoundException('User topilmadi');
      return findUser;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Userni olishda serverda xatolik yuz berdi',
      );
    }
  }

  // async update(id: string, dto: UpdateUserDto) {
  //   try {
  //     const { branchId } = dto;

  //     const findBranch = await this.branchRepo.findOne({
  //       where: { id: branchId },
  //     });
  //     if (!findBranch) throw new NotFoundException('Fillial topilmadi');

  //     const user = await this.findOne(id);
  //     if (!user) throw new NotFoundException('User topilmadi');

  //     const updated = Object.assign(user, dto);
  //     console.log();
      
  //     return this.userRepo.save(updated);
  //   } catch (error) {
  //     if (error instanceof NotFoundException) throw error;
  //     throw new InternalServerErrorException(
  //       'Userni yangilashda serverda xatolik yuz berdi',
  //     );
  //   }
  // }

  async update(id: string, dto: UpdateUserDto) {
  try {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('User topilmadi');

    // Agar branchId berilgan bo'lsa, branchni topish va biriktirish
    if (dto.branchId) {
      const findBranch = await this.branchRepo.findOne({
        where: { id: dto.branchId },
      });
      if (!findBranch) throw new NotFoundException('Fillial topilmadi');
      user.branch = findBranch;
    }

    // Faqat defined (!== undefined) fieldlarni yangilash
    const allowedFields: (keyof UpdateUserDto)[] = ['fullName', 'phone', 'password', 'role'];
    allowedFields.forEach((field) => {
      if (dto[field] !== undefined) {
        user[field] = dto[field];
      }
    });

    return await this.userRepo.save(user);
  } catch (error) {
    if (error instanceof NotFoundException) throw error;
    throw new InternalServerErrorException(
      'Userni yangilashda serverda xatolik yuz berdi',
      error?.message,
    );
  }
}


  async remove(id: string) {
    try {
      const user = await this.findOne(id);
      if (!user) throw new NotFoundException('User topilmadi');

      await this.userRepo.remove(user);
      return { message: 'User muvaffaqiyatli o‘chirildi' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Userni o‘chirishda serverda xatolik yuz berdi',
      );
    }
  }
}
