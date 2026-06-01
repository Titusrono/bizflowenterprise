import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { BaseService } from '../../common/services/base.service';
import {
  CreateChartOfAccountDto,
  ChartOfAccountQueryDto,
  UpdateChartOfAccountDto,
} from '../dto/chart-of-account.dto';
import { ChartOfAccountRepository } from '../repositories/chart-of-account.repository';
import { ChartOfAccountDocument } from '../schemas/chart-of-account.schema';
import { ChartOfAccountSeederService } from '../seeders/chart-of-account.seeder';

@Injectable()
export class ChartOfAccountService extends BaseService<ChartOfAccountDocument> {
  constructor(
    private readonly coaRepository: ChartOfAccountRepository,
    private readonly seederService: ChartOfAccountSeederService,
  ) {
    super(coaRepository);
  }

  /**
   * Create a new Chart of Account entry
   */
  async createAccount(
    createDto: CreateChartOfAccountDto,
    userId?: string,
    organizationId?: string,
  ): Promise<ChartOfAccountDocument> {
    const orgId = createDto.organizationId || organizationId;
    if (!orgId) {
      throw new BadRequestException('organizationId is required');
    }

    // Validate that account code doesn't exist
    const existing = await this.coaRepository.findByAccountCode(createDto.accountCode, orgId);
    if (existing) {
      throw new ConflictException('Account code already exists in this organization');
    }

    // Validate debit/credit alignment
    if (
      (createDto.accountType === 1 && createDto.normalBalance !== 'Debit') ||
      (createDto.accountType === 2 && createDto.normalBalance !== 'Credit') ||
      (createDto.accountType === 3 && createDto.normalBalance !== 'Credit') ||
      (createDto.accountType === 4 && createDto.normalBalance !== 'Credit') ||
      (createDto.accountType === 5 && createDto.normalBalance !== 'Debit')
    ) {
      throw new BadRequestException('Invalid normal balance for account type');
    }

    const accountTypeNames = ['', 'Asset', 'Liability', 'Equity', 'Revenue', 'Expense', 'Contra'];
    const accountData = {
      ...createDto,
      accountTypeName: accountTypeNames[createDto.accountType],
      organizationId: new Types.ObjectId(orgId),
      branchId: createDto.branchId ? new Types.ObjectId(createDto.branchId) : null,
      currentBalance: createDto.openingBalance || 0,
    };

    if ((accountData as any)._id !== undefined) {
      delete (accountData as any)._id;
    }

    return this.coaRepository.create(accountData, userId);
  }

  /**
   * Update Chart of Account
   */
  async updateAccount(
    accountId: string,
    updateDto: UpdateChartOfAccountDto,
    currentUserId?: string,
  ): Promise<ChartOfAccountDocument> {
    const account = await this.coaRepository.findById(accountId);
    if (!account) {
      throw new BadRequestException('Account not found');
    }

    return this.coaRepository.updateById(accountId, updateDto, currentUserId);
  }

  /**
   * Get all accounts with filtering
   */
  async getAccounts(
    organizationId: string,
    query: ChartOfAccountQueryDto,
    branchId?: string | null,
  ) {
    const { page = 1, limit = 50, accountType, accountCode, subCategory, isActive } = query;

    let filter: any = {
      organizationId: new Types.ObjectId(organizationId),
      isDeleted: false,
    };

    if (branchId) {
      filter.branchId = new Types.ObjectId(branchId);
    }

    if (accountType !== undefined) {
      filter.accountType = accountType;
    }

    if (accountCode) {
      filter.accountCode = new RegExp(accountCode, 'i');
    }

    if (subCategory) {
      filter.subCategory = subCategory;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    return this.coaRepository.findAllPaginated(filter, page, limit);
  }

  /**
   * Get account by code
   */
  async getAccountByCode(accountCode: string, organizationId: string): Promise<ChartOfAccountDocument> {
    const account = await this.coaRepository.findByAccountCode(accountCode, organizationId);
    if (!account) {
      throw new BadRequestException('Account not found');
    }
    return account;
  }

  /**
   * Get account balance
   */
  async getAccountBalance(accountId: string): Promise<number> {
    return this.coaRepository.getAccountBalance(accountId);
  }

  /**
   * Deactivate account
   */
  async deactivateAccount(accountId: string): Promise<void> {
    const account = await this.coaRepository.findById(accountId);
    if (!account) {
      throw new BadRequestException('Account not found');
    }

    await this.coaRepository.deactivateAccount(accountId);
  }

  /**
   * Delete account
   */
  async deleteAccount(accountId: string, userId?: string): Promise<void> {
    const canDelete = await this.coaRepository.canDelete(accountId);
    if (!canDelete) {
      throw new BadRequestException('This account cannot be deleted');
    }

    await this.coaRepository.softDelete(accountId, userId);
  }

  /**
   * Get all header accounts
   */
  async getHeaderAccounts(organizationId: string) {
    return this.coaRepository.findHeaderAccounts(organizationId);
  }

  /**
   * Get accounts by type
   */
  async getAccountsByType(
    accountType: number,
    organizationId: string,
    branchId?: string | null,
    page = 1,
    limit = 50,
  ) {
    return this.coaRepository.findByAccountType(accountType, organizationId, branchId, page, limit);
  }

  /**
   * Get active accounts for posting
   */
  async getActiveAccounts(organizationId: string, branchId?: string | null) {
    return this.coaRepository.findActiveAccounts(organizationId, branchId);
  }

  /**
   * Seed default Chart of Accounts for organization
   * This should be called from the backend only, handles all accounting standards
   */
  async seedChartOfAccounts(
    organizationId: string,
    branchId?: string | null,
  ): Promise<any> {
    return this.seederService.seedChartOfAccounts(organizationId, branchId);
  }
}
