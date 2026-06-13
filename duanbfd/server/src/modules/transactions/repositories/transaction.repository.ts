import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  Transaction,
  TransactionDocument,
} from '../entities/transaction.entity';

@Injectable()
export class TransactionRepository {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
  ) {}

  create(data: Partial<Transaction>) {
    return this.transactionModel.create(data);
  }

  findAll() {
    return this.transactionModel.find().sort({ createdAt: -1 }).exec();
  }

  findById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.transactionModel.findById(id).exec();
  }

  findByOrderId(orderId: string) {
    return this.transactionModel
      .find({ orderId })
      .sort({ createdAt: -1 })
      .exec();
  }

  findByTransactionNo(transactionNo: string) {
    return this.transactionModel.findOne({ transactionNo }).exec();
  }

  update(id: string, data: Partial<Transaction>) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.transactionModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
  }

  delete(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.transactionModel.deleteOne({ _id: id }).exec();
  }
}
