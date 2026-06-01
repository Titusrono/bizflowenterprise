import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository } from '../../common/repositories/base.repository';
import { Journal, JournalDocument } from '../schemas/journal.schema';

@Injectable()
export class JournalRepository extends BaseRepository<JournalDocument> {
  constructor(
    @InjectModel(Journal.name)
    private readonly journalModel: Model<JournalDocument>,
  ) {
    super(journalModel);
  }

  /**
   * Find by journal number
   */
  async findByJournalNumber(journalNumber: string): Promise<JournalDocument | null> {
    return this.model.findOne({ journalNumber, isDeleted: false }).lean().exec();
  }

  /**
   * Find journals by status and organization
   */
  async findByStatus(status: string, organizationId: string, branchId?: string | null, page = 1, limit = 50) {
    const filter: any = {
      status,
      organizationId: new Types.ObjectId(organizationId),
      isDeleted: false,
    };

    if (branchId) {
      filter.branchId = new Types.ObjectId(branchId);
    }

    return this.findAllPaginated(filter, page, limit);
  }

  /**
   * Find journals by type
   */
  async findByType(
    journalType: string,
    organizationId: string,
    branchId?: string | null,
    page = 1,
    limit = 50,
  ) {
    const filter: any = {
      journalType,
      organizationId: new Types.ObjectId(organizationId),
      isDeleted: false,
    };

    if (branchId) {
      filter.branchId = new Types.ObjectId(branchId);
    }

    return this.findAllPaginated(filter, page, limit);
  }

  /**
   * Find journals in date range
   */
  async findByDateRange(
    fromDate: Date,
    toDate: Date,
    organizationId: string,
    branchId?: string | null,
    page = 1,
    limit = 50,
  ) {
    const filter: any = {
      journalDate: {
        $gte: fromDate,
        $lte: toDate,
      },
      organizationId: new Types.ObjectId(organizationId),
      isDeleted: false,
    };

    if (branchId) {
      filter.branchId = new Types.ObjectId(branchId);
    }

    return this.findAllPaginated(filter, page, limit);
  }

  /**
   * Find by period
   */
  async findByPeriod(period: string, organizationId: string, branchId?: string | null, page = 1, limit = 50) {
    const filter: any = {
      period,
      organizationId: new Types.ObjectId(organizationId),
      isDeleted: false,
    };

    if (branchId) {
      filter.branchId = new Types.ObjectId(branchId);
    }

    return this.findAllPaginated(filter, page, limit);
  }

  /**
   * Find by reference number
   */
  async findByReference(referenceNumber: string, organizationId: string): Promise<JournalDocument[]> {
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
   * Find draft journals
   */
  async findDraftJournals(organizationId: string, branchId?: string | null) {
    const filter: any = {
      status: 'DRAFT',
      organizationId: new Types.ObjectId(organizationId),
      isDeleted: false,
    };

    if (branchId) {
      filter.branchId = new Types.ObjectId(branchId);
    }

    return this.model.find(filter).lean().exec();
  }

  /**
   * Generate next journal number
   */
  async generateNextJournalNumber(journalType: string, period: string): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const datePrefix = `${journalType}-${year}${month}`;

    const lastEntry = await this.model
      .findOne({ journalNumber: { $regex: `^${datePrefix}` } })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    let sequence = 1;
    if (lastEntry) {
      const match = lastEntry.journalNumber.match(/(\d{5})$/);
      if (match) {
        sequence = parseInt(match[1]) + 1;
      }
    }

    return `${datePrefix}-${String(sequence).padStart(5, '0')}`;
  }

  /**
   * Count posted journals by period
   */
  async countPostedByPeriod(period: string, organizationId: string): Promise<number> {
    return this.model.countDocuments({
      period,
      status: 'POSTED',
      organizationId: new Types.ObjectId(organizationId),
      isDeleted: false,
    });
  }

  /**
   * Update journal status
   */
  async updateStatus(journalId: string, status: string, postedAt?: Date, approvedBy?: string): Promise<void> {
    const updateData: any = { status, updatedAt: new Date() };
    if (postedAt) updateData.postedAt = postedAt;
    if (approvedBy) updateData.approvedBy = new Types.ObjectId(approvedBy);

    await this.model.updateOne(
      { _id: new Types.ObjectId(journalId), isDeleted: false },
      updateData,
    );
  }

  /**
   * Find entries by account for GL posting
   */
  async findByAccountCode(accountCode: string, organizationId: string, page = 1, limit = 100) {
    const filter: any = {
      'lineItems.accountCode': accountCode,
      status: 'POSTED',
      organizationId: new Types.ObjectId(organizationId),
      isDeleted: false,
    };

    return this.findAllPaginated(filter, page, limit);
  }
}
