import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Order, OrderDocument } from '../entities/order.entity';

@Injectable()
export class OrderRepository {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {}

  create(data: Partial<Order>) {
    return this.orderModel.create(data);
  }

  findAll() {
    return this.orderModel
      .find({
        deletedAt: null,
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  findById(id: string) {
    return this.orderModel
      .findOne({
        _id: new Types.ObjectId(id),
        deletedAt: null,
      })
      .exec();
  }

  findByUserId(userId: string) {
    return this.orderModel
      .find({
        userId,
        deletedAt: null,
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  findByOrderCode(orderCode: string) {
    return this.orderModel
      .findOne({
        orderCode,
        deletedAt: null,
      })
      .exec();
  }

  update(id: string, data: Partial<Order>) {
    return this.orderModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          deletedAt: null,
        },
        data,
        { new: true },
      )
      .exec();
  }

  softDelete(id: string) {
    return this.orderModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          deletedAt: null,
        },
        {
          deletedAt: new Date(),
        },
        { new: true },
      )
      .exec();
  }
}
