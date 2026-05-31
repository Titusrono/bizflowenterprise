import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-tax-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tax-form.component.html',
  styleUrls: ['./tax-form.component.scss'],
})
export class TaxFormComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input() title = 'Tax';
  @Input() mode: 'create' | 'edit' = 'create';

  @Output() cancel = new EventEmitter<void>();
}