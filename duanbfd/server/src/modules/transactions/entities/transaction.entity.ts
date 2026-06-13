import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';

export type TransactionDocument = HydratedDocument<Transaction>;

@Schema({ collection: 'transactions', timestamps: { createdAt: true, updatedAt: false } })
export class Transaction {
  id: string;

  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true })
  transactionNo: string;

  @Prop({ required: true })
  gateway: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  status: string;

  @Prop({ type: SchemaTypes.Mixed })
  rawResponse: Record<string, any>;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
