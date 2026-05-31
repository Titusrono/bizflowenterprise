import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseDocument } from '../../common/schemas/base.schema';
import { RestockRequestStatus } from '../dto/restock.dto';

export type RestockRequestDocument = RestockRequest & Document;

@Schema({ _id: false })
export class RestockLineItem {
  @Prop({ type: Types.ObjectId, required: true })
  inventoryId: Types.ObjectId;

  @Prop({ type: String, default: null })
  sku?: string;

  @Prop({ type: String, default: null })
  name?: string;

  @Prop({ type: Number, required: true, min: 1 })
  requestedQuantity: number;

  @Prop({ type: Number, default: null })
  approvedQuantity?: number;

  @Prop({ type: Number, default: 0 })
  unitCost?: number;

  @Prop({ type: String, default: null })
  notes?: string;
}

@Schema({ timestamps: true, collection: 'restockrequests' })
export class RestockRequest extends BaseDocument {
  @Prop({ type: String, required: false, index: true })
  referenceNumber?: string;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, default: null, index: true })
  branchId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  requestedBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, default: null, index: true })
  approvedBy?: Types.ObjectId;

  @Prop({ type: Date, default: null })
  approvedAt?: Date;

  @Prop({ type: String, enum: RestockRequestStatus, default: RestockRequestStatus.DRAFT, index: true })
  status: RestockRequestStatus;

  @Prop({ type: String, default: null })
  notes?: string;

  @Prop({ type: String, default: null })
  approvalNotes?: string;

  @Prop({ type: [RestockLineItem], default: [] })
  lineItems: RestockLineItem[];
}

export const RestockRequestSchema = SchemaFactory.createForClass(RestockRequest);

RestockRequestSchema.index({ organizationId: 1, branchId: 1, status: 1, isDeleted: 1 });
RestockRequestSchema.index({ organizationId: 1, referenceNumber: 1, isDeleted: 1 });
RestockRequestSchema.index({ createdAt: -1 });
