import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Variant, VariantDocument } from '../entities/variant.entity';

@Injectable()
export class VariantRepository {
  constructor(
    @InjectModel(Variant.name)
    private readonly variantModel: Model<VariantDocument>,
  ) {}

  create(data: Partial<Variant>) {
    return this.variantModel.create(data);
  }

  findBySku(sku: string) {
    return this.variantModel
      .findOne({
        sku,
        deletedAt: null,
      })
      .exec();
  }

  findBySkuExceptId(sku: string, variantId: string) {
    return this.variantModel
      .findOne({
        _id: { $ne: new Types.ObjectId(variantId) },
        sku,
        deletedAt: null,
      })
      .exec();
  }

  findByProductId(productId: string) {
    return this.variantModel
      .find({
        productId: new Types.ObjectId(productId),
        deletedAt: null,
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  findByIdAndProductId(productId: string, variantId: string) {
    return this.variantModel
      .findOne({
        _id: new Types.ObjectId(variantId),
        productId: new Types.ObjectId(productId),
        deletedAt: null,
      })
      .exec();
  }

  updateByIdAndProductId(
    productId: string,
    variantId: string,
    data: Partial<Variant>,
  ) {
    return this.variantModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(variantId),
          productId: new Types.ObjectId(productId),
          deletedAt: null,
        },
        data,
        { new: true },
      )
      .exec();
  }

  softDeleteByIdAndProductId(productId: string, variantId: string) {
    return this.variantModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(variantId),
          productId: new Types.ObjectId(productId),
          deletedAt: null,
        },
        {
          deletedAt: new Date(),
        },
        { new: true },
      )
      .exec();
  }

  softDeleteByProductId(productId: string) {
    return this.variantModel
      .updateMany(
        {
          productId: new Types.ObjectId(productId),
          deletedAt: null,
        },
        {
          deletedAt: new Date(),
        },
      )
      .exec();
  }

  findAvailableById(variantId: string) {
    if (!Types.ObjectId.isValid(variantId)) {
      return null;
    }

    return this.variantModel
      .findOne({
        _id: new Types.ObjectId(variantId),
        deletedAt: null,
      })
      .exec();
  }

  findAvailableByIdWithStock(variantId: string, quantity: number) {
    if (!Types.ObjectId.isValid(variantId)) {
      return null;
    }

    return this.variantModel
      .findOne({
        _id: new Types.ObjectId(variantId),
        deletedAt: null,
        stock: { $gte: quantity },
      })
      .exec();
  }
}
