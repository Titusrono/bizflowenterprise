# Accounting Module - Three-Module Architecture

## Overview

The Accounting Module has been professionally restructured into **three separate, independent NestJS modules** following enterprise architecture best practices. This provides better separation of concerns, scalability, and maintainability.

## Module Structure

```
src/
├── chart-of-accounts/                    # Master Data Module
│   ├── schemas/
│   │   └── chart-of-account.schema.ts
│   ├── repositories/
│   │   └── chart-of-account.repository.ts
│   ├── services/
│   │   └── chart-of-account.service.ts
│   ├── controllers/
│   │   └── chart-of-account.controller.ts
│   ├── dto/
│   │   └── chart-of-account.dto.ts
│   ├── seeders/
│   │   └── chart-of-account.seeder.ts
│   ├── chart-of-accounts.module.ts
│   └── index.ts
│
├── journals/                             # Transaction Recording Module
│   ├── schemas/
│   │   └── journal.schema.ts
│   ├── repositories/
│   │   └── journal.repository.ts
│   ├── services/
│   │   └── journal.service.ts
│   ├── controllers/
│   │   └── journal.controller.ts
│   ├── dto/
│   │   └── journal.dto.ts
│   ├── journals.module.ts
│   └── index.ts
│
└── general-ledger/                       # Reporting & GL Module
    ├── schemas/
    │   └── general-ledger.schema.ts
    ├── repositories/
    │   └── general-ledger.repository.ts
    ├── services/
    │   └── general-ledger.service.ts
    ├── controllers/
    │   └── general-ledger.controller.ts
    ├── dto/
    │   └── general-ledger.dto.ts
    ├── general-ledger.module.ts
    └── index.ts
```

## Module Responsibilities

### 1. **Chart of Accounts Module** (`chart-of-accounts/`)

**Purpose**: Master data management for all financial accounts

**Responsibilities**:
- Define and manage the chart of accounts
- Maintain account hierarchy (parent-child relationships)
- Track account balances
- Manage account lifecycle (active/inactive/deleted)
- Seed standard accounts for new organizations
- Account type validation and debit/credit rules

**Exports**:
- `ChartOfAccountsModule` - NestJS module for dependency injection
- `ChartOfAccountRepository` - Data access layer
- `ChartOfAccountService` - Business logic
- `ChartOfAccountDocument` - Schema type

**Dependencies**: 
- None (independent module - foundation of the system)

**Key Features**:
- Hierarchical account structure
- Account type validation (Asset, Liability, Equity, Revenue, Expense, Contra)
- Normal balance enforcement (Debit/Credit rules)
- System-protected seed accounts
- Organization and branch-based accounts

---

### 2. **Journals Module** (`journals/`)

**Purpose**: Transaction recording and double-entry bookkeeping

**Responsibilities**:
- Create and manage journal entries
- Validate debit/credit balance (must be equal)
- Auto-generate journal numbers (J-YYYYMM-NNNNN)
- Support multiple journal types (GL, SJ, PJ, CRJ, CPJ)
- Post journals to General Ledger
- Support journal reversals
- Manage approval workflow

**Exports**:
- `JournalsModule` - NestJS module for dependency injection
- `JournalRepository` - Data access layer
- `JournalService` - Business logic
- `JournalDocument` - Schema type

**Dependencies**:
- **ChartOfAccountsModule** - Validates account codes and references
- **GeneralLedgerModule** - Posts entries to GL upon posting

**Key Features**:
- Double-entry validation (debits = credits)
- Line items with account mapping
- Status workflow: DRAFT → POSTED → REVERSED
- Reference linking to source documents
- Bulk posting capabilities
- Period and fiscal year tracking

---

### 3. **General Ledger Module** (`general-ledger/`)

**Purpose**: Posted ledger entries, reporting, and financial queries

**Responsibilities**:
- Store posted journal entries
- Maintain running account balances
- Generate trial balance reports
- Support balance-as-of-date queries
- Track reconciliation status
- Generate GL reports
- Account history tracking

**Exports**:
- `GeneralLedgerModule` - NestJS module for dependency injection
- `GeneralLedgerRepository` - Data access layer with aggregation
- `GeneralLedgerService` - Business logic and reporting
- `GeneralLedgerDocument` - Schema type

**Dependencies**:
- **ChartOfAccountsModule** - References account master data
- **JournalsModule** - (optional, imported if needed for cross-module queries)

**Key Features**:
- Automatic GL entry creation from posted journals
- Running balance calculation
- Trial balance generation via aggregation pipeline
- Balance-as-of-date calculations
- Entry reconciliation tracking
- Period-wise and account-wise totals
- GL report generation

---

## Module Dependency Graph

```
ChartOfAccountsModule (Foundation)
    ↓
JournalsModule ←→ GeneralLedgerModule
    ↑              ↑
    └──────────────┘
```

**Dependency Rules**:
1. ✅ **ChartOfAccountsModule** is independent (no module dependencies)
2. ✅ **JournalsModule** imports ChartOfAccountsModule and GeneralLedgerModule
3. ✅ **GeneralLedgerModule** imports ChartOfAccountsModule only
4. ⚠️ No circular dependencies

---

## Import Examples

### Using from Other Modules

```typescript
// In another module (e.g., SalesModule)
import { ChartOfAccountsModule } from './chart-of-accounts/chart-of-accounts.module';
import { JournalsModule } from './journals/journals.module';

@Module({
  imports: [ChartOfAccountsModule, JournalsModule],
})
export class SalesModule {}

// Using services
constructor(
  private readonly chartOfAccountsService: ChartOfAccountService,
  private readonly journalsService: JournalService,
) {}
```

### Clean Exports via Index Files

```typescript
// Option 1: Import from index
import { 
  ChartOfAccountService, 
  ChartOfAccountDocument 
} from './chart-of-accounts';

// Option 2: Import from module
import { ChartOfAccountsModule } from './chart-of-accounts/chart-of-accounts.module';
```

---

## API Endpoint Organization

### Chart of Accounts Endpoints
```
GET    /accounting/chart-of-accounts              # List
POST   /accounting/chart-of-accounts              # Create
GET    /accounting/chart-of-accounts/:id          # Get by ID
GET    /accounting/chart-of-accounts/code/:code   # Get by code
GET    /accounting/chart-of-accounts/type/:type   # Get by type
PUT    /accounting/chart-of-accounts/:id          # Update
DELETE /accounting/chart-of-accounts/:id          # Delete
```

### Journals Endpoints
```
GET    /accounting/journals                       # List
POST   /accounting/journals                       # Create
GET    /accounting/journals/:id                   # Get by ID
PUT    /accounting/journals/:id                   # Update
POST   /accounting/journals/:id/post              # Post to GL
POST   /accounting/journals/:id/reverse           # Reverse
DELETE /accounting/journals/:id                   # Delete
```

### General Ledger Endpoints
```
GET    /accounting/general-ledger/account/:id     # Account ledger
GET    /accounting/general-ledger/trial-balance   # Trial balance
GET    /accounting/general-ledger/report/...      # GL reports
POST   /accounting/general-ledger/reconcile       # Reconcile
```

---

## Migration Path for Other Modules

When integrating with Sales, Purchases, Bills, etc.:

```typescript
// 1. Import the accounting modules
import { ChartOfAccountsModule } from '../chart-of-accounts';
import { JournalsModule } from '../journals';
import { GeneralLedgerModule } from '../general-ledger';

// 2. Inject services where needed
constructor(
  private readonly coaService: ChartOfAccountService,
  private readonly journalService: JournalService,
  private readonly glService: GeneralLedgerService,
) {}

// 3. Create journal entries on business events
async onInvoiceCreated(invoice: Invoice) {
  const journal = {
    journalType: 'SJ',
    lineItems: [
      { accountCode: '1030', debit: invoice.total, credit: 0 },
      { accountCode: '4010', debit: 0, credit: invoice.total }
    ]
  };
  await this.journalService.createJournal(journal);
}
```

---

## Benefits of Three-Module Architecture

✅ **Separation of Concerns**
- Each module has a single, well-defined responsibility
- Changes in one module don't affect others

✅ **Testability**
- Modules can be tested independently
- Easier to mock dependencies

✅ **Scalability**
- Modules can be scaled separately
- Easy to extract to microservices later

✅ **Maintainability**
- Clear module boundaries
- Easier to understand and navigate

✅ **Team Organization**
- Different teams can own different modules
- Parallel development without conflicts

✅ **Reusability**
- Modules can be imported into different contexts
- Clean exports via index.ts files

✅ **Future-Ready**
- Easy to transition to microservices
- Module boundaries are already defined

---

## Implementation Notes

### DTO Organization
- DTOs are now module-specific (not shared)
- Each module imports its own DTOs
- No cross-module DTO dependencies

### Schema Organization
- Schemas live in module-specific directories
- Each schema is isolated to its module
- Clean schema exports via index.ts

### Service Layer
- Services encapsulate business logic
- Cross-module service communication via dependency injection
- Services are exported from modules for external use

### Repository Layer
- Repositories are private to services
- Data access patterns are encapsulated
- Query optimization happens at repository level

---

## Version History

| Date | Version | Change |
|------|---------|--------|
| 2024-12-31 | 1.0 | Initial three-module refactoring from monolithic accounting module |
| - | - | Modules: ChartOfAccounts, Journals, GeneralLedger |

---

## Next Steps

1. **Test the application** to ensure all imports resolve correctly
2. **Verify API endpoints** still function as expected
3. **Integration testing** with Sales, Purchases, and other modules
4. **Performance testing** to ensure three modules don't impact performance
5. **Documentation updates** for frontend consumption

---

## Related Documentation

- [Accounting Integration Guide](../../ACCOUNTING_INTEGRATION_GUIDE.md)
- [Backend Architecture Overview](../BACKEND_ARCHITECTURE_OVERVIEW.md)
- [Chart of Accounts Module](./chart-of-accounts/README.md)
- [Journals Module](./journals/README.md)
- [General Ledger Module](./general-ledger/README.md)
