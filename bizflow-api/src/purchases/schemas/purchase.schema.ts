import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseDocument } from '../../common/schemas/base.schema';
import { PurchaseStatus } from '../dto/purchase.dto';

export type PurchaseDocument = Purchase & Document;

@Schema({ _id: false })
export class PurchaseLineItem {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, default: null })
  sku?: string;

  @Prop({ type: Number, required: true, min: 1 })
  quantity: number;

  @Prop({ type: Number, required: true, min: 0 })
  unitPrice: number;

  @Prop({ type: Number, required: true, min: 0 })
  subtotal: number;
}

@Schema({ _id: false })
export class PurchaseReceiptLineItem {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, default: null })
  sku?: string;

  @Prop({ type: Number, required: true, min: 1 })
  quantity: number;

  @Prop({ type: Number, required: true, min: 0 })
  unitPrice: number;

  @Prop({ type: Number, required: true, min: 0 })
  subtotal: number;
}

@Schema({ _id: false })
export class PurchaseReceipt {
  @Prop({ type: Date, default: Date.now })
  receivedAt: Date;

  @Prop({ type: String, default: null })
  notes?: string;

  @Prop({ type: [PurchaseReceiptLineItem], default: [] })
  lineItems: PurchaseReceiptLineItem[];
}

@Schema({ timestamps: true, collection: 'purchases' })
export class Purchase extends BaseDocument {
  @Prop({ type: String, required: true, index: true })
  purchaseNumber: string;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  supplierId: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  date: Date;

  @Prop({ type: Number, required: true, min: 0, default: 0 })
  subtotal: number;

  @Prop({ type: Number, required: true, min: 0, default: 0 })
  total: number;

  @Prop({ type: [PurchaseLineItem], default: [] })
  lineItems: PurchaseLineItem[];

  @Prop({ type: Number, required: true, min: 0, default: 0 })
  receivedTotal: number;

  @Prop({ type: Number, required: true, min: 0, default: 0 })
  balanceDue: number;

  @Prop({ type: [PurchaseReceipt], default: [] })
  receipts: PurchaseReceipt[];

  @Prop({ type: Types.ObjectId, default: null, index: true })
  billId?: Types.ObjectId;

  @Prop({ type: String, enum: PurchaseStatus, default: PurchaseStatus.OPEN, index: true })
  status: string;
}

export const PurchaseSchema = SchemaFactory.createForClass(Purchase);

PurchaseSchema.index({ organizationId: 1, supplierId: 1, isDeleted: 1 });
PurchaseSchema.index({ organizationId: 1, purchaseNumber: 1, isDeleted: 1 });
