import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  BaseDocument,
  DocumentStatus,
} from '../../common/schemas/base.schema';

export type OrganizationDocument = Organization & Document;

/**
 * Organization Schema
 * Extends BaseDocument for common fields (timestamps, soft delete, audit trail)
 */
@Schema({ timestamps: true })
export class Organization extends BaseDocument {
  @Prop({ type: String, required: true })
  name?: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  code?: string;

  @Prop({ type: String, default: null })
  logo?: string;

  @Prop({ type: String, default: null })
  description?: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  email?: string;

  @Prop({ type: String, default: null })
  phone?: string;

  @Prop({ type: String, default: null })
  address?: string;

  @Prop({ type: String, default: null })
  country?: string;

  @Prop({ type: String, default: null })
  city?: string;

  @Prop({ type: String, default: null })
  state?: string;

  @Prop({ type: String, default: null })
  zipCode?: string;

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

  @Prop({ type: Types.ObjectId, required: true, index: true })
  ownerId?: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], default: [] })
  members?: Types.ObjectId[];

  @Prop({ type: String, default: 'standard' })
  plan?: 'free' | 'standard' | 'premium' | 'enterprise';

  @Prop({ type: Date, default: null })
  planStartDate?: Date;

  @Prop({ type: Date, default: null })
  planEndDate?: Date;

  @Prop({ type: Number, default: 1 })
  maxBranches?: number;

  @Prop({ type: Number, default: 10 })
  maxUsers?: number;

  @Prop({ type: Object, default: {} })
  settings?: Record<string, any>;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);

// Indexes for common queries
OrganizationSchema.index({ code: 1, isDeleted: 1 });
OrganizationSchema.index({ email: 1, isDeleted: 1 });
OrganizationSchema.index({ ownerId: 1, isDeleted: 1 });
OrganizationSchema.index({ status: 1, isDeleted: 1 });
OrganizationSchema.index({ createdAt: -1 });
