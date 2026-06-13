import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CartItem, CartItemDocument } from '../entities/cart-item.entity';

@Injectable()
export class CartItemRepository {
  constructor(
    @InjectModel(CartItem.name)
    private readonly cartItemModel: Model<CartItemDocument>,
  ) {}

  async create(data: Partial<CartItem>): Promise<CartItemDocument> {
    const cartItem = new this.cartItemModel(data);
    return cartItem.save();
  }

  async findById(id: string): Promise<CartItemDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.cartItemModel.findById(id).exec();
  }

  async findByCartId(cartId: string): Promise<CartItemDocument[]> {
    return this.cartItemModel
      .find({
        cartId,
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByCartIdAndVariantId(
    cartId: string,
    variantId: string,
  ): Promise<CartItemDocument | null> {
    return this.cartItemModel
      .findOne({
        cartId,
        variantId,
      })
      .exec();
  }

  async increaseQuantity(
    id: string,
    quantity: number,
  ): Promise<CartItemDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.cartItemModel
      .findByIdAndUpdate(
        id,
        {
          $inc: {
            quantity,
          },
        },
        {
          new: true,
        },
      )
      .exec();
  }

  async updateQuantity(
    id: string,
    quantity: number,
  ): Promise<CartItemDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.cartItemModel
      .findByIdAndUpdate(
        id,
        {
          quantity,
        },
        {
          new: true,
        },
      )
      .exec();
  }

  async deleteById(id: string): Promise<CartItemDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.cartItemModel.findByIdAndDelete(id).exec();
  }

  async deleteByCartId(cartId: string) {
    return this.cartItemModel
      .deleteMany({
        cartId,
      })
      .exec();
  }
}
