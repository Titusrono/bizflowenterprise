import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ExpensesService } from '../../service/expenses.service';
import { ExpenseFormComponent } from '../expense-form/expense-form.component';
import { AuthService } from '../../../../core/services/auth.service';
import { ScopeService } from '../../../../core/services/scope.service';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule, ExpenseFormComponent],
  templateUrl: './expense-list.component.html',
  styleUrls: ['./expense-list.component.scss'],
})
export class ExpenseListComponent implements OnInit {
  expenses: any[] = [];
  loading = signal(false);
  modalOpen = signal(false);
  currentUser = signal<any>(null);

  constructor(
    private expensesService: ExpensesService,
    private authService: AuthService,
    private scopeService: ScopeService,
  ) {
    this.currentUser.set(this.authService.getCurrentUser());
  }

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  async loadData(): Promise<void> {
    this.loading.set(true);
    try {
      const orgId = this.scopeService.getSelectedOrganizationId() || this.currentUser()?.organizationId || '';
      const resp: any = await firstValueFrom(this.expensesService.getByOrganization(orgId, 1, 20));
      this.expenses = resp.data || [];
    } finally {
      this.loading.set(false);
    }
  }

  openCreate(): void {
    this.modalOpen.set(true);
  }

  async onCreated(): Promise<void> {
    this.modalOpen.set(false);
    await this.loadData();
  }
}
