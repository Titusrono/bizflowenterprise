import { Injectable, Logger } from '@nestjs/common';
import { ChartOfAccountRepository } from '../repositories/chart-of-account.repository';
import { Types } from 'mongoose';

/**
 * Chart of Accounts Seeder Service
 * Seeds standard Chart of Accounts based on common accounting practices
 * Uses a hierarchical structure with main accounts and sub-accounts
 */
@Injectable()
export class ChartOfAccountSeederService {
  private readonly logger = new Logger(ChartOfAccountSeederService.name);

  constructor(private readonly coaRepository: ChartOfAccountRepository) {}

  /**
   * Standard Chart of Accounts based on accounting standards
   * Account Type: 1=Asset, 2=Liability, 3=Equity, 4=Revenue, 5=Expense, 6=Contra
   */
  private readonly defaultAccounts = [
    // ============ ASSETS (Type: 1) ============
    // Current Assets
    {
      accountCode: '1000',
      name: 'CURRENT ASSETS',
      accountType: 1,
      subCategory: 'Current Asset',
      normalBalance: 'Debit',
      isHeader: true,
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '1010',
      name: 'Cash in Bank',
      accountType: 1,
      subCategory: 'Current Asset',
      normalBalance: 'Debit',
      parentCode: '1000',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '1020',
      name: 'Petty Cash',
      accountType: 1,
      subCategory: 'Current Asset',
      normalBalance: 'Debit',
      parentCode: '1000',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '1030',
      name: 'Accounts Receivable',
      accountType: 1,
      subCategory: 'Current Asset',
      normalBalance: 'Debit',
      parentCode: '1000',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '1035',
      name: 'Allowance for Doubtful Debts',
      accountType: 6,
      subCategory: 'Contra Account',
      normalBalance: 'Credit',
      parentCode: '1000',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '1040',
      name: 'Inventory',
      accountType: 1,
      subCategory: 'Current Asset',
      normalBalance: 'Debit',
      parentCode: '1000',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '1050',
      name: 'Prepaid Expenses',
      accountType: 1,
      subCategory: 'Current Asset',
      normalBalance: 'Debit',
      parentCode: '1000',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },

    // Fixed Assets
    {
      accountCode: '1500',
      name: 'FIXED ASSETS',
      accountType: 1,
      subCategory: 'Fixed Asset',
      normalBalance: 'Debit',
      isHeader: true,
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '1510',
      name: 'Property & Buildings',
      accountType: 1,
      subCategory: 'Fixed Asset',
      normalBalance: 'Debit',
      parentCode: '1500',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '1520',
      name: 'Plant & Machinery',
      accountType: 1,
      subCategory: 'Fixed Asset',
      normalBalance: 'Debit',
      parentCode: '1500',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '1530',
      name: 'Vehicles',
      accountType: 1,
      subCategory: 'Fixed Asset',
      normalBalance: 'Debit',
      parentCode: '1500',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '1540',
      name: 'Office Equipment',
      accountType: 1,
      subCategory: 'Fixed Asset',
      normalBalance: 'Debit',
      parentCode: '1500',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '1550',
      name: 'Accumulated Depreciation',
      accountType: 6,
      subCategory: 'Contra Account',
      normalBalance: 'Credit',
      parentCode: '1500',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },

    // ============ LIABILITIES (Type: 2) ============
    // Current Liabilities
    {
      accountCode: '2000',
      name: 'CURRENT LIABILITIES',
      accountType: 2,
      subCategory: 'Current Liability',
      normalBalance: 'Credit',
      isHeader: true,
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '2010',
      name: 'Accounts Payable',
      accountType: 2,
      subCategory: 'Current Liability',
      normalBalance: 'Credit',
      parentCode: '2000',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '2020',
      name: 'Short-term Loan',
      accountType: 2,
      subCategory: 'Current Liability',
      normalBalance: 'Credit',
      parentCode: '2000',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '2030',
      name: 'Employee Payables',
      accountType: 2,
      subCategory: 'Current Liability',
      normalBalance: 'Credit',
      parentCode: '2000',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '2040',
      name: 'Accrued Expenses',
      accountType: 2,
      subCategory: 'Current Liability',
      normalBalance: 'Credit',
      parentCode: '2000',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '2050',
      name: 'GST/VAT Payable',
      accountType: 2,
      subCategory: 'Current Liability',
      normalBalance: 'Credit',
      parentCode: '2000',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },

    // Long-term Liabilities
    {
      accountCode: '2500',
      name: 'LONG-TERM LIABILITIES',
      accountType: 2,
      subCategory: 'Long-term Liability',
      normalBalance: 'Credit',
      isHeader: true,
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '2510',
      name: 'Long-term Loan',
      accountType: 2,
      subCategory: 'Long-term Liability',
      normalBalance: 'Credit',
      parentCode: '2500',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '2520',
      name: 'Deferred Tax Liability',
      accountType: 2,
      subCategory: 'Long-term Liability',
      normalBalance: 'Credit',
      parentCode: '2500',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },

    // ============ EQUITY (Type: 3) ============
    {
      accountCode: '3000',
      name: 'EQUITY/CAPITAL',
      accountType: 3,
      subCategory: 'Equity',
      normalBalance: 'Credit',
      isHeader: true,
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '3010',
      name: 'Capital/Owner Equity',
      accountType: 3,
      subCategory: 'Equity',
      normalBalance: 'Credit',
      parentCode: '3000',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '3020',
      name: 'Retained Earnings',
      accountType: 3,
      subCategory: 'Equity',
      normalBalance: 'Credit',
      parentCode: '3000',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '3030',
      name: 'Profit/Loss for Period',
      accountType: 3,
      subCategory: 'Equity',
      normalBalance: 'Credit',
      parentCode: '3000',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },

    // ============ REVENUE (Type: 4) ============
    {
      accountCode: '4000',
      name: 'REVENUE',
      accountType: 4,
      subCategory: 'Revenue',
      normalBalance: 'Credit',
      isHeader: true,
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '4010',
      name: 'Sales - Cash',
      accountType: 4,
      subCategory: 'Revenue',
      normalBalance: 'Credit',
      parentCode: '4000',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '4020',
      name: 'Sales - Credit',
      accountType: 4,
      subCategory: 'Revenue',
      normalBalance: 'Credit',
      parentCode: '4000',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '4030',
      name: 'Service Revenue',
      accountType: 4,
      subCategory: 'Revenue',
      normalBalance: 'Credit',
      parentCode: '4000',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '4040',
      name: 'Rental Income',
      accountType: 4,
      subCategory: 'Revenue',
      normalBalance: 'Credit',
      parentCode: '4000',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '4050',
      name: 'Interest Income',
      accountType: 4,
      subCategory: 'Revenue',
      normalBalance: 'Credit',
      parentCode: '4000',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },

    // ============ EXPENSES (Type: 5) ============
    // Cost of Goods Sold
    {
      accountCode: '5000',
      name: 'COST OF GOODS SOLD',
      accountType: 5,
      subCategory: 'COGS',
      normalBalance: 'Debit',
      isHeader: true,
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '5010',
      name: 'Opening Inventory',
      accountType: 5,
      subCategory: 'COGS',
      normalBalance: 'Debit',
      parentCode: '5000',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '5020',
      name: 'Purchases',
      accountType: 5,
      subCategory: 'COGS',
      normalBalance: 'Debit',
      parentCode: '5000',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '5030',
      name: 'Purchase Returns',
      accountType: 6,
      subCategory: 'Contra Account',
      normalBalance: 'Credit',
      parentCode: '5000',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '5040',
      name: 'Freight & Cartage',
      accountType: 5,
      subCategory: 'COGS',
      normalBalance: 'Debit',
      parentCode: '5000',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '5050',
      name: 'Closing Inventory',
      accountType: 6,
      subCategory: 'Contra Account',
      normalBalance: 'Credit',
      parentCode: '5000',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },

    // Operating Expenses
    {
      accountCode: '5500',
      name: 'OPERATING EXPENSES',
      accountType: 5,
      subCategory: 'Operating Expense',
      normalBalance: 'Debit',
      isHeader: true,
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '5510',
      name: 'Salaries & Wages',
      accountType: 5,
      subCategory: 'Operating Expense',
      normalBalance: 'Debit',
      parentCode: '5500',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '5520',
      name: 'Rent Expense',
      accountType: 5,
      subCategory: 'Operating Expense',
      normalBalance: 'Debit',
      parentCode: '5500',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '5530',
      name: 'Utilities Expense',
      accountType: 5,
      subCategory: 'Operating Expense',
      normalBalance: 'Debit',
      parentCode: '5500',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '5540',
      name: 'Depreciation Expense',
      accountType: 5,
      subCategory: 'Operating Expense',
      normalBalance: 'Debit',
      parentCode: '5500',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '5550',
      name: 'Office Supplies',
      accountType: 5,
      subCategory: 'Operating Expense',
      normalBalance: 'Debit',
      parentCode: '5500',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '5560',
      name: 'Marketing & Advertising',
      accountType: 5,
      subCategory: 'Operating Expense',
      normalBalance: 'Debit',
      parentCode: '5500',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '5570',
      name: 'Professional Fees',
      accountType: 5,
      subCategory: 'Operating Expense',
      normalBalance: 'Debit',
      parentCode: '5500',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '5580',
      name: 'Insurance Expense',
      accountType: 5,
      subCategory: 'Operating Expense',
      normalBalance: 'Debit',
      parentCode: '5500',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '5590',
      name: 'Travel Expense',
      accountType: 5,
      subCategory: 'Operating Expense',
      normalBalance: 'Debit',
      parentCode: '5500',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },

    // Tax & Other Expenses
    {
      accountCode: '5900',
      name: 'TAX EXPENSES',
      accountType: 5,
      subCategory: 'Tax Expense',
      normalBalance: 'Debit',
      isHeader: true,
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '5910',
      name: 'Income Tax Expense',
      accountType: 5,
      subCategory: 'Tax Expense',
      normalBalance: 'Debit',
      parentCode: '5900',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '5920',
      name: 'Sales Tax/GST Expense',
      accountType: 5,
      subCategory: 'Tax Expense',
      normalBalance: 'Debit',
      parentCode: '5900',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
    {
      accountCode: '5930',
      name: 'Interest Expense',
      accountType: 5,
      subCategory: 'Financial Expense',
      normalBalance: 'Debit',
      parentCode: '5900',
      isActive: true,
      isSystem: true,
      allowDelete: false,
    },
  ];

  /**
   * Seed default Chart of Accounts for an organization
   */
  async seedChartOfAccounts(
    organizationId: string,
    branchId?: string | null,
  ): Promise<any> {
    try {
      this.logger.log(`[SEED] ========== STARTING SEED ==========`);
      this.logger.log(`[SEED] Org: ${organizationId}, Branch: ${branchId}`);
      
      const orgObjectId = new Types.ObjectId(organizationId);
      const branchObjectId = branchId ? new Types.ObjectId(branchId) : null;

      // Check if already seeded
      this.logger.log(`[SEED] Checking for existing seeded accounts...`);
      const existing = await this.coaRepository.findOne({
        organizationId: orgObjectId,
        isSystem: true,
      });

      this.logger.log(`[SEED] Existing check result: ${existing ? 'FOUND' : 'NOT FOUND'}`);
      if (existing) {
        this.logger.log(
          `[SEED] Already seeded for organization ${organizationId}, returning early`,
        );
        return { message: 'Chart of Accounts already seeded', count: 0 };
      }

      let successCount = 0;
      const errors = [];

      this.logger.log(`[SEED] Processing ${this.defaultAccounts.length} accounts...`);

      for (const account of this.defaultAccounts) {
        try {
          const accountData = {
            ...account,
            organizationId: orgObjectId,
            branchId: branchObjectId,
            isOrganizationWide: !branchId,
            openingBalance: 0,
            currentBalance: 0,
          };

          const created = await this.coaRepository.create(accountData);
          
          if (!created || !created._id) {
            this.logger.error(
              `[SEED] Account ${account.accountCode} create returned no ID: ${JSON.stringify(created)}`,
            );
            throw new Error('Create operation did not return a valid document');
          }
          
          successCount++;
          
          if (successCount % 10 === 0) {
            this.logger.debug(`[SEED] Created ${successCount} accounts so far...`);
          }
        } catch (error) {
          errors.push({
            accountCode: account.accountCode,
            name: account.name,
            error: error.message,
          });
          this.logger.error(
            `Error seeding account ${account.accountCode}: ${error.message}`,
          );
        }
      }

      this.logger.log(
        `[SEED] Successfully seeded ${successCount} accounts for organization ${organizationId}`,
      );

      // Verify seeded accounts are actually in the database
      const verifyCount = await this.coaRepository.findAll({
        organizationId: orgObjectId,
      });
      this.logger.log(`[SEED] Verification - Found ${verifyCount.length} accounts in database`);

      if (verifyCount.length === 0 && successCount > 0) {
        this.logger.error(`[SEED] CRITICAL: Seeded ${successCount} accounts but found 0 in database!`);
      }

      return {
        message: 'Chart of Accounts seeded successfully',
        count: successCount,
        totalAccounts: this.defaultAccounts.length,
        errors: errors.length > 0 ? errors : null,
      };
    } catch (error) {
      this.logger.error(`Seeding failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get sample accounts without seeding
   */
  getSampleAccounts(): any[] {
    return this.defaultAccounts;
  }

  /**
   * Get accounts by type (for reference)
   */
  getAccountsByType(accountType: number): any[] {
    return this.defaultAccounts.filter(acc => acc.accountType === accountType);
  }
}
