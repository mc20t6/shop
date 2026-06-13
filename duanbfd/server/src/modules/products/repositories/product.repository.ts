import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Product, ProductDocument } from '../entities/product.entity';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  create(data: Partial<Product>) {
    return this.productModel.create(data);
  }

  findAll() {
    return this.productModel
      .find({
        deletedAt: null,
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  findActive() {
    return this.productModel
      .find({
        isActive: true,
        deletedAt: null,
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  findById(id: string) {
    return this.productModel
      .findOne({
        _id: new Types.ObjectId(id),
        deletedAt: null,
      })
      .exec();
  }

  findBySlug(slug: string) {
    return this.productModel
      .findOne({
        slug,
        deletedAt: null,
      })
      .exec();
  }

  findBySlugExceptId(slug: string, id: string) {
    return this.productModel
      .findOne({
        _id: { $ne: new Types.ObjectId(id) },
        slug,
        deletedAt: null,
      })
      .exec();
  }

  updateById(id: string, data: Partial<Product>) {
    return this.productModel
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

  softDeleteById(id: string) {
    return this.productModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          deletedAt: null,
        },
        {
          isActive: false,
          deletedAt: new Date(),
        },
        { new: true },
      )
      .exec();
  }

  existsById(id: string) {
    return this.productModel
      .exists({
        _id: new Types.ObjectId(id),
        deletedAt: null,
      })
      .exec();
  }

  countByCategoryId(categoryId: string) {
    return this.productModel
      .countDocuments({
        categoryId: new Types.ObjectId(categoryId),
        deletedAt: null,
      })
      .exec();
  }
}
