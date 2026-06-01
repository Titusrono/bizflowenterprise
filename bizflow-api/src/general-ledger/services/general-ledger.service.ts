import { BadRequestException, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { BaseService } from '../../common/services/base.service';
import { GeneralLedgerRepository } from '../repositories/general-ledger.repository';
import { GeneralLedgerDocument } from '../schemas/general-ledger.schema';
import { GeneralLedgerQueryDto, AccountBalanceDto, TrialBalanceQueryDto } from '../dto/general-ledger.dto';

@Injectable()
export class GeneralLedgerService extends BaseService<GeneralLedgerDocument> {
  constructor(private readonly glRepository: GeneralLedgerRepository) {
    super(glRepository);
  }

  /**
   * Get GL entries for an account
   */
  async getAccountLedger(accountId: string, organizationId: string, page = 1, limit = 100) {
    if (!accountId) {
      throw new BadRequestException('accountId is required');
    }

    return this.glRepository.findByAccountId(accountId, organizationId, page, limit);
  }

  /**
   * Get GL entries in date range
   */
  async getLedgerByDateRange(
    accountId: string,
    fromDate: Date,
    toDate: Date,
    organizationId: string,
    page = 1,
    limit = 100,
  ) {
    if (!fromDate || !toDate) {
      throw new BadRequestException('fromDate and toDate are required');
    }

    return this.glRepository.findByDateRange(fromDate, toDate, accountId, organizationId, page, limit);
  }

  /**
   * Get GL entries by period
   */
  async getLedgerByPeriod(period: string, accountId: string, organizationId: string) {
    if (!period) {
      throw new BadRequestException('period is required');
    }

    return this.glRepository.findByPeriod(period, accountId, organizationId);
  }

  /**
   * Calculate account balance as of date
   */
  async getBalance(accountId: string, asOfDate: Date, organizationId: string): Promise<number> {
    return this.glRepository.calculateBalance(accountId, asOfDate, organizationId);
  }

  /**
   * Get current account balance
   */
  async getCurrentBalance(accountId: string, organizationId: string): Promise<number> {
    return this.glRepository.getCurrentBalance(accountId, organizationId);
  }

  /**
   * Get trial balance for organization
   */
  async getTrialBalance(
    organizationId: string,
    query: TrialBalanceQueryDto,
    branchId?: string | null,
  ): Promise<any> {
    const { period, asOfDate, accountType } = query;

    const trialBalance = await this.glRepository.getTrialBalance(organizationId, period, branchId);

    // Calculate totals
    const totals = trialBalance.reduce(
      (acc, row) => ({
        totalDebits: acc.totalDebits + (row.totalDebit || 0),
        totalCredits: acc.totalCredits + (row.totalCredit || 0),
        count: acc.count + 1,
      }),
      { totalDebits: 0, totalCredits: 0, count: 0 },
    );

    // Check if balanced
    const isBalanced = Math.abs(totals.totalDebits - totals.totalCredits) < 0.01;

    return {
      period,
      asOfDate: asOfDate || new Date(),
      accounts: trialBalance,
      totals,
      isBalanced,
      message: isBalanced
        ? 'Trial balance is correct'
        : `Trial balance difference: ${Math.abs(totals.totalDebits - totals.totalCredits)}`,
    };
  }

  /**
   * Get unreconciled entries
   */
  async getUnreconciledEntries(accountId: string, organizationId: string, page = 1, limit = 100) {
    return this.glRepository.findUnreconciledEntries(accountId, organizationId, page, limit);
  }

  /**
   * Reconcile entries
   */
  async reconcileEntries(entryIds: string[]): Promise<void> {
    if (!entryIds || entryIds.length === 0) {
      throw new BadRequestException('At least one entry must be selected for reconciliation');
    }

    await this.glRepository.markAsReconciled(entryIds, new Date());
  }

  /**
   * Get account totals by period
   */
  async getAccountTotalsByPeriod(
    accountId: string,
    period: string,
    organizationId: string,
  ): Promise<any> {
    const totals = await this.glRepository.getTotalsByPeriod(period, accountId, organizationId);
    const entries = await this.glRepository.findByPeriod(period, accountId, organizationId);

    return {
      period,
      accountId,
      entryCount: entries.length,
      ...totals,
    };
  }

  /**
   * Get entries by counterparty
   */
  async getCounterpartyLedger(
    counterpartyId: string,
    organizationId: string,
    page = 1,
    limit = 100,
  ) {
    return this.glRepository.findByCounterparty(counterpartyId, organizationId, page, limit);
  }

  /**
   * Get entries by reference
   */
  async getEntriesByReference(referenceNumber: string, organizationId: string) {
    return this.glRepository.findByReference(referenceNumber, organizationId);
  }

  /**
   * Generate GL Report (for export/analysis)
   */
  async generateGLReport(
    organizationId: string,
    query: TrialBalanceQueryDto,
    branchId?: string | null,
  ): Promise<any> {
    const trialBalance = await this.getTrialBalance(organizationId, query, branchId);

    return {
      reportDate: new Date(),
      reportType: 'General Ledger Trial Balance',
      organization: organizationId,
      branch: branchId,
      ...trialBalance,
      summary: {
        totalAccounts: trialBalance.accounts.length,
        totalDebits: trialBalance.totals.totalDebits,
        totalCredits: trialBalance.totals.totalCredits,
        isBalanced: trialBalance.isBalanced,
      },
    };
  }

  /**
   * Get account history (GL entries for specific account over time)
   */
  async getAccountHistory(
    accountId: string,
    organizationId: string,
    fromDate: Date,
    toDate: Date,
  ): Promise<any[]> {
    const entries = await this.glRepository.findByDateRange(fromDate, toDate, accountId, organizationId, 1, 1000);
    return entries.data;
  }

  /**
   * Calculate deferred revenue/expenses
   */
  async deferredAnalysis(
    fromDate: Date,
    toDate: Date,
    organizationId: string,
    accountTypes: number[] = [4, 5],
  ): Promise<any> {
    // This would be expanded based on business logic
    return {
      fromDate,
      toDate,
      organizationId,
      analysisType: 'Deferred Revenue/Expense',
      message: 'Analysis pending full specification',
    };
  }
}
