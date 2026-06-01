import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository } from '../../common/repositories/base.repository';
import { ChartOfAccount, ChartOfAccountDocument } from '../schemas/chart-of-account.schema';

@Injectable()
export class ChartOfAccountRepository extends BaseRepository<ChartOfAccountDocument> {
  constructor(
    @InjectModel(ChartOfAccount.name)
    private readonly coaModel: Model<ChartOfAccountDocument>,
  ) {
    super(coaModel);
  }

  /**
   * Find by account code
   */
  async findByAccountCode(accountCode: string, organizationId: string): Promise<ChartOfAccountDocument | null> {
    return this.model
      .findOne({
        accountCode,
        organizationId: new Types.ObjectId(organizationId),
        isDeleted: false,
      })
      .lean()
      .exec();
  }

  /**
   * Find all active accounts for organization
   */
  async findActiveAccounts(organizationId: string, branchId?: string | null, page = 1, limit = 50) {
    const filter: any = {
      organizationId: new Types.ObjectId(organizationId),
      isActive: true,
      isDeleted: false,
    };

    if (branchId) {
      filter.branchId = new Types.ObjectId(branchId);
    }

    return this.findAllPaginated(filter, page, limit);
  }

  /**
   * Find accounts by type
   */
  async findByAccountType(
    accountType: number,
    organizationId: string,
    branchId?: string | null,
    page = 1,
    limit = 50,
  ) {
    const filter: any = {
      accountType,
      organizationId: new Types.ObjectId(organizationId),
      isDeleted: false,
    };

    if (branchId) {
      filter.branchId = new Types.ObjectId(branchId);
    }

    return this.findAllPaginated(filter, page, limit);
  }

  /**
   * Find by parent code (hierarchical)
   */
  async findByParentCode(parentCode: string, organizationId: string) {
    return this.model
      .find({
        parentCode,
        organizationId: new Types.ObjectId(organizationId),
        isDeleted: false,
      })
      .lean()
      .exec();
  }

  /**
   * Find all header accounts
   */
  async findHeaderAccounts(organizationId: string) {
    return this.model
      .find({
        isHeader: true,
        organizationId: new Types.ObjectId(organizationId),
        isDeleted: false,
      })
      .lean()
      .exec();
  }

  /**
   * Get balance of an account as of date
   */
  async getAccountBalance(accountId: string, asOfDate?: Date): Promise<number> {
    const account = await this.model
      .findOne({
        _id: new Types.ObjectId(accountId),
        isDeleted: false,
      })
      .lean()
      .exec();

    if (!account) return 0;

    // If no specific date, return current balance
    if (!asOfDate) {
      return account.currentBalance || 0;
    }

    // For historical balance, would need to query GL
    // This is a simplified version
    return account.currentBalance || 0;
  }

  /**
   * Update account balance
   */
  async updateBalance(accountId: string, newBalance: number): Promise<void> {
    await this.model.updateOne(
      { _id: new Types.ObjectId(accountId), isDeleted: false },
      { currentBalance: newBalance, updatedAt: new Date() },
    );
  }

  /**
   * Find posting accounts (non-header)
   */
  async findPostingAccounts(organizationId: string, branchId?: string | null) {
    const filter: any = {
      organizationId: new Types.ObjectId(organizationId),
      isHeader: false,
      isActive: true,
      isDeleted: false,
    };

    if (branchId) {
      filter.branchId = new Types.ObjectId(branchId);
    }

    return this.model.find(filter).lean().exec();
  }

  /**
   * Deactivate account
   */
  async deactivateAccount(accountId: string): Promise<void> {
    await this.model.updateOne(
      { _id: new Types.ObjectId(accountId), isDeleted: false },
      { isActive: false, updatedAt: new Date() },
    );
  }

  /**
   * Check if account can be deleted
   */
  async canDelete(accountId: string): Promise<boolean> {
    const account = await this.findById(accountId);
    return account?.allowDelete === true && account?.isSystem !== true;
  }
}
