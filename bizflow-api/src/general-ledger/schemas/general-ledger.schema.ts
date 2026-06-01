import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseDocument } from '../../common/schemas/base.schema';

export type GeneralLedgerDocument = GeneralLedger & Document;

/**
 * General Ledger
 * Records all posted journal entries organized by account
 * Provides account history and balance tracking
 */
@Schema({ timestamps: true })
export class GeneralLedger extends BaseDocument {
  /**
   * Account ID - Reference to Chart of Account
   */
  @Prop({ type: Types.ObjectId, required: true, index: true })
  accountId: Types.ObjectId;

  /**
   * Account Code - Denormalized for quick access
   */
  @Prop({ type: String, required: true, index: true })
  accountCode: string;

  /**
   * Account Name - Denormalized for quick access
   */
  @Prop({ type: String, required: true })
  accountName: string;

  /**
   * Journal Entry ID - Link to source journal entry
   */
  @Prop({ type: Types.ObjectId, required: true, index: true })
  journalId: Types.ObjectId;

  /**
   * Journal Number - Denormalized reference
   */
  @Prop({ type: String, required: true })
  journalNumber: string;

  /**
   * Debit Amount
   */
  @Prop({ type: Number, default: 0, index: true })
  debit: number;

  /**
   * Credit Amount
   */
  @Prop({ type: Number, default: 0, index: true })
  credit: number;

  /**
   * Running Balance - Cumulative balance after this entry
   * Used for quick calculation of balances at specific dates
   */
  @Prop({ type: Number, required: true })
  balance: number;

  /**
   * Balance Type: Debit or Credit
   */
  @Prop({ type: String, enum: ['Debit', 'Credit'], required: true })
  balanceType: string;

  /**
   * Entry Date - Date the transaction occurred
   */
  @Prop({ type: Date, required: true, index: true })
  entryDate: Date;

  /**
   * Period - Financial period (e.g., 2024-12)
   */
  @Prop({ type: String, required: true, index: true })
  period: string;

  /**
   * Fiscal Year
   */
  @Prop({ type: Number, required: true, index: true })
  fiscalYear: number;

  /**
   * Narration - Description of the entry
   */
  @Prop({ type: String, default: null })
  narration: string;

  /**
   * Reference Number - Source document reference
   */
  @Prop({ type: String, default: null })
  referenceNumber: string;

  /**
   * Reference Type - Type of source document
   */
  @Prop({ type: String, default: null })
  referenceType: string;

  /**
   * Currency Code
   */
  @Prop({ type: String, default: 'USD' })
  currency: string;

  /**
   * Counterparty Name - Who is involved (Customer, Vendor, etc.)
   */
  @Prop({ type: String, default: null })
  counterpartyName: string;

  /**
   * Counterparty ID - Link to customer/vendor/employee
   */
  @Prop({ type: Types.ObjectId, default: null })
  counterpartyId: Types.ObjectId;

  /**
   * Organization ID
   */
  @Prop({ type: Types.ObjectId, required: true, index: true })
  organizationId: Types.ObjectId;

  /**
   * Branch ID
   */
  @Prop({ type: Types.ObjectId, default: null, index: true })
  branchId: Types.ObjectId;

  /**
   * Is Reconciled - Has this entry been reconciled with bank statements, etc.
   */
  @Prop({ type: Boolean, default: false })
  isReconciled: boolean;

  /**
   * Reconciliation Date
   */
  @Prop({ type: Date, default: null })
  reconciledAt: Date;

  /**
   * Is Reversing Entry
   */
  @Prop({ type: Boolean, default: false })
  isReversing: boolean;

  /**
   * Reversing Entry ID
   */
  @Prop({ type: Types.ObjectId, default: null })
  reversingEntryId: Types.ObjectId;

  /**
   * Custom metadata
   */
  @Prop({ type: Object, default: {} })
  metadata?: Record<string, any>;
}

export const GeneralLedgerSchema = SchemaFactory.createForClass(GeneralLedger);

// Indexes for common queries
GeneralLedgerSchema.index({ accountId: 1, organizationId: 1, isDeleted: 1 });
GeneralLedgerSchema.index({ accountCode: 1, organizationId: 1, isDeleted: 1 });
GeneralLedgerSchema.index({ organizationId: 1, branchId: 1, isDeleted: 1 });
GeneralLedgerSchema.index({ entryDate: -1, accountId: 1, organizationId: 1 });
GeneralLedgerSchema.index({ period: 1, accountId: 1, organizationId: 1 });
GeneralLedgerSchema.index({ journalId: 1 });
GeneralLedgerSchema.index({ referenceNumber: 1, organizationId: 1 });
GeneralLedgerSchema.index({ createdAt: -1 });
// Compound index for balance calculations
GeneralLedgerSchema.index({ accountId: 1, entryDate: 1, organizationId: 1 });
