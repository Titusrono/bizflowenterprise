import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Inventory } from '../../../inventory/service/inventory.service';

@Component({
  selector: 'app-restock-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './restock-form.component.html',
  styleUrls: ['./restock-form.component.scss'],
})
export class RestockFormComponent {
  @Input({ required: true }) form!: ReturnType<FormBuilder['group']>;
  @Input() inventoryOptions: Inventory[] = [];
  @Input() title = 'Restock Request';
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() saving = false;

  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() addLineItem = new EventEmitter<void>();
  @Output() removeLineItem = new EventEmitter<number>();
  @Output() inventorySelected = new EventEmitter<number>();

  get lineItems(): FormArray {
    return this.form.get('lineItems') as FormArray;
  }

  inventoryLabel(item: Inventory): string {
    return `${item.name} (${item.sku})`;
  }
}