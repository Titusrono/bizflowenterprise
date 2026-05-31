import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseDocument } from '../../common/schemas/base.schema';

export type CustomerDocument = Customer & Document;

@Schema({ timestamps: true })
export class Customer extends BaseDocument {
  @Prop({ type: String, required: true, trim: true })
  name?: string;

  @Prop({ type: String, default: null })
  phoneNumber?: string;

  @Prop({ type: String, default: null })
  email?: string;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  organizationId?: Types.ObjectId;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

CustomerSchema.index({ organizationId: 1, name: 1, isDeleted: 1 });
CustomerSchema.index({ organizationId: 1, createdAt: -1 });