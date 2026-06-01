import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository } from '../../common/repositories/base.repository';
import { GeneralLedger, GeneralLedgerDocument } from '../schemas/general-ledger.schema';

@Injectable()
export class GeneralLedgerRepository extends BaseRepository<GeneralLedgerDocument> {
  constructor(
    @InjectModel(GeneralLedger.name)
    private readonly glModel: Model<GeneralLedgerDocument>,
  ) {
    super(glModel);
  }

  /**
   * Find all GL entries for an account
   */
  async findByAccountId(accountId: string, organizationId: string, page = 1, limit = 100) {
    const filter: any = {
      accountId: new Types.ObjectId(accountId),
      organizationId: new Types.ObjectId(organizationId),
      isDeleted: false,
    };

    return this.findAllPaginated(filter, page, limit);
  }

  /**
   * Find GL entries by date range
   */
  async findByDateRange(
    fromDate: Date,
    toDate: Date,
    accountId: string,
    organizationId: string,
    page = 1,
    limit = 100,
  ) {
    const filter: any = {
      accountId: new Types.ObjectId(accountId),
      organizationId: new Types.ObjectId(organizationId),
      entryDate: {
        $gte: fromDate,
        $lte: toDate,
      },
      isDeleted: false,
    };

    return this.findAllPaginated(filter, page, limit);
  }

  /**
   * Find by period
   */
  async findByPeriod(period: string, accountId: string, organizationId: string) {
    return this.model
      .find({
        period,
        accountId: new Types.ObjectId(accountId),
        organizationId: new Types.ObjectId(organizationId),
        isDeleted: false,
      })
      .sort({ entryDate: -1 })
      .lean()
      .exec();
  }

  /**
   * Calculate account balance at specific date
   */
  async calculateBalance(accountId: string, asOfDate: Date, organizationId: string): Promise<number> {
    const entries = await this.model
      .find({
        accountId: new Types.ObjectId(accountId),
        organizationId: new Types.ObjectId(organizationId),
        entryDate: { $lte: asOfDate },
        isDeleted: false,
      })
      .sort({ entryDate: 1 })
      .lean()
      .exec();

    if (entries.length === 0) return 0;

    // Return the last running balance
    return entries[entries.length - 1].balance;
  }

  /**
   * Get account balance as of today
   */
  async getCurrentBalance(accountId: string, organizationId: string): Promise<number> {
    const lastEntry = await this.glModel
      .findOne({
        accountId: new Types.ObjectId(accountId),
        organizationId: new Types.ObjectId(organizationId),
        isDeleted: false,
      })
      .sort({ entryDate: -1 })
      .lean()
      .exec();

    return lastEntry?.balance || 0;
  }

  /**
   * Get total debits and credits by period
   */
  async getTotalsByPeriod(period: string, accountId: string, organizationId: string) {
    const entries = await this.model
      .find({
        period,
        accountId: new Types.ObjectId(accountId),
        organizationId: new Types.ObjectId(organizationId),
        isDeleted: false,
      })
      .lean()
      .exec();

    const totals = entries.reduce(
      (acc, entry) => ({
        totalDebit: acc.totalDebit + (entry.debit || 0),
        totalCredit: acc.totalCredit + (entry.credit || 0),
      }),
      { totalDebit: 0, totalCredit: 0 },
    );

    return totals;
  }

  /**
   * Find unreconciled entries
   */
  async findUnreconciledEntries(accountId: string, organizationId: string, page = 1, limit = 100) {
    const filter: any = {
      accountId: new Types.ObjectId(accountId),
      organizationId: new Types.ObjectId(organizationId),
      isReconciled: false,
      isDeleted: false,
    };

    return this.findAllPaginated(filter, page, limit);
  }

  /**
   * Find entries by reference
   */
  async findByReference(referenceNumber: string, organizationId: string) {
    return this.model
      .find({
        referenceNumber,
        organizationId: new Types.ObjectId(organizationId),
        isDeleted: false,
      })
      .lean()
      .exec();
  }

  /**
   * Find entries by counterparty
   */
  async findByCounterparty(
    counterpartyId: string,
    organizationId: string,
    page = 1,
    limit = 100,
  ) {
    const filter: any = {
      counterpartyId: new Types.ObjectId(counterpartyId),
      organizationId: new Types.ObjectId(organizationId),
      isDeleted: false,
    };

    return this.findAllPaginated(filter, page, limit);
  }

  /**
   * Get trial balance for organization
   */
  async getTrialBalance(
    organizationId: string,
    period?: string,
    branchId?: string | null,
  ): Promise<any[]> {
    const matchStage: any = {
      organizationId: new Types.ObjectId(organizationId),
      isDeleted: false,
    };

    if (period) {
      matchStage.period = period;
    }

    if (branchId) {
      matchStage.branchId = new Types.ObjectId(branchId);
    }

    const results = await this.glModel
      .aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$accountCode',
            accountId: { $first: '$accountId' },
            accountName: { $first: '$accountName' },
            totalDebit: { $sum: '$debit' },
            totalCredit: { $sum: '$credit' },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .exec();

    return results;
  }

  /**
   * Mark entries as reconciled
   */
  async markAsReconciled(entryIds: string[], reconciledAt: Date): Promise<void> {
    await this.glModel.updateMany(
      { _id: { $in: entryIds.map(id => new Types.ObjectId(id)) } },
      {
        isReconciled: true,
        reconciledAt,
        updatedAt: new Date(),
      },
    );
  }

  /**
   * Create GL entry from journal line item
   */
  async postJournalEntry(glData: any): Promise<GeneralLedgerDocument> {
    return (this as any).create(glData);
  }
}
