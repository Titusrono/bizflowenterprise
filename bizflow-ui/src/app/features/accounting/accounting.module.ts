import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Chart of Accounts Components & Service
import { ChartOfAccountsListComponent } from './chart-of-accounts/components/chart-of-accounts-list/chart-of-accounts-list.component';
import { ChartOfAccountsFormComponent } from './chart-of-accounts/components/chart-of-accounts-form/chart-of-accounts-form.component';
import { ChartOfAccountsService } from './chart-of-accounts/service/chart-of-accounts.service';

// Journals Components & Service
import { JournalsListComponent } from './journals/components/journals-list/journals-list.component';
import { JournalsFormComponent } from './journals/components/journals-form/journals-form.component';
import { JournalsService } from './journals/service/journals.service';

// General Ledger Components & Service
import { GeneralLedgerListComponent } from './general-ledger/components/general-ledger-list/general-ledger-list.component';
import { GeneralLedgerFormComponent } from './general-ledger/components/general-ledger-form/general-ledger-form.component';
import { GeneralLedgerService } from './general-ledger/service/general-ledger.service';

// Legacy service (deprecated but kept for compatibility)
import { AccountingService } from './services/accounting.service';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'chart-of-accounts',
        component: ChartOfAccountsListComponent,
      },
      {
        path: 'journals',
        component: JournalsListComponent,
      },
      {
        path: 'general-ledger',
        component: GeneralLedgerListComponent,
      },
      {
        path: 'trial-balance',
        component: GeneralLedgerListComponent,
      },
      {
        path: '',
        redirectTo: 'chart-of-accounts',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
  ],
  providers: [
    ChartOfAccountsService,
    JournalsService,
    GeneralLedgerService,
    AccountingService,
  ],
})
export class AccountingModule {}
