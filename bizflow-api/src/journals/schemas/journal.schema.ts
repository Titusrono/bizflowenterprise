import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseDocument } from '../../common/schemas/base.schema';

export type JournalDocument = Journal & Document;

/**
 * Journal Entry Line Item
 */
export class JournalLineItem {
  @Prop({ type: String, required: true })
  accountCode: string;

  @Prop({ type: String, required: true })
  accountName: string;

  @Prop({ type: Number, required: true })
  debit: number;

  @Prop({ type: Number, required: true })
  credit: number;

  @Prop({ type: String, default: null })
  narration: string;

  @Prop({ type: Types.ObjectId, required: true })
  accountId: Types.ObjectId;
}

/**
 * Journal Entry
 * Records all business transactions using double-entry bookkeeping
 */
@Schema({ timestamps: true })
export class Journal extends BaseDocument {
  /**
   * Journal Number - Unique identifier
   * Format: J-YYYYMM-NNNNN
   */
  @Prop({ type: String, required: true, unique: true, index: true })
  journalNumber: string;

  /**
   * Journal Type - Type of journal
   * GL = General Journal
   * SJ = Sales Journal
   * PJ = Purchase Journal
   * CRJ = Cash Receipt Journal
   * CPJ = Cash Payment Journal
   */
  @Prop({
    type: String,
    enum: ['GL', 'SJ', 'PJ', 'CRJ', 'CPJ'],
    default: 'GL',
    index: true,
  })
  journalType: string;

  /**
   * Journal Date - When the transaction occurred
   */
  @Prop({ type: Date, required: true, index: true })
  journalDate: Date;

  /**
   * Reference Number - Link to source document (Invoice, Bill, etc.)
   */
  @Prop({ type: String, default: null, index: true })
  referenceNumber: string;

  /**
   * Reference Type - Source document type
   * E.g., INVOICE, BILL, RECEIPT, PAYMENT, etc.
   */
  @Prop({ type: String, default: null })
  referenceType: string;

  /**
   * Narration/Description - Purpose of the journal entry
   */
  @Prop({ type: String, default: null })
  narration: string;

  /**
   * Journal Entry Line Items
   * Array of debits and credits
   */
  @Prop({ type: [Object], required: true })
  lineItems: JournalLineItem[];

  /**
   * Total Debits - Sum of all debit columns
   */
  @Prop({ type: Number, required: true })
  totalDebit: number;

  /**
   * Total Credits - Sum of all credit columns
   * Must equal totalDebit (double-entry rule)
   */
  @Prop({ type: Number, required: true })
  totalCredit: number;

  /**
   * Status of the journal entry
   * DRAFT = Not yet posted
   * POSTED = Posted to general ledger
   * REVERSED = Reversed entry
   */
  @Prop({
    type: String,
    enum: ['DRAFT', 'POSTED', 'REVERSED'],
    default: 'DRAFT',
    index: true,
  })
  status: string;

  /**
   * Posted Date - When entry was posted to GL
   */
  @Prop({ type: Date, default: null })
  postedAt: Date;

  /**
   * Currency Code
   */
  @Prop({ type: String, default: 'USD' })
  currency: string;

  /**
   * Organization ID
   */
  @Prop({ type: Types.ObjectId, required: true, index: true })
  organizationId: Types.ObjectId;

  /**
   * Branch ID (for multi-branch support)
   */
  @Prop({ type: Types.ObjectId, default: null, index: true })
  branchId: Types.ObjectId;

  /**
   * Period - Financial period (e.g., 2024-12 for December 2024)
   */
  @Prop({ type: String, required: true, index: true })
  period: string;

  /**
   * Fiscal Year
   */
  @Prop({ type: Number, required: true, index: true })
  fiscalYear: number;

  /**
   * Is Reversing Entry
   */
  @Prop({ type: Boolean, default: false })
  isReversing: boolean;

  /**
   * Reversing Entry ID (if this is a reversal)
   */
  @Prop({ type: Types.ObjectId, default: null })
  reversingEntryId: Types.ObjectId;

  /**
   * Approval Status
   * PENDING = Awaiting approval
   * APPROVED = Approved
   * REJECTED = Rejected
   */
  @Prop({
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'APPROVED',
  })
  approvalStatus: string;

  /**
   * Approved By - User ID who approved
   */
  @Prop({ type: Types.ObjectId, default: null })
  approvedBy: Types.ObjectId;

  /**
   * Attachment Reference (for supporting documents)
   */
  @Prop({ type: String, default: null })
  attachmentUrl: string;

  /**
   * Custom metadata
   */
  @Prop({ type: Object, default: {} })
  metadata?: Record<string, any>;
}

export const JournalSchema = SchemaFactory.createForClass(Journal);

// Indexes for common queries
JournalSchema.index({ journalNumber: 1, organizationId: 1 });
JournalSchema.index({ organizationId: 1, branchId: 1, isDeleted: 1 });
JournalSchema.index({ journalDate: -1, organizationId: 1, isDeleted: 1 });
JournalSchema.index({ status: 1, organizationId: 1, isDeleted: 1 });
JournalSchema.index({ period: 1, organizationId: 1, isDeleted: 1 });
JournalSchema.index({ referenceNumber: 1, organizationId: 1, isDeleted: 1 });
JournalSchema.index({ createdAt: -1 });
