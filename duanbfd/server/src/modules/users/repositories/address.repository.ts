import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Address, AddressDocument } from '../entities/address.entity';
import { BaseRepository } from 'src/database/mongodb/repositories/base.repository';

@Injectable()
export class AddressRepository extends BaseRepository<AddressDocument> {
  constructor(@InjectModel(Address.name) model: Model<AddressDocument>) {
    super(model);
  }

  findByUserId(userId: string) {
    return this.model.find({ userId }).lean({ virtuals: true }).exec();
  }

  delete(id: string) {
    return this.deleteById(id);
  }
}
