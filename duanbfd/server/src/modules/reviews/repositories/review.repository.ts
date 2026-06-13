import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Review, ReviewDocument } from '../entities/review.entity';

@Injectable()
export class ReviewRepository {
  constructor(
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,
  ) {}

  create(data: Partial<Review>) {
    return this.reviewModel.create(data);
  }

  findAll() {
    return this.reviewModel
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

    return this.reviewModel
      .findOne({
        _id: id,
        deletedAt: null,
      })
      .exec();
  }

  findByUserId(userId: string) {
    return this.reviewModel
      .find({
        userId,
        deletedAt: null,
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  findByProductId(productId: string) {
    return this.reviewModel
      .find({
        productId,
        deletedAt: null,
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  findByOrderId(orderId: string) {
    return this.reviewModel
      .find({
        orderId,
        deletedAt: null,
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  findExistingReview(userId: string, productId: string, orderId: string) {
    return this.reviewModel
      .findOne({
        userId,
        productId,
        orderId,
        deletedAt: null,
      })
      .exec();
  }

  update(id: string, data: Partial<Review>) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.reviewModel
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

    return this.reviewModel
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
