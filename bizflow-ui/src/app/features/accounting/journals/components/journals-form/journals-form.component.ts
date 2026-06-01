import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { JournalsService } from '../../service/journals.service';
import { ChartOfAccountsService } from '../../../chart-of-accounts/service/chart-of-accounts.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-journals-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './journals-form.component.html',
  styleUrls: ['./journals-form.component.scss'],
})
export class JournalsFormComponent implements OnInit {
  @Input() editingId: string | null = null;
  @Input() isVisible = false;
  @Output() onSubmit = new EventEmitter<boolean>();
  @Output() onCancel = new EventEmitter<void>();

  form: FormGroup;
  submitting = signal(false);
  activeAccounts = signal<any[]>([]);

  journalTypes = [
    { value: 'GL', label: 'General Journal' },
    { value: 'SJ', label: 'Sales Journal' },
    { value: 'PJ', label: 'Purchase Journal' },
    { value: 'CRJ', label: 'Cash Receipt Journal' },
    { value: 'CPJ', label: 'Cash Payment Journal' },
  ];

  constructor(
    private journalsService: JournalsService,
    private coaService: ChartOfAccountsService,
    private fb: FormBuilder,
    private toastr: ToastrService,
  ) {
    this.form = this.fb.group({
      journalType: ['GL', Validators.required],
      journalDate: [new Date().toISOString().split('T')[0], Validators.required],
      referenceNumber: [''],
      referenceType: [''],
      narration: [''],
      lineItems: this.fb.array([]),
      currency: ['USD'],
      period: [''],
    });
  }

  ngOnInit(): void {
    this.loadActiveAccounts();
  }

  get lineItems(): FormArray {
    return this.form.get('lineItems') as FormArray;
  }

  loadActiveAccounts(): void {
    this.coaService.getActiveAccounts().subscribe({
      next: (accounts) => {
        this.activeAccounts.set(accounts || []);
      },
      error: (error) => {
        console.error('Error loading accounts:', error);
      },
    });
  }

  addLineItem(): void {
    const lineItem = this.fb.group({
      accountCode: ['', Validators.required],
      accountName: ['', Validators.required],
      accountId: ['', Validators.required],
      debit: [0, [Validators.required, Validators.min(0)]],
      credit: [0, [Validators.required, Validators.min(0)]],
      narration: [''],
    });
    this.lineItems.push(lineItem);
  }

  removeLineItem(index: number): void {
    this.lineItems.removeAt(index);
  }

  saveJournal(): void {
    if (!this.form.valid || this.lineItems.length < 2) {
      this.toastr.error('Please complete all fields and add at least 2 line items');
      return;
    }

    const totalDebit = this.lineItems.value.reduce((sum: number, item: any) => sum + (item.debit || 0), 0);
    const totalCredit = this.lineItems.value.reduce((sum: number, item: any) => sum + (item.credit || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      this.toastr.error('Debits must equal credits');
      return;
    }

    this.submitting.set(true);
    const formData = { ...this.form.value, totalDebit, totalCredit };

    if (this.editingId) {
      this.journalsService.updateJournal(this.editingId, formData).subscribe({
        next: () => {
          this.toastr.success('Journal updated successfully');
          this.submitting.set(false);
          this.onSubmit.emit(true);
          this.resetForm();
        },
        error: (error) => {
          console.error('Error updating journal:', error);
          this.toastr.error('Failed to update journal');
          this.submitting.set(false);
        },
      });
    } else {
      this.journalsService.createJournal(formData).subscribe({
        next: () => {
          this.toastr.success('Journal created successfully');
          this.submitting.set(false);
          this.onSubmit.emit(true);
          this.resetForm();
        },
        error: (error) => {
          console.error('Error creating journal:', error);
          this.toastr.error('Failed to create journal');
          this.submitting.set(false);
        },
      });
    }
  }

  resetForm(): void {
    this.form.reset({
      journalType: 'GL',
      journalDate: new Date().toISOString().split('T')[0],
      currency: 'USD',
    });
    this.lineItems.clear();
    this.editingId = null;
  }

  cancel(): void {
    this.resetForm();
    this.onCancel.emit();
  }
}
