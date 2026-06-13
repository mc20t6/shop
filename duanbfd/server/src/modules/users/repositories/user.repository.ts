import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery, Types } from 'mongoose';
import { User, UserDocument, UserRole } from '../entities/user.entity';

export type CreateUserData = {
  email: string;
  phone: string;
  password: string;
  fullName: string;
  role?: UserRole;
};

export type UpdateUserData = Partial<
  Pick<
    User,
    | 'email'
    | 'fullName'
    | 'phone'
    | 'password'
    | 'avatar'
    | 'isActive'
    | 'deletedAt'
    | 'refreshToken'
    | 'passwordResetToken'
    | 'passwordResetExpires'
  >
>;

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async findOne(filter: Record<string, any>) {
    return await this.userModel.findOne(filter).exec();
  }

  findAll() {
    return this.userModel.find().lean({ virtuals: true }).exec();
  }

  findById(id: string) {
    return this.userModel.findById(id).lean({ virtuals: true }).exec();
  }

  findByEmail(email: string) {
    return this.userModel.findOne({ email }).lean({ virtuals: true }).exec();
  }

  findByEmailOrPhone(email: string, phone: string) {
    return this.userModel
      .findOne({
        $or: [{ email }, { phone }],
      })
      .lean({ virtuals: true })
      .exec();
  }

  create(data: CreateUserData) {
    return this.userModel.create(data);
  }

  findActiveStaff() {
    return this.userModel
      .find({ role: UserRole.STAFF, isActive: true })
      .select('fullName email phone')
      .lean({ virtuals: true })
      .exec();
  }

  updateById(id: string, data: UpdateUserData) {
    return this.userModel
      .findByIdAndUpdate(id, data as UpdateQuery<UserDocument>, {
        returnDocument: 'after',
      })
      .lean({ virtuals: true })
      .exec();
  }

  isValidObjectId(id: string) {
    return Types.ObjectId.isValid(id);
  }

  findAllStaff() {
    return this.userModel
      .find({
        role: UserRole.STAFF,
        deletedAt: null,
      })
      .select(
        '-password -refreshToken -passwordResetToken -passwordResetExpires',
      )
      .sort({ createdAt: -1 })
      .lean({ virtuals: true })
      .exec();
  }

  findStaffById(id: string) {
    return this.userModel
      .findOne({
        _id: id,
        role: UserRole.STAFF,
        deletedAt: null,
      })
      .select(
        '-password -refreshToken -passwordResetToken -passwordResetExpires',
      )
      .lean({ virtuals: true })
      .exec();
  }

  findStaffDocumentById(id: string) {
    return this.userModel
      .findOne({
        _id: id,
        role: UserRole.STAFF,
        deletedAt: null,
      })
      .exec();
  }

  findByEmailOrPhoneExceptId(id: string, email?: string, phone?: string) {
    const conditions: Record<string, any>[] = [];

    if (email) {
      conditions.push({ email });
    }

    if (phone) {
      conditions.push({ phone });
    }

    if (conditions.length === 0) {
      return null;
    }

    return this.userModel
      .findOne({
        _id: { $ne: id },
        deletedAt: null,
        $or: conditions,
      })
      .exec();
  }

  createStaff(data: CreateUserData) {
    return this.userModel.create({
      ...data,
      role: UserRole.STAFF,
      isActive: true,
    });
  }

  softDeleteStaffById(id: string) {
    return this.userModel
      .findOneAndUpdate(
        {
          _id: id,
          role: UserRole.STAFF,
          deletedAt: null,
        },
        {
          isActive: false,
          deletedAt: new Date(),
        },
        {
          returnDocument: 'after',
        },
      )
      .select(
        '-password -refreshToken -passwordResetToken -passwordResetExpires',
      )
      .lean({ virtuals: true })
      .exec();
  }

  findByIdUser(id: string) {
    return this.userModel
      .findOne({
        _id: new Types.ObjectId(id),
        deletedAt: null,
      })
      .exec();
  }

  updateByIdUser(id: string, data: Partial<User>) {
    return this.userModel
      .findByIdAndUpdate(
        id,
        {
          $set: data,
        },
        {
          new: true,
        },
      )
      .select(
        '-password -refreshToken -passwordResetToken -passwordResetExpires',
      )
      .lean({ virtuals: true })
      .exec();
  }

  findManagedUsersPaginated(filter: any, skip: number, limit: number) {
    return this.userModel
      .find(filter)
      .select(
        '-password -refreshToken -passwordResetToken -passwordResetExpires',
      )
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true })
      .exec();
  }

  countManagedUsers(filter: any) {
    return this.userModel.countDocuments(filter).exec();
  }

  findManagedUserById(id: string) {
    return this.userModel
      .findOne({
        _id: new Types.ObjectId(id),
        role: {
          $in: [UserRole.STAFF, UserRole.CUSTOMER],
        },
        deletedAt: null,
      })
      .select(
        '-password -refreshToken -passwordResetToken -passwordResetExpires',
      )
      .lean({ virtuals: true })
      .exec();
  }

  updateManagedUser(id: string, data: UpdateUserData) {
    return this.userModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          role: {
            $in: [UserRole.STAFF, UserRole.CUSTOMER],
          },
          deletedAt: null,
        },
        {
          $set: data,
        },
        {
          returnDocument: 'after',
        },
      )
      .select(
        '-password -refreshToken -passwordResetToken -passwordResetExpires',
      )
      .lean({ virtuals: true })
      .exec();
  }
}
