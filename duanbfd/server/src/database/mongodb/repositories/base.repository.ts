import { Model, UpdateQuery } from 'mongoose';

export abstract class BaseRepository<TDocument> {
  protected constructor(protected readonly model: Model<TDocument>) {}

  findAll() {
    return this.model.find().lean({ virtuals: true }).exec();
  }

  findById(id: string) {
    return this.model.findById(id).lean({ virtuals: true }).exec();
  }

  create(data: Partial<TDocument>) {
    return this.model.create(data);
  }

  updateById(id: string, data: UpdateQuery<TDocument>) {
    return this.model
      .findByIdAndUpdate(id, data, { new: true })
      .lean({ virtuals: true })
      .exec();
  }

  deleteById(id: string) {
    return this.model.findByIdAndDelete(id).lean({ virtuals: true }).exec();
  }
}
