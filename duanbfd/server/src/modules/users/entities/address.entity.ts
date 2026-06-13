import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AddressDocument = HydratedDocument<Address>;

@Schema({ collection: 'addresses', timestamps: true })
export class Address {
  id: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ required: true })
  address: string;

  @Prop()
  deletedAt?: Date;
}

export const AddressSchema = SchemaFactory.createForClass(Address);
