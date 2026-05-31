import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaymentMethod, SaleRecord } from '../../service/sales.service';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.scss'],
})
export class PaymentModalComponent implements OnChanges {
  @Input() sale: SaleRecord | null = null;
  @Input() maxAmount = 0;
  @Input() saving = false;

  @Output() cancel = new EventEmitter<void>();
  @Output() submitPayment = new EventEmitter<{
    amount: number;
    method: PaymentMethod;
    paidAt?: string;
    reference?: string;
    notes?: string;
  }>();

  readonly form;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      amount: [0, [Validators.required, Validators.min(0.01)]],
      method: ['cash' as PaymentMethod, Validators.required],
      paidAt: [''],
      reference: [''],
      notes: [''],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sale'] || changes['maxAmount']) {
      this.form.reset({
        amount: Number(this.maxAmount || 0),
        method: 'cash',
        paidAt: '',
        reference: '',
        notes: '',
      });
    }
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const amount = Number(raw.amount || 0);

    if (amount > Number(this.maxAmount || 0)) {
      this.form.get('amount')?.setErrors({ exceedsBalance: true });
      return;
    }

    this.submitPayment.emit({
      amount,
      method: raw.method as PaymentMethod,
      paidAt: raw.paidAt || undefined,
      reference: raw.reference || undefined,
      notes: raw.notes || undefined,
    });
  }
}
