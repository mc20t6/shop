import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ReturnDocument = HydratedDocument<ReturnRequest>;

@Schema({ collection: 'returns', timestamps: true })
export class ReturnRequest {
  id: string;

  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  reason: string;

  @Prop({ required: true, default: 'pending' })
  status: string;

  @Prop({ required: true })
  type: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ default: '' })
  staffNote: string;

  @Prop({ type: Date, default: null })
  resolveAt?: Date;

  @Prop({ type: Date, default: null })
  deletedAt?: Date;
}

export const ReturnSchema = SchemaFactory.createForClass(ReturnRequest);
