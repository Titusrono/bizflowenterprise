import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom, Subscription } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { ScopeService } from '../../../../core/services/scope.service';
import { CategoriesService, Category } from '../../../categories/service/categories.service';
import { InventoryFormComponent } from '../inventory-form/inventory-form.component';
import { Inventory, InventoryService, InventoryStats } from '../../service/inventory.service';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InventoryFormComponent],
  templateUrl: './inventory-list.component.html',
  styleUrls: ['./inventory-list.component.scss'],
})
export class InventoryListComponent implements OnInit, OnDestroy {
  records = signal<Inventory[]>([]);
  categories = signal<Category[]>([]);
  stats = signal<InventoryStats>({ total: 0, active: 0, lowStock: 0, outOfStock: 0 });
  loading = signal(false);
  saving = signal(false);
  error = signal('');
  modalOpen = signal(false);
  modalMode = signal<'create' | 'edit'>('create');
  selectedId = signal('');
  currentUser = signal<any>(null);
  selectedBranchId = signal('');
  private subscriptions = new Subscription();
  readonly form;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private scopeService: ScopeService,
    private inventoryService: InventoryService,
    private categoriesService: CategoriesService,
  ) {
    this.currentUser.set(this.authService.getCurrentUser());
    this.selectedBranchId.set(this.scopeService.getSelectedBranchId() || this.currentUser()?.branchId || '');
    this.form = this.fb.group({
      name: ['', Validators.required],
      sku: ['', Validators.required],
      description: [''],
      category: [''],
      quantity: [0, [Validators.required, Validators.min(0)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      costPrice: [0, [Validators.required, Validators.min(0)]],
      reorderLevel: [0, [Validators.required, Validators.min(0)]],
      location: [''],
      organizationId: [this.currentUser()?.organizationId || '', Validators.required],
      branchId: [this.currentUser()?.branchId || ''],
      status: ['active', Validators.required],
    });
  }

  async ngOnInit(): Promise<void> {
    this.subscriptions.add(
      this.scopeService.selectedBranchId$.subscribe((branchId) => {
        const selected = branchId || this.currentUser()?.branchId || '';
        if (selected !== this.selectedBranchId()) {
          this.selectedBranchId.set(selected);
          void this.loadData();
        }
      }),
    );

    await this.loadData();
  }

  async loadData(): Promise<void> {
    this.loading.set(true);
    this.error.set('');

    try {
      const orgId = this.currentUser()?.organizationId || '';
      const branchId = this.selectedBranchId() || undefined;
      const [stats, response] = await Promise.all([
        orgId
          ? firstValueFrom(this.inventoryService.getOrganizationInventoryStats(orgId, branchId))
          : firstValueFrom(this.inventoryService.getInventoryStats()),
        orgId
          ? firstValueFrom(this.inventoryService.getInventoryByOrganization(orgId, branchId, 1, 20))
          : firstValueFrom(this.inventoryService.getAllInventory(1, 20)),
      ]);
      this.stats.set(stats);
      this.records.set(response.data);

      try {
        this.categories.set(await firstValueFrom(this.categoriesService.getCategories()));
      } catch {
        this.categories.set([]);
      }
    } catch (error: any) {
      this.error.set(error?.error?.message || error?.message || 'Failed to load inventory.');
      this.records.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  openCreate(): void {
    this.modalMode.set('create');
    this.selectedId.set('');
    this.form.reset({
      quantity: 0,
      unitPrice: 0,
      costPrice: 0,
      reorderLevel: 0,
      status: 'active',
      organizationId: this.currentUser()?.organizationId || '',
      branchId: this.currentUser()?.branchId || '',
    });
    this.modalOpen.set(true);
  }

  async openEdit(item: Inventory): Promise<void> {
    this.modalMode.set('edit');
    this.selectedId.set(item._id);
    this.form.patchValue({
      ...item,
      organizationId: this.currentUser()?.organizationId || item.organizationId || '',
      branchId: this.currentUser()?.branchId || item.branchId || '',
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
      const payload = this.cleanPayload(this.form.getRawValue()) as Partial<Inventory>;
      if (!payload.branchId && this.selectedBranchId()) {
        payload.branchId = this.selectedBranchId();
      }

      if (this.modalMode() === 'create') {
        await firstValueFrom(this.inventoryService.createInventory(payload));
      } else {
        await firstValueFrom(this.inventoryService.updateInventory(this.selectedId(), payload));
      }

      this.closeModal();
      await this.loadData();
    } catch (error: any) {
      this.error.set(error?.error?.message || error?.message || 'Failed to save inventory.');
    } finally {
      this.saving.set(false);
    }
  }

  async remove(id: string): Promise<void> {
    const confirmed = window.confirm('Delete this inventory item?');
    if (!confirmed) return;

    await firstValueFrom(this.inventoryService.deleteInventory(id));
    await this.loadData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private cleanPayload(payload: Record<string, any>): Partial<Inventory> {
    return Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== null && value !== undefined && value !== ''),
    ) as Partial<Inventory>;
  }
}
