import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseDocument } from '../../common/schemas/base.schema';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category extends BaseDocument {
  @Prop({ type: String, required: true, trim: true })
  name?: string;

  @Prop({ type: String, default: null })
  description?: string;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  organizationId?: Types.ObjectId;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.index({ organizationId: 1, name: 1, isDeleted: 1 });
CategorySchema.index({ organizationId: 1, createdAt: -1 });