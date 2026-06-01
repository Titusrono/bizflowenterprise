import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseDocument } from '../../common/schemas/base.schema';

export type ChartOfAccountDocument = ChartOfAccount & Document;

/**
 * Chart of Accounts (COA)
 * Defines the hierarchical structure of all accounts
 * Follows double-entry bookkeeping principles
 */
@Schema({ timestamps: true })
export class ChartOfAccount extends BaseDocument {
  /**
   * Account Code - Unique identifier for the account
   * Format: Class (1 digit) + Main Category (2 digits) + Sub Category (2 digits) + Sequential (3 digits)
   * E.g., 1-10-01-001 for Cash in Bank
   */
  @Prop({ type: String, required: true, index: true })
  accountCode: string;

  /**
   * Account Name - Human readable name
   */
  @Prop({ type: String, required: true, index: true })
  name: string;

  /**
   * Account Type - Main classification per accounting standards
   * 1 = Asset
   * 2 = Liability
   * 3 = Equity/Capital
   * 4 = Revenue/Income
   * 5 = Expense/Cost
   * 6 = Contra Account
   */
  @Prop({ type: Number, required: true, enum: [1, 2, 3, 4, 5, 6], index: true })
  accountType: number;

  /**
   * Account Type Name for display
   */
  @Prop({ type: String, enum: ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense', 'Contra'], default: 'Asset' })
  accountTypeName: string;

  /**
   * Sub-category for more detailed classification
   * E.g., Current Asset, Fixed Asset, etc.
   */
  @Prop({ type: String, default: null })
  subCategory: string;

  /**
   * Account Description - Purpose and usage
   */
  @Prop({ type: String, default: null })
  description: string;

  /**
   * Opening Balance - Initial balance for the account
   */
  @Prop({ type: Number, default: 0 })
  openingBalance: number;

  /**
   * Current Balance - Maintained for quick access
   * Debit balance or Credit balance
   */
  @Prop({ type: Number, default: 0 })
  currentBalance: number;

  /**
   * Balance Type: 'Debit' or 'Credit'
   * - Debit: Assets, Expenses
   * - Credit: Liabilities, Equity, Revenue
   */
  @Prop({ type: String, enum: ['Debit', 'Credit'], required: true })
  normalBalance: string;

  /**
   * Parent Account Code (for hierarchical COA)
   * Null if this is a main account
   */
  @Prop({ type: String, default: null, index: true })
  parentCode: string;

  /**
   * Is Header Account - Non-posting account used for grouping
   */
  @Prop({ type: Boolean, default: false })
  isHeader: boolean;

  /**
   * Is Active for posting new transactions
   */
  @Prop({ type: Boolean, default: true, index: true })
  isActive: boolean;

  /**
   * Organization-wide or Branch-specific
   * True = Global account, False = Branch specific
   */
  @Prop({ type: Boolean, default: false })
  isOrganizationWide: boolean;

  /**
   * Organization ID - Account belongs to which organization
   */
  @Prop({ type: Types.ObjectId, required: true, index: true })
  organizationId: Types.ObjectId;

  /**
   * Branch ID - If organization-wide, this is null
   */
  @Prop({ type: Types.ObjectId, default: null, index: true })
  branchId: Types.ObjectId;

  /**
   * Can be deleted or disabled
   */
  @Prop({ type: Boolean, default: false })
  allowDelete: boolean;

  /**
   * Is this a system/seed account (cannot be deleted)
   */
  @Prop({ type: Boolean, default: false })
  isSystem: boolean;

  /**
   * Custom metadata for extensibility
   */
  @Prop({ type: Object, default: {} })
  metadata?: Record<string, any>;
}

export const ChartOfAccountSchema = SchemaFactory.createForClass(ChartOfAccount);

// Indexes for common queries
ChartOfAccountSchema.index({ accountCode: 1, organizationId: 1, isDeleted: 1 });
ChartOfAccountSchema.index({ organizationId: 1, branchId: 1, isDeleted: 1 });
ChartOfAccountSchema.index({ accountType: 1, organizationId: 1, isDeleted: 1 });
ChartOfAccountSchema.index({ isActive: 1, organizationId: 1, isDeleted: 1 });
ChartOfAccountSchema.index({ parentCode: 1, organizationId: 1, isDeleted: 1 });
ChartOfAccountSchema.index({ createdAt: -1 });
