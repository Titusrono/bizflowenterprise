import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseDocument } from '../../common/schemas/base.schema';

export type TaxDocument = Tax & Document;

@Schema({ timestamps: true })
export class Tax extends BaseDocument {
  @Prop({ type: String, required: true, trim: true })
  name?: string;

  @Prop({ type: Number, required: true, min: 0, max: 100 })
  percentage?: number;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  organizationId?: Types.ObjectId;
}

export const TaxSchema = SchemaFactory.createForClass(Tax);

TaxSchema.index({ organizationId: 1, name: 1, isDeleted: 1 });
TaxSchema.index({ organizationId: 1, createdAt: -1 });