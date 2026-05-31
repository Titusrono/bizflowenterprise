import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-supplier-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './supplier-form.component.html',
  styleUrls: ['./supplier-form.component.scss'],
})
export class SupplierFormComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input() title = 'Supplier';
  @Input() mode: 'create' | 'edit' = 'create';

  @Output() cancel = new EventEmitter<void>();
}