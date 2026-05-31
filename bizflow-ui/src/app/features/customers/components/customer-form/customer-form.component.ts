import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.scss'],
})
export class CustomerFormComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input() title = 'Customer';
  @Input() mode: 'create' | 'edit' = 'create';

  @Output() cancel = new EventEmitter<void>();
}