# Accounting Module Integration Guide

## Overview

This guide explains how to integrate the Accounting Module with existing BizFlow Enterprise modules (Sales, Purchases, Bills, Inventory, Expenses) to create automatic journal entries and maintain complete financial records.

## Integration Architecture

```
Sales Module ──→ Journal Creation → GL Posting
Purchases     ──→ Journal Creation → GL Posting
Bills         ──→ Journal Creation → GL Posting
Inventory     ──→ Journal Creation → GL Posting
Expenses      ──→ Journal Creation → GL Posting
Payments      ──→ Journal Creation → GL Posting
```

## Sales Module Integration

### On Invoice Creation

**Accounts Involved**:
- DR: 1030 (Accounts Receivable)
- CR: 4010 (Sales Revenue)

**Implementation**:

```typescript
// sales.service.ts
import { AccountingService } from '../accounting/services/accounting.service';

constructor(
  private accountingService: AccountingService,
  private journalRepository: JournalRepository
) {}

async createSalesInvoice(invoiceData: any): Promise<any> {
  // Create invoice
  const invoice = await this.repository.create(invoiceData);

  // Create journal entry
  const journalEntry = {
    journalType: 'SJ',  // Sales Journal
    journalDate: new Date(),
    referenceNumber: invoice.invoiceNumber,
    referenceType: 'SALES_INVOICE',
    narration: `Sales invoice ${invoice.invoiceNumber} for ${invoice.customerName}`,
    lineItems: [
      {
        accountCode: '1030',  // A/R
        accountName: 'Accounts Receivable',
        accountId: arAccountId,
        debit: invoice.totalAmount,
        credit: 0
      },
      {
        accountCode: '4010',  // Sales Revenue
        accountName: 'Sales Revenue',
        accountId: revenueAccountId,
        debit: 0,
        credit: invoice.totalAmount
      }
    ],
    period: this.getPeriod()
  };

  // Create and post journal
  const journal = await this.journalRepository.create(journalEntry);
  await this.accountingService.postJournal(journal._id.toString());

  return invoice;
}
```

### On Payment Received

**Accounts Involved**:
- DR: 1010 (Cash in Bank)
- CR: 1030 (Accounts Receivable)

```typescript
async recordPaymentReceived(paymentData: any): Promise<void> {
  const journalEntry = {
    journalType: 'CRJ',  // Cash Receipt Journal
    journalDate: new Date(),
    referenceNumber: paymentData.paymentId,
    referenceType: 'PAYMENT_RECEIVED',
    narration: `Payment received for invoice ${paymentData.invoiceNumber}`,
    lineItems: [
      {
        accountCode: '1010',  // Cash
        debit: paymentData.amount,
        credit: 0
      },
      {
        accountCode: '1030',  // A/R
        debit: 0,
        credit: paymentData.amount
      }
    ]
  };

  const journal = await this.journalRepository.create(journalEntry);
  await this.accountingService.postJournal(journal._id.toString());
}
```

## Purchases Module Integration

### On Purchase Order/Bill Creation

**Accounts Involved**:
- DR: 5020 (Purchases)
- CR: 2010 (Accounts Payable)

```typescript
// purchases.service.ts
async createPurchaseOrder(poData: any): Promise<any> {
  const po = await this.repository.create(poData);

  const journalEntry = {
    journalType: 'PJ',  // Purchase Journal
    journalDate: new Date(),
    referenceNumber: po.poNumber,
    referenceType: 'PURCHASE_ORDER',
    narration: `Purchase order ${po.poNumber} from ${po.supplierName}`,
    lineItems: [
      {
        accountCode: '5020',  // Purchases
        debit: po.totalAmount,
        credit: 0
      },
      {
        accountCode: '2010',  // A/P
        debit: 0,
        credit: po.totalAmount
      }
    ]
  };

  const journal = await this.journalRepository.create(journalEntry);
  await this.accountingService.postJournal(journal._id.toString());

  return po;
}
```

### On Payment Made

**Accounts Involved**:
- DR: 2010 (Accounts Payable)
- CR: 1010 (Cash in Bank)

```typescript
async recordPaymentMade(paymentData: any): Promise<void> {
  const journalEntry = {
    journalType: 'CPJ',  // Cash Payment Journal
    journalDate: new Date(),
    referenceNumber: paymentData.paymentId,
    referenceType: 'PAYMENT_MADE',
    narration: `Payment made for PO ${paymentData.poNumber}`,
    lineItems: [
      {
        accountCode: '2010',  // A/P
        debit: paymentData.amount,
        credit: 0
      },
      {
        accountCode: '1010',  // Cash
        debit: 0,
        credit: paymentData.amount
      }
    ]
  };

  const journal = await this.journalRepository.create(journalEntry);
  await this.accountingService.postJournal(journal._id.toString());
}
```

## Bills Module Integration

### On Bill Entry

**Accounts Involved**:
- DR: Various Expense Accounts (5510-5590)
- CR: 2010 (Accounts Payable)

```typescript
// bills.service.ts
async createBill(billData: any): Promise<any> {
  const bill = await this.repository.create(billData);

  // Determine expense account based on bill type
  const expenseAccountCode = this.getExpenseAccountCode(bill.billType);

  const journalEntry = {
    journalType: 'GL',
    journalDate: new Date(),
    referenceNumber: bill.billNumber,
    referenceType: 'BILL',
    narration: `${bill.billType} bill from ${bill.vendorName}`,
    lineItems: [
      {
        accountCode: expenseAccountCode,  // Salary, Rent, etc.
        debit: bill.amount,
        credit: 0
      },
      {
        accountCode: '2010',  // A/P
        debit: 0,
        credit: bill.amount
      }
    ]
  };

  const journal = await this.journalRepository.create(journalEntry);
  await this.accountingService.postJournal(journal._id.toString());

  return bill;
}

private getExpenseAccountCode(billType: string): string {
  const mapping = {
    'SALARY': '5510',     // Salaries & Wages
    'RENT': '5520',       // Rent Expense
    'UTILITIES': '5530',  // Utilities
    'MARKETING': '5560',  // Marketing & Advertising
    'INSURANCE': '5580',  // Insurance
    'TRAVEL': '5590'      // Travel Expense
  };
  return mapping[billType] || '5500';
}
```

## Inventory Module Integration

### On Stock Adjustment/Purchase

**For Inventory Purchase**:
- DR: 1040 (Inventory)
- CR: 2010 (Accounts Payable) or 1010 (Cash)

**For Stock Adjustment**:
- DR/CR: 1040 (Inventory)
- CR/DR: 5050 (Closing Inventory - Contra)

```typescript
// inventory.service.ts
async adjustStock(adjustmentData: any): Promise<any> {
  const inventory = await this.repository.update(adjustmentData);

  if (adjustmentData.reason === 'PURCHASE') {
    const journalEntry = {
      journalType: 'GL',
      journalDate: new Date(),
      referenceNumber: adjustmentData.referenceId,
      referenceType: 'STOCK_PURCHASE',
      narration: `Stock purchase: ${adjustmentData.sku}`,
      lineItems: [
        {
          accountCode: '1040',  // Inventory
          debit: adjustmentData.amount,
          credit: 0
        },
        {
          accountCode: '2010',  // A/P or 1010 for cash
          debit: 0,
          credit: adjustmentData.amount
        }
      ]
    };

    const journal = await this.journalRepository.create(journalEntry);
    await this.accountingService.postJournal(journal._id.toString());
  } else if (adjustmentData.reason === 'ADJUSTMENT') {
    // Adjustment entry
    const journalEntry = {
      journalType: 'GL',
      journalDate: new Date(),
      narration: `Inventory adjustment: ${adjustmentData.sku}`,
      lineItems: [
        {
          accountCode: '1040',  // Inventory
          debit: adjustmentData.quantityAdjustment * adjustmentData.unitCost,
          credit: 0
        },
        {
          accountCode: '5050',  // Closing Inventory
          debit: 0,
          credit: adjustmentData.quantityAdjustment * adjustmentData.unitCost
        }
      ]
    };

    const journal = await this.journalRepository.create(journalEntry);
    await this.accountingService.postJournal(journal._id.toString());
  }

  return inventory;
}
```

## Expenses Module Integration

### On Expense Claim Approval

**Accounts Involved**:
- DR: Various Expense Accounts (5500-5590)
- CR: 2030 (Employee Payables) or 1010 (Cash)

```typescript
// expenses.service.ts
async approveExpenseClaim(claimId: string, approvalData: any): Promise<any> {
  const claim = await this.repository.update(claimId, { status: 'APPROVED' });

  const journalEntry = {
    journalType: 'GL',
    journalDate: new Date(),
    referenceNumber: claim.claimNumber,
    referenceType: 'EXPENSE_CLAIM',
    narration: `Approved expense claim ${claim.claimNumber} for ${claim.employeeName}`,
    lineItems: [
      {
        accountCode: this.getExpenseCode(claim.category),
        debit: claim.totalAmount,
        credit: 0
      },
      {
        accountCode: '2030',  // Employee Payables
        debit: 0,
        credit: claim.totalAmount
      }
    ]
  };

  const journal = await this.journalRepository.create(journalEntry);
  await this.accountingService.postJournal(journal._id.toString());

  return claim;
}

private getExpenseCode(category: string): string {
  const mapping = {
    'TRAVEL': '5590',
    'MEAL': '5590',
    'OFFICE': '5550',
    'TRAINING': '5560',
    'OTHER': '5500'
  };
  return mapping[category] || '5500';
}
```

## Payments Module Integration

### On Direct Payment Recording

**For Bank Payments**:
- DR: Various Accounts
- CR: 1010 (Cash in Bank)

```typescript
// payments.service.ts
async recordPayment(paymentData: any): Promise<any> {
  const payment = await this.repository.create(paymentData);

  // Determine debit account based on payment type
  const debitAccount = paymentData.paymentType === 'A/P' ? '2010' : '1030';

  const journalEntry = {
    journalType: 'CPJ',
    journalDate: new Date(),
    referenceNumber: payment.paymentId,
    referenceType: 'PAYMENT',
    narration: `Payment ${payment.paymentId} to ${payment.payeeName}`,
    lineItems: [
      {
        accountCode: debitAccount,
        debit: payment.amount,
        credit: 0
      },
      {
        accountCode: '1010',  // Cash
        debit: 0,
        credit: payment.amount
      }
    ]
  };

  const journal = await this.journalRepository.create(journalEntry);
  await this.accountingService.postJournal(journal._id.toString());

  return payment;
}
```

## Event-Driven Integration Pattern

For loose coupling, use NestJS events:

```typescript
// sales.service.ts
constructor(
  private eventEmitter: EventEmitter2
) {}

async createSalesInvoice(invoiceData: any): Promise<any> {
  const invoice = await this.repository.create(invoiceData);
  
  // Emit event instead of direct call
  this.eventEmitter.emit('sales.invoice.created', {
    invoiceId: invoice._id,
    invoiceNumber: invoice.invoiceNumber,
    amount: invoice.totalAmount,
    customerId: invoice.customerId
  });

  return invoice;
}

// accounting.listener.ts
@Injectable()
export class AccountingEventListener {
  constructor(private accountingService: AccountingService) {}

  @OnEvent('sales.invoice.created')
  async handleInvoiceCreated(payload: any) {
    // Create journal entry
    const journal = await this.createSalesJournal(payload);
    await this.accountingService.postJournal(journal._id.toString());
  }

  @OnEvent('purchase.bill.created')
  async handleBillCreated(payload: any) {
    // Create journal entry
    const journal = await this.createPurchaseJournal(payload);
    await this.accountingService.postJournal(journal._id.toString());
  }
}
```

## Testing the Integrations

### Create Complete Transaction Flow

```bash
# 1. Create Chart of Accounts
curl -X POST http://localhost:3000/accounting/chart-of-accounts \
  -H "Content-Type: application/json" \
  -d '{"accountCode": "1010", "name": "Cash", ...}'

# 2. Create Sales Invoice (auto-creates journal)
curl -X POST http://localhost:3000/sales/invoices \
  -H "Content-Type: application/json" \
  -d '{...invoice data...}'

# 3. View Journal Created
curl http://localhost:3000/accounting/journals

# 4. View GL Posting
curl http://localhost:3000/accounting/general-ledger/account/{accountId}

# 5. Check Trial Balance
curl http://localhost:3000/accounting/general-ledger/trial-balance
```

### Verify Accounting Integrity

```typescript
// Test that all invoices have corresponding journals
async function verifyAccountingIntegrity() {
  const invoices = await invoiceRepo.find();
  
  for (const invoice of invoices) {
    const journal = await journalRepo.findOne({
      referenceNumber: invoice.invoiceNumber,
      referenceType: 'SALES_INVOICE'
    });
    
    if (!journal) {
      console.warn(`Invoice ${invoice.invoiceNumber} has no journal entry`);
    }
  }
}
```

## Account Code Reference

### Standard Account Codes (Seed Data)

| Code | Account Name | Type | Normal Balance |
|------|-------------|------|---|
| 1010 | Cash in Bank | Asset | Debit |
| 1030 | Accounts Receivable | Asset | Debit |
| 1040 | Inventory | Asset | Debit |
| 2010 | Accounts Payable | Liability | Credit |
| 2030 | Employee Payables | Liability | Credit |
| 2050 | GST/VAT Payable | Liability | Credit |
| 3010 | Capital/Owner Equity | Equity | Credit |
| 4010 | Sales - Credit | Revenue | Credit |
| 5010 | Opening Inventory | Expense | Debit |
| 5020 | Purchases | Expense | Debit |
| 5050 | Closing Inventory | Contra | Credit |
| 5510 | Salaries & Wages | Expense | Debit |
| 5520 | Rent Expense | Expense | Debit |
| 5530 | Utilities Expense | Expense | Debit |
| 5550 | Office Supplies | Expense | Debit |
| 5560 | Marketing & Advertising | Expense | Debit |
| 5580 | Insurance Expense | Expense | Debit |
| 5590 | Travel Expense | Expense | Debit |

## Error Handling

Always handle journal creation failures:

```typescript
async function createSalesWithJournal(invoiceData: any) {
  try {
    // Create invoice
    const invoice = await invoiceService.create(invoiceData);
    
    try {
      // Create journal
      const journal = await createSalesJournal(invoice);
      await postJournal(journal);
    } catch (journalError) {
      // Log journal creation failure
      logger.error(`Failed to create journal for invoice ${invoice.id}`, journalError);
      
      // Optionally: rollback invoice creation
      // await invoiceService.delete(invoice.id);
      
      // Or: mark for manual review
      await invoiceService.update(invoice.id, { 
        accountingStatus: 'PENDING_JOURNAL',
        accountingError: journalError.message
      });
    }
    
    return invoice;
  } catch (error) {
    logger.error('Failed to create invoice', error);
    throw error;
  }
}
```

## Reconciliation & Month-End Close

```typescript
async monthEndClose(month: string, year: number) {
  // 1. Verify all transactions journaled
  const unJournaledTransactions = await findUnJournaledTransactions(month);
  if (unJournaledTransactions.length > 0) {
    throw new Error(`${unJournaledTransactions.length} transactions without journals`);
  }

  // 2. Check trial balance
  const trialBalance = await getTrialBalance(`${year}-${month}`);
  if (!trialBalance.isBalanced) {
    throw new Error('Trial balance not balanced');
  }

  // 3. Reconcile bank accounts
  await reconcileBankAccounts(month);

  // 4. Close period
  await closePeriod(`${year}-${month}`);
}
```

## Next Steps

1. **Implement event listeners** in each module
2. **Test integration** with sample data
3. **Verify journal creation** and GL posting
4. **Reconcile** with manual entries
5. **Generate financial statements**
6. **Audit trail** verification
7. **Year-end** closing procedures

For detailed implementation, refer to each module's integration service.
