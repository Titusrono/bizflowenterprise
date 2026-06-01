import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChartOfAccountsService } from '../../service/chart-of-accounts.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-chart-of-accounts-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './chart-of-accounts-form.component.html',
  styleUrls: ['./chart-of-accounts-form.component.scss'],
})
export class ChartOfAccountsFormComponent implements OnInit {
  @Input() editingId: string | null = null;
  @Input() isVisible = false;
  @Output() onSubmit = new EventEmitter<boolean>();
  @Output() onCancel = new EventEmitter<void>();

  form: FormGroup;
  submitting = signal(false);

  // Account Types
  accountTypes = [
    { value: 1, label: 'Asset' },
    { value: 2, label: 'Liability' },
    { value: 3, label: 'Equity' },
    { value: 4, label: 'Revenue' },
    { value: 5, label: 'Expense' },
    { value: 6, label: 'Contra' },
  ];

  normalBalances = ['Debit', 'Credit'];

  constructor(
    private coaService: ChartOfAccountsService,
    private fb: FormBuilder,
    private toastr: ToastrService,
  ) {
    this.form = this.fb.group({
      accountCode: ['', [Validators.required, Validators.minLength(3)]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      accountType: [1, Validators.required],
      subCategory: [''],
      description: [''],
      normalBalance: ['Debit', Validators.required],
      parentCode: [''],
      isHeader: [false],
      isActive: [true],
    });
  }

  ngOnInit(): void {
    if (this.editingId) {
      this.loadAccountData();
    }
  }

  ngOnChanges(): void {
    if (this.editingId && this.isVisible) {
      this.loadAccountData();
    }
  }

  /**
   * Load account data for editing
   */
  loadAccountData(): void {
    this.coaService.getChartOfAccountById(this.editingId!).subscribe({
      next: (account) => {
        this.form.patchValue({
          accountCode: account.accountCode,
          name: account.name,
          accountType: account.accountType,
          subCategory: account.subCategory,
          description: account.description,
          normalBalance: account.normalBalance,
          parentCode: account.parentCode,
          isHeader: account.isHeader,
          isActive: account.isActive,
        });
      },
      error: (error) => {
        console.error('Error loading account:', error);
        this.toastr.error('Failed to load account details');
      },
    });
  }

  /**
   * Save account
   */
  saveAccount(): void {
    if (!this.form.valid) {
      this.toastr.error('Please fill in all required fields');
      return;
    }

    this.submitting.set(true);
    const formData = this.form.value;

    if (this.editingId) {
      // Update
      this.coaService.updateChartOfAccount(this.editingId, formData).subscribe({
        next: () => {
          this.toastr.success('Account updated successfully');
          this.submitting.set(false);
          this.onSubmit.emit(true);
          this.resetForm();
        },
        error: (error) => {
          console.error('Error updating account:', error);
          this.toastr.error(error.error?.message || 'Failed to update account');
          this.submitting.set(false);
        },
      });
    } else {
      // Create
      this.coaService.createChartOfAccount(formData).subscribe({
        next: () => {
          this.toastr.success('Account created successfully');
          this.submitting.set(false);
          this.onSubmit.emit(true);
          this.resetForm();
        },
        error: (error) => {
          console.error('Error creating account:', error);
          this.toastr.error(error.error?.message || 'Failed to create account');
          this.submitting.set(false);
        },
      });
    }
  }

  /**
   * Reset form
   */
  resetForm(): void {
    this.form.reset({
      accountType: 1,
      normalBalance: 'Debit',
      isActive: true,
      isHeader: false,
    });
    this.editingId = null;
  }

  /**
   * Cancel form
   */
  cancel(): void {
    this.resetForm();
    this.onCancel.emit();
  }
}
