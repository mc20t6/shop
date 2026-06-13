import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { OrderItem, OrderItemDocument } from '../entities/order-item.entity';

@Injectable()
export class OrderItemRepository {
  constructor(
    @InjectModel(OrderItem.name)
    private readonly orderItemModel: Model<OrderItemDocument>,
  ) {}

  createMany(data: Partial<OrderItem>[]) {
    return this.orderItemModel.insertMany(data);
  }

  findByOrderId(orderId: string) {
    return this.orderItemModel
      .find({
        orderId,
      })
      .exec();
  }
}
