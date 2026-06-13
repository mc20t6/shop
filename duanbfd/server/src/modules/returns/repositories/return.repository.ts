import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { ReturnDocument, ReturnRequest } from '../entities/return.entity';

@Injectable()
export class ReturnRepository {
  constructor(
    @InjectModel(ReturnRequest.name)
    private readonly returnModel: Model<ReturnDocument>,
  ) {}

  create(data: Partial<ReturnRequest>) {
    return this.returnModel.create(data);
  }

  findAll() {
    return this.returnModel
      .find({
        deletedAt: null,
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  findById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.returnModel
      .findOne({
        _id: id,
        deletedAt: null,
      })
      .exec();
  }

  findByOrderId(orderId: string) {
    return this.returnModel
      .find({
        orderId,
        deletedAt: null,
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  findByUserId(userId: string) {
    return this.returnModel
      .find({
        userId,
        deletedAt: null,
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  update(id: string, data: Partial<ReturnRequest>) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.returnModel
      .findOneAndUpdate(
        {
          _id: id,
          deletedAt: null,
        },
        data,
        {
          new: true,
        },
      )
      .exec();
  }

  softDelete(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.returnModel
      .findOneAndUpdate(
        {
          _id: id,
          deletedAt: null,
        },
        {
          deletedAt: new Date(),
        },
        {
          new: true,
        },
      )
      .exec();
  }
}
