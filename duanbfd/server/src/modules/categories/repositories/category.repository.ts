import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Category, CategoryDocument } from '../entities/category.entity';

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async create(data: Partial<Category>): Promise<CategoryDocument> {
    const category = new this.categoryModel(data);
    return category.save();
  }

  async findAll(): Promise<CategoryDocument[]> {
    return this.categoryModel
      .find({
        deletedAt: { $exists: false },
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<CategoryDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.categoryModel
      .findOne({
        _id: id,
        deletedAt: { $exists: false },
      })
      .exec();
  }

  async findByName(name: string): Promise<CategoryDocument | null> {
    return this.categoryModel
      .findOne({
        name: new RegExp(`^${this.escapeRegex(name)}$`, 'i'),
        deletedAt: { $exists: false },
      })
      .exec();
  }

  async update(
    id: string,
    data: Partial<Category>,
  ): Promise<CategoryDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.categoryModel
      .findOneAndUpdate(
        {
          _id: id,
          deletedAt: { $exists: false },
        },
        data,
        {
          new: true,
        },
      )
      .exec();
  }

  async softDelete(id: string): Promise<CategoryDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.categoryModel
      .findOneAndUpdate(
        {
          _id: id,
          deletedAt: { $exists: false },
        },
        {
          isActive: false,
          deletedAt: new Date(),
        },
        {
          new: true,
        },
      )
      .exec();
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
