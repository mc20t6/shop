import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateReturnDto } from './dto/create-return.dto';
import { UpdateReturnDto } from './dto/update-return.dto';
import { UpdateReturnStatusDto } from './dto/update-return-status.dto';
import { ReturnRepository } from './repositories/return.repository';

@Injectable()
export class ReturnService {
  constructor(private readonly returnRepository: ReturnRepository) {}

  async create(createReturnDto: CreateReturnDto) {
    return this.returnRepository.create({
      ...createReturnDto,
      status: createReturnDto.status || 'pending',
      images: createReturnDto.images || [],
      staffNote: createReturnDto.staffNote || '',
    });
  }

  async findAll() {
    return this.returnRepository.findAll();
  }

  async findOne(id: string) {
    const returnRequest = await this.returnRepository.findById(id);

    if (!returnRequest) {
      throw new NotFoundException('Không tìm thấy yêu cầu đổi/trả hàng');
    }

    return returnRequest;
  }

  async findByOrderId(orderId: string) {
    return this.returnRepository.findByOrderId(orderId);
  }

  async findByUserId(userId: string) {
    return this.returnRepository.findByUserId(userId);
  }

  async update(id: string, updateReturnDto: UpdateReturnDto) {
    const updatedReturn = await this.returnRepository.update(
      id,
      updateReturnDto,
    );

    if (!updatedReturn) {
      throw new NotFoundException('Không tìm thấy yêu cầu đổi/trả hàng');
    }

    return updatedReturn;
  }

  async updateStatus(id: string, updateReturnStatusDto: UpdateReturnStatusDto) {
    const updatedReturn = await this.returnRepository.update(id, {
      status: updateReturnStatusDto.status,
      staffNote: updateReturnStatusDto.staffNote,
      resolveAt:
        updateReturnStatusDto.status === 'approved' ||
        updateReturnStatusDto.status === 'rejected' ||
        updateReturnStatusDto.status === 'resolved'
          ? new Date()
          : undefined,
    });

    if (!updatedReturn) {
      throw new NotFoundException('Không tìm thấy yêu cầu đổi/trả hàng');
    }

    return updatedReturn;
  }

  async remove(id: string) {
    const deletedReturn = await this.returnRepository.softDelete(id);

    if (!deletedReturn) {
      throw new NotFoundException('Không tìm thấy yêu cầu đổi/trả hàng');
    }

    return {
      message: 'Xóa yêu cầu đổi/trả hàng thành công',
    };
  }
}
