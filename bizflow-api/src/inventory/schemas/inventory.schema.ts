import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseDocument, DocumentStatus } from '../../common/schemas/base.schema';

export type InventoryDocument = Inventory & Document;

@Schema({ timestamps: true })
export class Inventory extends BaseDocument {
  @Prop({ type: String, required: true })
  name?: string;

  @Prop({ type: String, required: true, index: true })
  sku?: string;

  @Prop({ type: String, default: null })
  description?: string;

  @Prop({ type: String, default: null, index: true })
  category?: string;

  @Prop({ type: Number, default: 0, index: true })
  quantity?: number;

  @Prop({ type: Number, default: 0 })
  unitPrice?: number;

  @Prop({ type: Number, default: 0 })
  costPrice?: number;

  @Prop({ type: Number, default: 0, index: true })
  reorderLevel?: number;

  @Prop({ type: String, default: null })
  location?: string;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  organizationId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, default: null, index: true })
  branchId?: Types.ObjectId;

  @Prop({
    enum: DocumentStatus,
    default: DocumentStatus.ACTIVE,
    index: true,
  })
  status?: DocumentStatus;

  @Prop({ type: [String], default: [] })
  tags?: string[];

  @Prop({ type: Date, default: null })
  lastStockedAt?: Date;

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, any>;
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);

InventorySchema.index({ sku: 1, organizationId: 1, isDeleted: 1 });
InventorySchema.index({ organizationId: 1, branchId: 1, isDeleted: 1 });
InventorySchema.index({ organizationId: 1, status: 1, isDeleted: 1 });
InventorySchema.index({ category: 1, isDeleted: 1 });
InventorySchema.index({ createdAt: -1 });
