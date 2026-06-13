import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum VoucherType {
  PERCENT = 'PERCENT',
  FIXED = 'FIXED',
}

export type VoucherDocument = HydratedDocument<Voucher>;

@Schema({
  collection: 'vouchers',
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret: Record<string, any>) => {
      ret.id = ret._id.toString();
      delete ret._id;
    },
  },
})
export class Voucher {
  id: string;

  @Prop({ required: true, trim: true, uppercase: true })
  code: string;

  @Prop({ enum: VoucherType, required: true })
  type: VoucherType;

  @Prop({ required: true })
  value: number;

  @Prop({ required: true })
  minOrderValue: number;

  @Prop({ required: true })
  maxDiscount: number;

  @Prop({ default: 0 })
  useCount: number;

  @Prop({ required: true })
  usageLimit: number;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  deletedAt?: Date;
}

export const VoucherSchema = SchemaFactory.createForClass(Voucher);

VoucherSchema.index({ code: 1 }, { unique: true });
