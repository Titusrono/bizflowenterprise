import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { PaymentProviderType } from '../../service/payments.service';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss'],
})
export class PaymentFormComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input() title = 'Payment';
  @Input() mode: 'create' | 'edit' = 'create';

  @Output() cancel = new EventEmitter<void>();

  providerTypeValue(): PaymentProviderType {
    return this.form.get('providerType')?.value as PaymentProviderType;
  }
}
