import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { VoucherRepository } from './repositories/voucher.repository';
import { VoucherType } from './entities/voucher.entity';

@Injectable()
export class VouchersService {
  constructor(private readonly voucherRepository: VoucherRepository) {}

  async create(createVoucherDto: CreateVoucherDto) {
    const code = createVoucherDto.code.trim().toUpperCase();

    const existedVoucher = await this.voucherRepository.findByCode(code);

    if (existedVoucher) {
      throw new BadRequestException('Mã voucher đã tồn tại');
    }

    this.validateVoucherData(createVoucherDto);

    return this.voucherRepository.create({
      code,
      type: createVoucherDto.type,
      value: createVoucherDto.value,
      minOrderValue: createVoucherDto.minOrderValue,
      maxDiscount: createVoucherDto.maxDiscount,
      usageLimit: createVoucherDto.usageLimit,
      startDate: new Date(createVoucherDto.startDate),
      endDate: new Date(createVoucherDto.endDate),
      isActive: createVoucherDto.isActive ?? true,
      useCount: 0,
    });
  }

  async findAll() {
    return this.voucherRepository.findAll();
  }

  async findOne(id: string) {
    const voucher = await this.voucherRepository.findById(id);

    if (!voucher) {
      throw new NotFoundException('Không tìm thấy voucher');
    }

    return voucher;
  }

  async update(id: string, updateVoucherDto: UpdateVoucherDto) {
    const currentVoucher = await this.voucherRepository.findById(id);

    if (!currentVoucher) {
      throw new NotFoundException('Không tìm thấy voucher');
    }

    if (updateVoucherDto.code) {
      const code = updateVoucherDto.code.trim().toUpperCase();

      const existedVoucher = await this.voucherRepository.findByCode(code);

      if (
        existedVoucher &&
        existedVoucher.id.toString() !== currentVoucher.id.toString()
      ) {
        throw new BadRequestException('Mã voucher đã tồn tại');
      }

      updateVoucherDto.code = code;
    }

    const mergedData = {
      code: updateVoucherDto.code ?? currentVoucher.code,
      type: updateVoucherDto.type ?? currentVoucher.type,
      value: updateVoucherDto.value ?? currentVoucher.value,
      minOrderValue:
        updateVoucherDto.minOrderValue ?? currentVoucher.minOrderValue,
      maxDiscount: updateVoucherDto.maxDiscount ?? currentVoucher.maxDiscount,
      usageLimit: updateVoucherDto.usageLimit ?? currentVoucher.usageLimit,
      startDate:
        updateVoucherDto.startDate ?? currentVoucher.startDate.toISOString(),
      endDate: updateVoucherDto.endDate ?? currentVoucher.endDate.toISOString(),
    };

    this.validateVoucherData(mergedData);

    const updateData: any = {
      ...updateVoucherDto,
    };

    if (updateVoucherDto.startDate) {
      updateData.startDate = new Date(updateVoucherDto.startDate);
    }

    if (updateVoucherDto.endDate) {
      updateData.endDate = new Date(updateVoucherDto.endDate);
    }

    return this.voucherRepository.update(id, updateData);
  }

  async remove(id: string) {
    const voucher = await this.voucherRepository.softDelete(id);

    if (!voucher) {
      throw new NotFoundException('Không tìm thấy voucher');
    }

    return {
      message: 'Xóa voucher thành công',
      voucher,
    };
  }

  private validateVoucherData(data: {
    type: VoucherType;
    value: number;
    minOrderValue: number;
    maxDiscount: number;
    usageLimit: number;
    startDate: string | Date;
    endDate: string | Date;
  }) {
    if (data.type === VoucherType.PERCENT && data.value > 100) {
      throw new BadRequestException(
        'Voucher phần trăm không được lớn hơn 100%',
      );
    }

    if (data.value <= 0) {
      throw new BadRequestException('Giá trị voucher phải lớn hơn 0');
    }

    if (data.minOrderValue < 0) {
      throw new BadRequestException('Giá trị đơn hàng tối thiểu không được âm');
    }

    if (data.maxDiscount < 0) {
      throw new BadRequestException('Giảm tối đa không được âm');
    }

    if (data.usageLimit <= 0) {
      throw new BadRequestException('Số lượt sử dụng phải lớn hơn 0');
    }

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('Ngày bắt đầu phải nhỏ hơn ngày kết thúc');
    }
  }
}
