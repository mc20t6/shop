import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { CreateStaffDto } from '../dto/create-staff.dto';
import { UpdateStaffDto } from '../dto/update-staff.dto';
import { CreateAddressDto } from '../dto/create-address.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import {
  UserRepository,
  UpdateUserData,
} from '../repositories/user.repository';
import { AddressRepository } from '../repositories/address.repository';
import { Types } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly addressRepository: AddressRepository,
  ) {}

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

  async updateProfile(userId: string, data: { fullName?: string; phone?: string }) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('ID người dùng không hợp lệ');
    }

    const user = await this.userRepository.findByIdUser(userId);

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    return this.userRepository.updateByIdUser(userId, {
      fullName: data.fullName,
      phone: data.phone,
    });
  }

  async changePassword(userId: string, body: ChangePasswordDto) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('ID người dùng không hợp lệ');
    }

    const user = await this.userRepository.findByIdUser(userId);

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    const isMatch = await bcrypt.compare(body.oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Mật khẩu cũ không đúng');
    }

    const hashedPassword = await bcrypt.hash(body.newPassword, 10);
    await this.userRepository.updateByIdUser(userId, {
      password: hashedPassword,
      refreshToken: null,
    });

    return {
      message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.',
    };
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

  // ============================
  // QUẢN LÝ ĐỊA CHỈ
  // ============================

  async getAddressesByUserId(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('ID người dùng không hợp lệ');
    }

    return this.addressRepository.findByUserId(userId);
  }

  async createAddress(userId: string, createAddressDto: CreateAddressDto) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('ID người dùng không hợp lệ');
    }

    const address = await this.addressRepository.create({
      userId,
      ...createAddressDto,
    });

    return address;
  }

  async getAddressById(userId: string, addressId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('ID người dùng không hợp lệ');
    }

    if (!Types.ObjectId.isValid(addressId)) {
      throw new BadRequestException('ID địa chỉ không hợp lệ');
    }

    const address = await this.addressRepository.findById(addressId);

    if (!address) {
      throw new NotFoundException('Không tìm thấy địa chỉ');
    }

    if (address.userId.toString() !== userId) {
      throw new BadRequestException('Địa chỉ này không thuộc về bạn');
    }

    return address;
  }

  async updateAddress(
    userId: string,
    addressId: string,
    updateAddressDto: UpdateAddressDto,
  ) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('ID người dùng không hợp lệ');
    }

    if (!Types.ObjectId.isValid(addressId)) {
      throw new BadRequestException('ID địa chỉ không hợp lệ');
    }

    const address = await this.addressRepository.findById(addressId);

    if (!address) {
      throw new NotFoundException('Không tìm thấy địa chỉ');
    }

    if (address.userId.toString() !== userId) {
      throw new BadRequestException('Địa chỉ này không thuộc về bạn');
    }

    return this.addressRepository.updateById(addressId, updateAddressDto);
  }

  async deleteAddress(userId: string, addressId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('ID người dùng không hợp lệ');
    }

    if (!Types.ObjectId.isValid(addressId)) {
      throw new BadRequestException('ID địa chỉ không hợp lệ');
    }

    const address = await this.addressRepository.findById(addressId);

    if (!address) {
      throw new NotFoundException('Không tìm thấy địa chỉ');
    }

    if (address.userId.toString() !== userId) {
      throw new BadRequestException('Địa chỉ này không thuộc về bạn');
    }

    await this.addressRepository.delete(addressId);

    return {
      message: 'Xóa địa chỉ thành công',
    };
  }
}
