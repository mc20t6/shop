import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type VariantDocument = HydratedDocument<Variant>;

@Schema({ collection: 'variants', timestamps: true })
export class Variant {
  id: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Product',
    required: true,
  })
  productId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  size: string;

  @Prop({ required: true, trim: true })
  color: string;

  // @Prop({ required: true, trim: true })
  // colorCode: string;

  @Prop({ required: true, trim: true, uppercase: true })
  sku: string;

  // Số lượng tồn kho
  @Prop({ required: true, default: 0, min: 0 })
  stock: number;

  @Prop({ required: true, default: 0, min: 0 })
  price: number;

  @Prop({ default: '' })
  image: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;
}

export const VariantSchema = SchemaFactory.createForClass(Variant);

VariantSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    const { _id, ...rest } = ret;

    return {
      ...rest,
      id: _id.toString(),
    };
  },
});

VariantSchema.index({ productId: 1 });
VariantSchema.index({ sku: 1 }, { unique: true });
VariantSchema.index({ deletedAt: 1 });
VariantSchema.index({ isActive: 1 });
VariantSchema.index({ stock: 1 });
