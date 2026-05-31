import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { SuppliersService, Supplier } from '../../service/suppliers.service';
import { SupplierFormComponent } from '../supplier-form/supplier-form.component';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SupplierFormComponent],
  templateUrl: './supplier-list.component.html',
  styleUrls: ['./supplier-list.component.scss'],
})
export class SupplierListComponent implements OnInit {
  records = signal<Supplier[]>([]);
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
    private suppliersService: SuppliersService,
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      phoneNumber: [''],
      email: [''],
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  async loadData(): Promise<void> {
    this.loading.set(true);
    this.error.set('');

    try {
      this.records.set(await firstValueFrom(this.suppliersService.getSuppliers(this.searchQuery())));
    } catch (error: any) {
      this.error.set(error?.error?.message || error?.message || 'Failed to load suppliers.');
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
    this.form.reset({ name: '', phoneNumber: '', email: '' });
    this.modalOpen.set(true);
  }

  async openEdit(item: Supplier): Promise<void> {
    this.modalMode.set('edit');
    this.selectedId.set(item._id);
    this.form.patchValue({
      name: item.name,
      phoneNumber: item.phoneNumber || '',
      email: item.email || '',
    });
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.form.reset({ name: '', phoneNumber: '', email: '' });
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    try {
      const payload = this.cleanPayload(this.form.getRawValue()) as Partial<Supplier>;

      if (this.modalMode() === 'create') {
        await firstValueFrom(this.suppliersService.createSupplier(payload));
      } else {
        await firstValueFrom(this.suppliersService.updateSupplier(this.selectedId(), payload));
      }

      this.closeModal();
      await this.loadData();
    } catch (error: any) {
      this.error.set(error?.error?.message || error?.message || 'Failed to save supplier.');
    } finally {
      this.saving.set(false);
    }
  }

  async remove(id: string): Promise<void> {
    const confirmed = window.confirm('Delete this supplier?');
    if (!confirmed) {
      return;
    }

    await firstValueFrom(this.suppliersService.deleteSupplier(id));
    await this.loadData();
  }

  contactLabel(item: Supplier): string {
    const parts = [item.phoneNumber, item.email].filter((value) => value && value.trim()).map((value) => value?.trim());
    return parts.length ? parts.join(' • ') : 'No contact details set';
  }

  private cleanPayload(payload: Record<string, any>): Partial<Supplier> {
    return Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== null && value !== undefined && value !== ''),
    ) as Partial<Supplier>;
  }
}