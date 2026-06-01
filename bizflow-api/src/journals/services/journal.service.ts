import { BadRequestException, Injectable, ConflictException } from '@nestjs/common';
import { Types } from 'mongoose';
import { BaseService } from '../../common/services/base.service';
import {
  CreateJournalDto,
  UpdateJournalDto,
  PostJournalDto,
  JournalQueryDto,
} from '../dto/journal.dto';
import { JournalRepository } from '../repositories/journal.repository';
import { ChartOfAccountRepository } from '../../chart-of-accounts/repositories/chart-of-account.repository';
import { GeneralLedgerRepository } from '../../general-ledger/repositories/general-ledger.repository';
import { JournalDocument } from '../schemas/journal.schema';

@Injectable()
export class JournalService extends BaseService<JournalDocument> {
  constructor(
    private readonly journalRepository: JournalRepository,
    private readonly coaRepository: ChartOfAccountRepository,
    private readonly glRepository: GeneralLedgerRepository,
  ) {
    super(journalRepository);
  }

  /**
   * Create a new journal entry
   */
  async createJournal(
    createDto: CreateJournalDto,
    userId?: string,
    organizationId?: string,
  ): Promise<JournalDocument> {
    const orgId = createDto.organizationId || organizationId;
    if (!orgId) {
      throw new BadRequestException('organizationId is required');
    }

    // Validate that debits equal credits
    const totalDebit = createDto.lineItems.reduce((sum, item) => sum + (item.debit || 0), 0);
    const totalCredit = createDto.lineItems.reduce((sum, item) => sum + (item.credit || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new BadRequestException('Journal entry must balance: debits must equal credits');
    }

    if (totalDebit === 0 && totalCredit === 0) {
      throw new BadRequestException('Journal entry must have at least one debit and one credit');
    }

    // Generate journal number
    const journalNumber = await this.journalRepository.generateNextJournalNumber(
      createDto.journalType,
      createDto.period || this.generatePeriod(),
    );

    // Validate all accounts exist and are active
    for (const lineItem of createDto.lineItems) {
      const account = await this.coaRepository.findByAccountCode(lineItem.accountCode, orgId);
      if (!account) {
        throw new BadRequestException(`Account code ${lineItem.accountCode} not found`);
      }
      if (!account.isActive) {
        throw new BadRequestException(`Account ${lineItem.accountCode} is not active for posting`);
      }
    }

    const journalData = {
      ...createDto,
      journalNumber,
      totalDebit,
      totalCredit,
      status: 'DRAFT',
      period: createDto.period || this.generatePeriod(),
      fiscalYear: new Date().getFullYear(),
      organizationId: new Types.ObjectId(orgId),
      branchId: createDto.branchId ? new Types.ObjectId(createDto.branchId) : null,
      currency: createDto.currency || 'USD',
      approvalStatus: 'PENDING',
      lineItems: createDto.lineItems.map(item => ({
        ...item,
        narration: item.narration || '',
        accountId: new Types.ObjectId(item.accountId),
      })),
    };

    if ((journalData as any)._id !== undefined) {
      delete (journalData as any)._id;
    }

    return this.journalRepository.create(journalData, userId);
  }

  /**
   * Update journal entry (only if DRAFT)
   */
  async updateJournal(
    journalId: string,
    updateDto: UpdateJournalDto,
    userId?: string,
  ): Promise<JournalDocument> {
    const journal = await this.journalRepository.findById(journalId);
    if (!journal) {
      throw new BadRequestException('Journal entry not found');
    }

    if (journal.status !== 'DRAFT') {
      throw new BadRequestException('Only draft journal entries can be updated');
    }

    // If updating line items, validate balance
    if (updateDto.lineItems) {
      const totalDebit = updateDto.lineItems.reduce((sum, item) => sum + (item.debit || 0), 0);
      const totalCredit = updateDto.lineItems.reduce((sum, item) => sum + (item.credit || 0), 0);

      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        throw new BadRequestException('Journal entry must balance: debits must equal credits');
      }

      updateDto['totalDebit'] = totalDebit;
      updateDto['totalCredit'] = totalCredit;
    }

    return this.journalRepository.updateById(journalId, updateDto, userId);
  }

  /**
   * Post journal to general ledger
   */
  async postJournal(journalId: string, userId?: string): Promise<JournalDocument> {
    const journal = await this.journalRepository.findById(journalId);
    if (!journal) {
      throw new BadRequestException('Journal entry not found');
    }

    if (journal.status !== 'DRAFT') {
      throw new BadRequestException('Only draft journal entries can be posted');
    }

    // Create GL entries for each line item
    for (const lineItem of journal.lineItems) {
      const account = await this.coaRepository.findByAccountCode(lineItem.accountCode, journal.organizationId.toString());
      if (!account) {
        throw new BadRequestException(`Account ${lineItem.accountCode} not found`);
      }

      // Calculate running balance
      const currentBalance = await this.glRepository.getCurrentBalance(
        account._id.toString(),
        journal.organizationId.toString(),
      );

      let newBalance = currentBalance;
      if (account.normalBalance === 'Debit') {
        newBalance += lineItem.debit - lineItem.credit;
      } else {
        newBalance += lineItem.credit - lineItem.debit;
      }

      const glEntry = {
        accountId: account._id,
        accountCode: lineItem.accountCode,
        accountName: account.name,
        journalId: new Types.ObjectId(journalId),
        journalNumber: journal.journalNumber,
        debit: lineItem.debit,
        credit: lineItem.credit,
        balance: newBalance,
        balanceType: newBalance >= 0 ? account.normalBalance : (account.normalBalance === 'Debit' ? 'Credit' : 'Debit'),
        entryDate: journal.journalDate,
        period: journal.period,
        fiscalYear: journal.fiscalYear,
        narration: lineItem.narration || journal.narration,
        referenceNumber: journal.referenceNumber,
        referenceType: journal.referenceType,
        currency: journal.currency,
        organizationId: journal.organizationId,
        branchId: journal.branchId,
        metadata: { journalType: journal.journalType },
      };

      await this.glRepository.postJournalEntry(glEntry);

      // Update account balance
      await this.coaRepository.updateBalance(account._id.toString(), newBalance);
    }

    // Mark journal as posted
    await this.journalRepository.updateStatus(journalId, 'POSTED', new Date(), userId);

    return this.journalRepository.findById(journalId);
  }

  /**
   * Get journals by organization
   */
  async getJournals(
    organizationId: string,
    query: JournalQueryDto,
    branchId?: string | null,
  ) {
    const { page = 1, limit = 50, journalType, status, period, fromDate, toDate } = query;

    if (period) {
      return this.journalRepository.findByPeriod(period, organizationId, branchId, page, limit);
    }

    if (fromDate && toDate) {
      return this.journalRepository.findByDateRange(fromDate, toDate, organizationId, branchId, page, limit);
    }

    if (status) {
      return this.journalRepository.findByStatus(status, organizationId, branchId, page, limit);
    }

    if (journalType) {
      return this.journalRepository.findByType(journalType, organizationId, branchId, page, limit);
    }

    // Default: return all journals
    return this.journalRepository.findByStatus('POSTED', organizationId, branchId, page, limit);
  }

  /**
   * Reverse journal entry
   */
  async reverseJournal(journalId: string, userId?: string): Promise<JournalDocument> {
    const originalJournal = await this.journalRepository.findById(journalId);
    if (!originalJournal) {
      throw new BadRequestException('Journal entry not found');
    }

    if (originalJournal.status !== 'POSTED') {
      throw new BadRequestException('Only posted journal entries can be reversed');
    }

    // Create reversing entry
    const reversingLineItems = originalJournal.lineItems.map(item => ({
      ...item,
      debit: item.credit,
      credit: item.debit,
    }));

    const reversalJournalNumber = await this.journalRepository.generateNextJournalNumber(
      originalJournal.journalType,
      originalJournal.period,
    );

    const reversingEntry = {
      journalNumber: reversalJournalNumber,
      journalType: originalJournal.journalType,
      journalDate: new Date(),
      referenceNumber: `REV-${originalJournal.journalNumber}`,
      referenceType: 'REVERSAL',
      narration: `Reversal of ${originalJournal.journalNumber}`,
      lineItems: reversingLineItems,
      totalDebit: originalJournal.totalCredit,
      totalCredit: originalJournal.totalDebit,
      status: 'POSTED',
      postedAt: new Date(),
      period: originalJournal.period,
      fiscalYear: originalJournal.fiscalYear,
      organizationId: originalJournal.organizationId,
      branchId: originalJournal.branchId,
      isReversing: true,
      reversingEntryId: new Types.ObjectId(journalId),
      currency: originalJournal.currency,
    };

    // Create reversing journal
    const reversalJournal = await this.journalRepository.create(reversingEntry, userId);

    // Mark original as reversed
    await this.journalRepository.updateStatus(journalId, 'REVERSED');

    // Post the reversing entry
    await this.postJournal(reversalJournal._id.toString(), userId);

    return reversalJournal;
  }

  /**
   * Helper: Generate period string (YYYY-MM)
   */
  private generatePeriod(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }
}
