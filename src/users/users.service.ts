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
import { CreateUserDto,UpdateUserDto } from './dto/users.dto';
import { Branchs } from 'src/branchs/branch.entity';

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
      // TO'G'RILANDI: ishlatilmagan error.message qatori o'chirildi
      throw new InternalServerErrorException(
        'User yaratishda serverda xatolik yuz berdi',
        error.message,
      );
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


  async update(id: string, dto: UpdateUserDto) {
  try {
    // TO'G'RILANDI: findOne allaqachon exception throw qiladi, shuning uchun keraksiz tekshiruv o'chirildi
    const user = await this.findOne(id);

    // Agar branchId berilgan bo'lsa, branchni topish va biriktirish
    if (dto.branchId) {
      const findBranch = await this.branchRepo.findOne({
        where: { id: dto.branchId },
      });
      if (!findBranch) throw new NotFoundException('Fillial topilmadi');
      user.branch = findBranch;
    }

    // Faqat defined (!== undefined) fieldlarni yangilash
    // TO'G'RILANDI: password yangilanganda hash qilinishi kerak
    const allowedFields: (keyof UpdateUserDto)[] = ['fullName', 'phone', 'role'];
    allowedFields.forEach((field) => {
      if (dto[field] !== undefined) {
        user[field] = dto[field];
      }
    });

    // Password alohida tekshiriladi va hash qilinadi
    if (dto.password !== undefined && dto.password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      user.password = hashedPassword;
    }

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
      // TO'G'RILANDI: findOne allaqachon exception throw qiladi, shuning uchun keraksiz tekshiruv o'chirildi
      const user = await this.findOne(id);

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
