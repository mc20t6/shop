import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Cart, CartDocument } from '../entities/cart.entity';

@Injectable()
export class CartRepository {
  constructor(
    @InjectModel(Cart.name)
    private readonly cartModel: Model<CartDocument>,
  ) {}

  async create(data: Partial<Cart>): Promise<CartDocument> {
    const cart = new this.cartModel(data);
    return cart.save();
  }

  async findById(id: string): Promise<CartDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.cartModel.findById(id).exec();
  }

  async findByUserId(userId: string): Promise<CartDocument | null> {
    return this.cartModel
      .findOne({
        userId: userId.trim(),
      })
      .exec();
  }

  async findOrCreateByUserId(userId: string): Promise<CartDocument> {
    const cleanUserId = userId.trim();

    const existedCart = await this.findByUserId(cleanUserId);

    if (existedCart) {
      return existedCart;
    }

    return this.create({
      userId: cleanUserId,
    });
  }
}
