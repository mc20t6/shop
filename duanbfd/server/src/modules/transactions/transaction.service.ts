import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionRepository } from './repositories/transaction.repository';

@Injectable()
export class TransactionService {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async create(createTransactionDto: CreateTransactionDto) {
    const existedTransaction =
      await this.transactionRepository.findByTransactionNo(
        createTransactionDto.transactionNo,
      );

    if (existedTransaction) {
      throw new ConflictException('Mã giao dịch đã tồn tại');
    }

    return this.transactionRepository.create(createTransactionDto);
  }

  async findAll() {
    return this.transactionRepository.findAll();
  }

  async findOne(id: string) {
    const transaction = await this.transactionRepository.findById(id);

    if (!transaction) {
      throw new NotFoundException('Không tìm thấy giao dịch');
    }

    return transaction;
  }

  async findByOrderId(orderId: string) {
    return this.transactionRepository.findByOrderId(orderId);
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto) {
    if (updateTransactionDto.transactionNo) {
      const existedTransaction =
        await this.transactionRepository.findByTransactionNo(
          updateTransactionDto.transactionNo,
        );

      if (existedTransaction && existedTransaction._id.toString() !== id) {
        throw new ConflictException('Mã giao dịch đã tồn tại');
      }
    }

    const updatedTransaction = await this.transactionRepository.update(
      id,
      updateTransactionDto,
    );

    if (!updatedTransaction) {
      throw new NotFoundException('Không tìm thấy giao dịch');
    }

    return updatedTransaction;
  }

  async remove(id: string) {
    const result = await this.transactionRepository.delete(id);

    if (!result || result.deletedCount === 0) {
      throw new NotFoundException('Không tìm thấy giao dịch');
    }

    return {
      message: 'Xóa giao dịch thành công',
    };
  }
}
