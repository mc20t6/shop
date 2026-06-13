import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CartItemDocument = HydratedDocument<CartItem>;

@Schema({
  collection: 'cartitems',
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
export class CartItem {
  id: string;

  @Prop({ required: true, trim: true })
  cartId: string;

  @Prop({ required: true, trim: true })
  variantId: string;

  @Prop({ required: true, default: 1 })
  quantity: number;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);

CartItemSchema.index(
  {
    cartId: 1,
    variantId: 1,
  },
  {
    unique: true,
  },
);
