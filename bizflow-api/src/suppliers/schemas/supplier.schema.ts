import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseDocument } from '../../common/schemas/base.schema';

export type SupplierDocument = Supplier & Document;

@Schema({ timestamps: true })
export class Supplier extends BaseDocument {
  @Prop({ type: String, required: true, trim: true })
  name?: string;

  @Prop({ type: String, default: null })
  phoneNumber?: string;

  @Prop({ type: String, default: null })
  email?: string;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  organizationId?: Types.ObjectId;
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);

SupplierSchema.index({ organizationId: 1, name: 1, isDeleted: 1 });
SupplierSchema.index({ organizationId: 1, createdAt: -1 });