import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { CategoriesService, Category } from '../../service/categories.service';
import { CategoryFormComponent } from '../category-form/category-form.component';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CategoryFormComponent],
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss'],
})
export class CategoryListComponent implements OnInit {
  records = signal<Category[]>([]);
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
    private categoriesService: CategoriesService,
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  async loadData(): Promise<void> {
    this.loading.set(true);
    this.error.set('');

    try {
      this.records.set(await firstValueFrom(this.categoriesService.getCategories(this.searchQuery())));
    } catch (error: any) {
      this.error.set(error?.error?.message || error?.message || 'Failed to load categories.');
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
    this.form.reset({ name: '', description: '' });
    this.modalOpen.set(true);
  }

  async openEdit(item: Category): Promise<void> {
    this.modalMode.set('edit');
    this.selectedId.set(item._id);
    this.form.patchValue({
      name: item.name,
      description: item.description || '',
    });
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.form.reset();
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    try {
      const payload = this.cleanPayload(this.form.getRawValue()) as Partial<Category>;

      if (this.modalMode() === 'create') {
        await firstValueFrom(this.categoriesService.createCategory(payload));
      } else {
        await firstValueFrom(this.categoriesService.updateCategory(this.selectedId(), payload));
      }

      this.closeModal();
      await this.loadData();
    } catch (error: any) {
      this.error.set(error?.error?.message || error?.message || 'Failed to save category.');
    } finally {
      this.saving.set(false);
    }
  }

  async remove(id: string): Promise<void> {
    const confirmed = window.confirm('Delete this category?');
    if (!confirmed) {
      return;
    }

    await firstValueFrom(this.categoriesService.deleteCategory(id));
    await this.loadData();
  }

  private cleanPayload(payload: Record<string, any>): Partial<Category> {
    return Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== null && value !== undefined && value !== ''),
    ) as Partial<Category>;
  }
}