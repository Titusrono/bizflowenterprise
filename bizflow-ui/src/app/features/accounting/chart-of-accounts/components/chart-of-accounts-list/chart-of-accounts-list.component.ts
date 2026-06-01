import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ChartOfAccountsService } from '../../service/chart-of-accounts.service';
import { ToastrService } from 'ngx-toastr';
import { ChartOfAccountsFormComponent } from '../chart-of-accounts-form/chart-of-accounts-form.component';

interface Account {
  _id: string;
  accountCode: string;
  name: string;
  accountType: number;
  subCategory?: string;
  balance: number;
  isActive: boolean;
}

@Component({
  selector: 'app-chart-of-accounts-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ChartOfAccountsFormComponent],
  templateUrl: './chart-of-accounts-list.component.html',
  styleUrls: ['./chart-of-accounts-list.component.scss'],
})
export class ChartOfAccountsListComponent implements OnInit {
  accounts = signal<Account[]>([]);
  loading = signal(false);
  showForm = signal(false);
  editingId = signal<string | null>(null);
  currentPage = signal(1);
  pageSize = signal(50);
  total = signal(0);

  // Filters
  filterForm: FormGroup;

  // Make Math available in template
  readonly Math = Math;

  // Account Types
  accountTypes = [
    { value: 1, label: 'Asset' },
    { value: 2, label: 'Liability' },
    { value: 3, label: 'Equity' },
    { value: 4, label: 'Revenue' },
    { value: 5, label: 'Expense' },
    { value: 6, label: 'Contra' },
  ];

  constructor(
    private coaService: ChartOfAccountsService,
    private fb: FormBuilder,
    private toastr: ToastrService,
  ) {
    this.filterForm = this.fb.group({
      accountType: [null],
      accountCode: [''],
      isActive: [null],
    });
  }

  /**
   * Get current user organization ID
   */
  getCurrentOrgId(): string {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return currentUser.organizationId || '';
  }

  /**
   * Seed Chart of Accounts with default accounting standard data
   * All logic handled on backend following international accounting standards
   */
  seedAccounts(): void {
    if (confirm('This will populate the Chart of Accounts with standard accounting data including:\n- Assets (Current & Fixed)\n- Liabilities (Current & Long-term)\n- Equity\n- Revenue\n- Expenses\n\nContinue?')) {
      this.loading.set(true);
      this.coaService.seedChartOfAccounts().subscribe({
        next: (response) => {
          this.toastr.success(`Successfully seeded ${response.count || 0} accounts following accounting standards`);
          this.loadAccounts();
        },
        error: (error) => {
          console.error('Error seeding accounts:', error);
          this.toastr.error(error.error?.message || 'Failed to seed accounts');
          this.loading.set(false);
        },
      });
    }
  }

  ngOnInit(): void {
    this.loadAccounts();
  }

  /**
   * Load Chart of Accounts
   */
  loadAccounts(): void {
    this.loading.set(true);
    const filters = this.filterForm.value;

    this.coaService.getChartOfAccounts(filters, this.currentPage(), this.pageSize()).subscribe({
      next: (response) => {
        this.accounts.set(response.data || []);
        this.total.set(response.total || 0);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading accounts:', error);
        this.toastr.error('Failed to load Chart of Accounts');
        this.loading.set(false);
      },
    });
  }

  /**
   * Apply filters
   */
  applyFilters(): void {
    this.currentPage.set(1);
    this.loadAccounts();
  }

  /**
   * Reset filters
   */
  resetFilters(): void {
    this.filterForm.reset();
    this.currentPage.set(1);
    this.loadAccounts();
  }

  /**
   * Open form for creating new account
   */
  openCreate(): void {
    this.editingId.set(null);
    this.showForm.set(true);
  }

  /**
   * Open form for editing
   */
  editAccount(account: Account): void {
    this.editingId.set(account._id);
    this.showForm.set(true);
  }

  /**
   * Handle form submission
   */
  onFormSubmit(success: boolean): void {
    if (success) {
      this.resetForm();
      this.loadAccounts();
    }
  }

  /**
   * Deactivate account
   */
  deactivateAccount(id: string): void {
    if (confirm('Are you sure you want to deactivate this account?')) {
      this.coaService.deactivateAccount(id).subscribe({
        next: () => {
          this.toastr.success('Account deactivated successfully');
          this.loadAccounts();
        },
        error: (error) => {
          console.error('Error deactivating account:', error);
          this.toastr.error('Failed to deactivate account');
        },
      });
    }
  }

  /**
   * Delete account
   */
  deleteAccount(id: string): void {
    if (confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      this.coaService.deleteChartOfAccount(id).subscribe({
        next: () => {
          this.toastr.success('Account deleted successfully');
          this.loadAccounts();
        },
        error: (error) => {
          console.error('Error deleting account:', error);
          this.toastr.error(error.error?.message || 'Failed to delete account');
        },
      });
    }
  }

  /**
   * Close form
   */
  resetForm(): void {
    this.editingId.set(null);
    this.showForm.set(false);
  }

  /**
   * Toggle form visibility
   */
  toggleForm(): void {
    this.showForm.update(v => !v);
    if (!this.showForm()) {
      this.resetForm();
    }
  }

  /**
   * Get account type label
   */
  getAccountTypeLabel(type: number): string {
    const typeObj = this.accountTypes.find((t) => t.value === type);
    return typeObj ? typeObj.label : 'Unknown';
  }

  /**
   * Pagination
   */
  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.loadAccounts();
    }
  }

  nextPage(): void {
    if (this.currentPage() * this.pageSize() < this.total()) {
      this.currentPage.update(p => p + 1);
      this.loadAccounts();
    }
  }
}
