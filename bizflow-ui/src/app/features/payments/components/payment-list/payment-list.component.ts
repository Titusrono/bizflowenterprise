import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { PaymentsService, PaymentSetting } from '../../service/payments.service';
import { PaymentFormComponent } from '../payment-form/payment-form.component';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PaymentFormComponent],
  templateUrl: './payment-list.component.html',
  styleUrls: ['./payment-list.component.scss'],
})
export class PaymentListComponent implements OnInit {
  records = signal<PaymentSetting[]>([]);
  loading = signal(false);
  saving = signal(false);
  error = signal('');
  modalOpen = signal(false);
  modalMode = signal<'create' | 'edit'>('create');
  selectedId = signal('');
  searchQuery = signal('');
  readonly form;

  constructor(
    private fb: FormBuilder,
    private paymentsService: PaymentsService,
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      providerType: ['mpesa', Validators.required],
      accountName: [''],
      bankName: [''],
      branchName: [''],
      phoneNumber: [''],
      tillNumber: [''],
      paybillNumber: [''],
      accountNumber: [''],
      notes: [''],
      isDefault: [false],
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  async loadData(): Promise<void> {
    this.loading.set(true);
    this.error.set('');

    try {
      this.records.set(await firstValueFrom(this.paymentsService.getPayments(this.searchQuery())));
    } catch (error: any) {
      this.error.set(error?.error?.message || error?.message || 'Failed to load payments.');
      this.records.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    void this.loadData();
  }

  openCreate(): void {
    this.modalMode.set('create');
    this.selectedId.set('');
    this.form.reset({
      name: '',
      providerType: 'mpesa',
      accountName: '',
      bankName: '',
      branchName: '',
      phoneNumber: '',
      tillNumber: '',
      paybillNumber: '',
      accountNumber: '',
      notes: '',
      isDefault: false,
    });
    this.modalOpen.set(true);
  }

  async openEdit(item: PaymentSetting): Promise<void> {
    this.modalMode.set('edit');
    this.selectedId.set(item._id);
    this.form.patchValue({
      name: item.name,
      providerType: item.providerType,
      accountName: item.accountName || '',
      bankName: item.bankName || '',
      branchName: item.branchName || '',
      phoneNumber: item.phoneNumber || '',
      tillNumber: item.tillNumber || '',
      paybillNumber: item.paybillNumber || '',
      accountNumber: item.accountNumber || '',
      notes: item.notes || '',
      isDefault: Boolean(item.isDefault),
    });
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.form.reset({
      name: '',
      providerType: 'mpesa',
      accountName: '',
      bankName: '',
      branchName: '',
      phoneNumber: '',
      tillNumber: '',
      paybillNumber: '',
      accountNumber: '',
      notes: '',
      isDefault: false,
    });
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    try {
      const payload = this.cleanPayload(this.form.getRawValue()) as Partial<PaymentSetting>;

      if (this.modalMode() === 'create') {
        await firstValueFrom(this.paymentsService.createPayment(payload));
      } else {
        await firstValueFrom(this.paymentsService.updatePayment(this.selectedId(), payload));
      }

      this.closeModal();
      await this.loadData();
    } catch (error: any) {
      this.error.set(error?.error?.message || error?.message || 'Failed to save payment.');
    } finally {
      this.saving.set(false);
    }
  }

  async remove(id: string): Promise<void> {
    const confirmed = window.confirm('Delete this payment configuration?');
    if (!confirmed) {
      return;
    }

    await firstValueFrom(this.paymentsService.deletePayment(id));
    await this.loadData();
  }

  providerLabel(type: string): string {
    return type ? type.toUpperCase() : 'UNKNOWN';
  }

  defaultCount(): number {
    return this.records().filter((item) => item.isDefault).length;
  }

  displayDetails(item: PaymentSetting): string {
    const parts = [item.accountName, item.bankName, item.branchName, item.phoneNumber, item.tillNumber, item.paybillNumber, item.accountNumber]
      .filter((value) => value && value.trim())
      .map((value) => value?.trim());

    return parts.length ? parts.join(' • ') : 'No payment details set';
  }

  private cleanPayload(payload: Record<string, any>): Partial<PaymentSetting> {
    return Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== null && value !== undefined && value !== ''),
    ) as Partial<PaymentSetting>;
  }
}