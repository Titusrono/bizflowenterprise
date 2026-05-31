import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseDocument } from '../../common/schemas/base.schema';
import { PaymentMethod, PaymentStatus } from '../dto/expense.dto';

export type ExpenseDocument = Expense & Document;

@Schema({ _id: false })
@Schema({ _id: false })
export class ExpensePayment {
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

@Schema({ timestamps: true, collection: 'expenses' })
export class Expense extends BaseDocument {
  @Prop({ type: String, required: true, index: true })
  expenseNumber: string;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, default: null })
  supplierId?: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  date: Date;

  @Prop({ type: String, default: '', index: true })
  description: string;

  @Prop({ type: Number, required: true, min: 0, default: 0 })
  amount: number;

  @Prop({ type: String, default: 'OPEN', index: true })
  status: string;

  @Prop({ type: Number, default: 0, min: 0 })
  totalPaid: number;

  @Prop({ type: Number, default: 0, min: 0 })
  balanceDue: number;

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.UNPAID, index: true })
  paymentStatus: PaymentStatus;

  @Prop({ type: [ExpensePayment], default: [] })
  payments: ExpensePayment[];
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);

ExpenseSchema.index({ organizationId: 1, isDeleted: 1 });
