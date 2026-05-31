import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { TaxesService, Tax } from '../../service/taxes.service';
import { TaxFormComponent } from '../tax-form/tax-form.component';

@Component({
  selector: 'app-tax-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TaxFormComponent],
  templateUrl: './tax-list.component.html',
  styleUrls: ['./tax-list.component.scss'],
})
export class TaxListComponent implements OnInit {
  records = signal<Tax[]>([]);
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
    private taxesService: TaxesService,
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      percentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  async loadData(): Promise<void> {
    this.loading.set(true);
    this.error.set('');

    try {
      this.records.set(await firstValueFrom(this.taxesService.getTaxes(this.searchQuery())));
    } catch (error: any) {
      this.error.set(error?.error?.message || error?.message || 'Failed to load taxes.');
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
    this.form.reset({ name: '', percentage: 0 });
    this.modalOpen.set(true);
  }

  async openEdit(item: Tax): Promise<void> {
    this.modalMode.set('edit');
    this.selectedId.set(item._id);
    this.form.patchValue({
      name: item.name,
      percentage: item.percentage,
    });
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.form.reset({ name: '', percentage: 0 });
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    try {
      const payload = this.cleanPayload(this.form.getRawValue()) as Partial<Tax>;

      if (this.modalMode() === 'create') {
        await firstValueFrom(this.taxesService.createTax(payload));
      } else {
        await firstValueFrom(this.taxesService.updateTax(this.selectedId(), payload));
      }

      this.closeModal();
      await this.loadData();
    } catch (error: any) {
      this.error.set(error?.error?.message || error?.message || 'Failed to save tax.');
    } finally {
      this.saving.set(false);
    }
  }

  async remove(id: string): Promise<void> {
    const confirmed = window.confirm('Delete this tax?');
    if (!confirmed) {
      return;
    }

    await firstValueFrom(this.taxesService.deleteTax(id));
    await this.loadData();
  }

  percentageLabel(value: number): string {
    return `${Number(value || 0).toFixed(2)}%`;
  }

  averagePercentage(): number {
    const count = this.records().length;
    if (!count) {
      return 0;
    }

    return this.records().reduce((sum, item) => sum + Number(item.percentage || 0), 0) / count;
  }

  private cleanPayload(payload: Record<string, any>): Partial<Tax> {
    return Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== null && value !== undefined && value !== ''),
    ) as Partial<Tax>;
  }
}