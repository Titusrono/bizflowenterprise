import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  BaseDocument,
  DocumentStatus,
} from '../../common/schemas/base.schema';

export type BranchDocument = Branch & Document;

/**
 * Branch Schema
 * Extends BaseDocument for common fields (timestamps, soft delete, audit trail)
 */
@Schema({ timestamps: true })
export class Branch extends BaseDocument {
  @Prop({ type: String, required: true })
  name?: string;

  @Prop({ type: String, required: true, index: true })
  code?: string;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  organizationId?: Types.ObjectId;

  @Prop({ type: String, default: null })
  location?: string;

  @Prop({ type: String, default: null })
  phone?: string;

  @Prop({ type: String, default: null })
  email?: string;

  @Prop({
    enum: DocumentStatus,
    default: DocumentStatus.ACTIVE,
    index: true,
  })
  status?: DocumentStatus;

  @Prop({ type: String, default: null })
  statusReason?: string;

  @Prop({ type: Date, default: null })
  statusChangedAt?: Date;

  @Prop({ type: [Types.ObjectId], default: [] })
  managers?: Types.ObjectId[];

  @Prop({ type: String, default: null })
  region?: string;

  @Prop({ type: String, default: null })
  timezone?: string;

  @Prop({ type: String, default: null })
  country?: string;

  @Prop({ type: String, default: null })
  city?: string;

  @Prop({ type: String, default: null })
  state?: string;

  @Prop({ type: String, default: null })
  zipCode?: string;

  @Prop({ type: String, default: null })
  address?: string;

  @Prop({ type: Object, default: {} })
  settings?: Record<string, any>;

  @Prop({ type: Number, default: null })
  headCount?: number;

  @Prop({ type: String, default: null })
  departmentHead?: string;
}

export const BranchSchema = SchemaFactory.createForClass(Branch);

// Indexes for common queries
BranchSchema.index({ code: 1, organizationId: 1, isDeleted: 1 });
BranchSchema.index({ organizationId: 1, status: 1 });
BranchSchema.index({ status: 1, isDeleted: 1 });
BranchSchema.index({ createdAt: -1 });
