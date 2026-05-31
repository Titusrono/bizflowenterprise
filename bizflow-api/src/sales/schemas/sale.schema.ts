import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseDocument } from '../../common/schemas/base.schema';
import { InvoiceStatus, PaymentMethod, PaymentStatus, SaleType } from '../dto/sales.dto';

export type SaleDocument = Sale & Document;

@Schema({ _id: false })
export class SaleLineItem {
  @Prop({ type: Types.ObjectId, required: true })
  inventoryId: Types.ObjectId;

  @Prop({ type: String, default: null })
  sku?: string;

  @Prop({ type: String, default: null })
  name?: string;

  @Prop({ type: Number, required: true, min: 1 })
  quantity: number;

  @Prop({ type: Number, required: true, min: 0 })
  unitPrice: number;

  @Prop({ type: Number, required: true, min: 0 })
  subtotal: number;
}

@Schema({ _id: false })
export class SalePayment {
  @Prop({ type: Number, required: true, min: 0 })
  amount: number;

  @Prop({ type: String, enum: PaymentMethod, required: true })
  method: PaymentMethod;

  @Prop({ type: Date, default: Date.now })
  paidAt: Date;

  @Prop({ type: String, default: null })
  reference?: string;

  @Prop({ type: String, default: null })
  notes?: string;

  @Prop({ type: Types.ObjectId, default: null })
  recordedBy?: Types.ObjectId;
}

@Schema({ timestamps: true, collection: 'sales' })
export class Sale extends BaseDocument {
  @Prop({ type: String, required: true, index: true })
  saleNumber: string;

  @Prop({ type: String, default: null, index: true })
  invoiceNumber?: string;

  @Prop({ type: String, enum: SaleType, required: true, index: true })
  saleType: SaleType;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, default: null, index: true })
  branchId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  soldBy: Types.ObjectId;

  @Prop({ type: String, default: null })
  customerName?: string;

  @Prop({ type: String, default: null })
  customerPhone?: string;

  @Prop({ type: String, default: null })
  notes?: string;

  @Prop({ type: Date, default: null, index: true })
  invoiceDueDate?: Date;

  @Prop({ type: String, enum: InvoiceStatus, default: InvoiceStatus.OPEN, index: true })
  invoiceStatus: InvoiceStatus;

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.UNPAID, index: true })
  paymentStatus: PaymentStatus;

  @Prop({ type: Number, required: true, min: 0 })
  subtotal: number;

  @Prop({ type: Number, required: true, min: 0 })
  totalPaid: number;

  @Prop({ type: Number, required: true, min: 0 })
  balanceDue: number;

  @Prop({ type: [SaleLineItem], default: [] })
  lineItems: SaleLineItem[];

  @Prop({ type: [SalePayment], default: [] })
  payments: SalePayment[];
}

export const SaleSchema = SchemaFactory.createForClass(Sale);

SaleSchema.index({ organizationId: 1, branchId: 1, saleType: 1, isDeleted: 1 });
SaleSchema.index({ organizationId: 1, paymentStatus: 1, isDeleted: 1 });
SaleSchema.index({ organizationId: 1, invoiceStatus: 1, isDeleted: 1 });
SaleSchema.index({ organizationId: 1, saleNumber: 1, isDeleted: 1 });
SaleSchema.index({ organizationId: 1, invoiceNumber: 1, isDeleted: 1 });
SaleSchema.index({ createdAt: -1 });
