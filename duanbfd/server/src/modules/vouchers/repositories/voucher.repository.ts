import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Voucher, VoucherDocument } from '../entities/voucher.entity';

@Injectable()
export class VoucherRepository {
  constructor(
    @InjectModel(Voucher.name)
    private readonly voucherModel: Model<VoucherDocument>,
  ) {}

  async create(data: Partial<Voucher>): Promise<VoucherDocument> {
    const voucher = new this.voucherModel(data);
    return voucher.save();
  }

  async findAll(): Promise<VoucherDocument[]> {
    return this.voucherModel
      .find({
        $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<VoucherDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.voucherModel
      .findOne({
        _id: id,
        $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
      })
      .exec();
  }

  async findByCode(code: string): Promise<VoucherDocument | null> {
    return this.voucherModel
      .findOne({
        code: code.trim().toUpperCase(),
        $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
      })
      .exec();
  }

  async update(
    id: string,
    data: Partial<Voucher>,
  ): Promise<VoucherDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.voucherModel
      .findOneAndUpdate(
        {
          _id: id,
          $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
        },
        data,
        {
          new: true,
        },
      )
      .exec();
  }

  async softDelete(id: string): Promise<VoucherDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.voucherModel
      .findOneAndUpdate(
        {
          _id: id,
          $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
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
}
