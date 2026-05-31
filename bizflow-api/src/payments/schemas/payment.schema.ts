import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseDocument } from '../../common/schemas/base.schema';
import { PaymentProviderType } from '../dto/payment.dto';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment extends BaseDocument {
  @Prop({ type: String, required: true, trim: true })
  name?: string;

  @Prop({ type: String, enum: PaymentProviderType, required: true, index: true })
  providerType?: PaymentProviderType;

  @Prop({ type: String, default: null })
  accountName?: string;

  @Prop({ type: String, default: null })
  bankName?: string;

  @Prop({ type: String, default: null })
  branchName?: string;

  @Prop({ type: String, default: null })
  phoneNumber?: string;

  @Prop({ type: String, default: null })
  tillNumber?: string;

  @Prop({ type: String, default: null })
  paybillNumber?: string;

  @Prop({ type: String, default: null })
  accountNumber?: string;

  @Prop({ type: String, default: null })
  notes?: string;

  @Prop({ type: Boolean, default: false, index: true })
  isDefault?: boolean;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  organizationId?: Types.ObjectId;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

PaymentSchema.index({ organizationId: 1, providerType: 1, isDeleted: 1 });
PaymentSchema.index({ organizationId: 1, name: 1, isDeleted: 1 });
PaymentSchema.index({ organizationId: 1, createdAt: -1 });