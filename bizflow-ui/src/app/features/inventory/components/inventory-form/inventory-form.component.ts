import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-inventory-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inventory-form.component.html',
  styleUrls: ['./inventory-form.component.scss'],
})
export class InventoryFormComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input() title = 'Inventory Item';
  @Input() mode: 'create' | 'edit' = 'create';

  @Output() cancel = new EventEmitter<void>();
}
