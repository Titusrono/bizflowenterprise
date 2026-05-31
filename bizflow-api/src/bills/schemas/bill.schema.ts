import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseDocument } from '../../common/schemas/base.schema';
import { PaymentMethod, PaymentStatus } from '../dto/bill.dto';

export type BillDocument = Bill & Document;

@Schema({ _id: false })
export class BillLineItem {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Number, required: true, min: 1 })
  quantity: number;

  @Prop({ type: Number, required: true, min: 0 })
  unitPrice: number;

  @Prop({ type: Number, required: true, min: 0 })
  subtotal: number;
}

@Schema({ _id: false })
export class BillPayment {
  @Prop({ type: Number, required: true, min: 0.01 })
  amount: number;

  @Prop({ type: String, enum: PaymentMethod, required: true })
  method: PaymentMethod;

  @Prop({ type: Date, default: Date.now })
  paidAt: Date;

  @Prop({ type: String, default: null })
  reference?: string;

  @Prop({ type: String, default: null })
  notes?: string;
}

@Schema({ timestamps: true, collection: 'bills' })
export class Bill extends BaseDocument {
  @Prop({ type: String, required: true, index: true })
  billNumber: string;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  supplierId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, default: null, index: true })
  purchaseId?: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  date: Date;

  @Prop({ type: Number, required: true, min: 0, default: 0 })
  subtotal: number;

  @Prop({ type: Number, required: true, min: 0, default: 0 })
  total: number;

  @Prop({ type: [BillLineItem], default: [] })
  lineItems: BillLineItem[];

  @Prop({ type: String, default: 'OPEN', index: true })
  status: string;

  @Prop({ type: Number, default: 0, min: 0 })
  totalPaid: number;

  @Prop({ type: Number, default: 0, min: 0 })
  balanceDue: number;

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.UNPAID, index: true })
  paymentStatus: PaymentStatus;

  @Prop({ type: [BillPayment], default: [] })
  payments: BillPayment[];
}

export const BillSchema = SchemaFactory.createForClass(Bill);

BillSchema.index({ organizationId: 1, supplierId: 1, isDeleted: 1 });
BillSchema.index({ organizationId: 1, billNumber: 1, isDeleted: 1 });
