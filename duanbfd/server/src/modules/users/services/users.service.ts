import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { CreateStaffDto } from '../dto/create-staff.dto';
import { UpdateStaffDto } from '../dto/update-staff.dto';
import {
  UserRepository,
  UpdateUserData,
} from '../repositories/user.repository';
import { Types } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async createStaff(createStaffDto: CreateStaffDto) {
    const email = createStaffDto.email.toLowerCase().trim();
    const phone = createStaffDto.phone.trim();
    const fullName = createStaffDto.fullName.trim();

    const existedUser = await this.userRepository.findByEmailOrPhone(
      email,
      phone,
    );

    if (existedUser) {
      throw new BadRequestException('Email hoặc số điện thoại đã tồn tại');
    }

    const hashedPassword = await bcrypt.hash(createStaffDto.password, 10);

    const staff = await this.userRepository.createStaff({
      email,
      phone,
      fullName,
      password: hashedPassword,
    });

    return this.userRepository.findStaffById(staff.id);
  }

  async findAllStaff() {
    return this.userRepository.findAllStaff();
  }

  async findStaffById(id: string) {
    if (!this.userRepository.isValidObjectId(id)) {
      throw new BadRequestException('ID nhân viên không hợp lệ');
    }

    const staff = await this.userRepository.findStaffById(id);

    if (!staff) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }

    return staff;
  }

  async updateStaff(id: string, updateStaffDto: UpdateStaffDto) {
    if (!this.userRepository.isValidObjectId(id)) {
      throw new BadRequestException('ID nhân viên không hợp lệ');
    }

    const staff = await this.userRepository.findStaffById(id);

    if (!staff) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }

    const email = updateStaffDto.email?.toLowerCase().trim();
    const phone = updateStaffDto.phone?.trim();

    const existedUser = await this.userRepository.findByEmailOrPhoneExceptId(
      id,
      email,
      phone,
    );

    if (existedUser) {
      throw new BadRequestException('Email hoặc số điện thoại đã tồn tại');
    }

    const updateData: UpdateUserData = {};

    if (email) {
      updateData.email = email;
    }

    if (phone) {
      updateData.phone = phone;
    }

    if (updateStaffDto.fullName) {
      updateData.fullName = updateStaffDto.fullName.trim();
    }

    if (updateStaffDto.password) {
      updateData.password = await bcrypt.hash(updateStaffDto.password, 10);
    }

    if (typeof updateStaffDto.isActive === 'boolean') {
      updateData.isActive = updateStaffDto.isActive;
    }

    await this.userRepository.updateById(id, updateData);

    return this.userRepository.findStaffById(id);
  }

  async deleteStaff(id: string) {
    if (!this.userRepository.isValidObjectId(id)) {
      throw new BadRequestException('ID nhân viên không hợp lệ');
    }

    const staff = await this.userRepository.findStaffById(id);

    if (!staff) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }

    await this.userRepository.softDeleteStaffById(id);

    return {
      message: 'Xóa nhân viên thành công',
    };
  }

  async updateAvatar(userId: string, avatar: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('ID người dùng không hợp lệ');
    }

    if (!avatar) {
      throw new BadRequestException('Vui lòng chọn ảnh avatar');
    }

    const user = await this.userRepository.findByIdUser(userId);

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    return this.userRepository.updateByIdUser(userId, {
      avatar,
    });
  }

  async findAllManagedUsers(query: any) {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.max(Number(query.limit) || 10, 1);
    const skip = (page - 1) * limit;

    const filter: any = {
      deletedAt: null,
      role: {
        $in: ['STAFF', 'CUSTOMER'],
      },
    };

    if (query.role) {
      filter.role = query.role;
    }

    if (query.search) {
      const keyword = query.search.trim();

      filter.$or = [
        {
          fullName: {
            $regex: keyword,
            $options: 'i',
          },
        },
        {
          email: {
            $regex: keyword,
            $options: 'i',
          },
        },
        {
          phone: {
            $regex: keyword,
            $options: 'i',
          },
        },
      ];
    }

    const [data, total] = await Promise.all([
      this.userRepository.findManagedUsersPaginated(filter, skip, limit),
      this.userRepository.countManagedUsers(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    };
  }

  async findManagedUserById(id: string) {
    if (!this.userRepository.isValidObjectId(id)) {
      throw new BadRequestException('ID người dùng không hợp lệ');
    }

    const user = await this.userRepository.findManagedUserById(id);

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    return user;
  }

  async toggleManagedUserStatus(id: string) {
    if (!this.userRepository.isValidObjectId(id)) {
      throw new BadRequestException('ID người dùng không hợp lệ');
    }

    const user = await this.userRepository.findManagedUserById(id);

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    const currentStatus = user.isActive !== false;

    return this.userRepository.updateManagedUser(id, {
      isActive: !currentStatus,
    });
  }

  async deleteManagedUser(id: string) {
    if (!this.userRepository.isValidObjectId(id)) {
      throw new BadRequestException('ID người dùng không hợp lệ');
    }

    const user = await this.userRepository.findManagedUserById(id);

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    return this.userRepository.updateManagedUser(id, {
      isActive: false,
      deletedAt: new Date(),
    });
  }
}
