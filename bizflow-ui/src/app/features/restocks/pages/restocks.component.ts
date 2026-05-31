import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom, Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ScopeService } from '../../../core/services/scope.service';
import { Inventory, InventoryService } from '../../inventory/service/inventory.service';
import { RestockLineItem, RestockRequest, RestockRequestStatus, RestockService, RestockStats } from '../service/restock.service';

@Component({
  selector: 'app-restocks-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './restocks.component.html',
  styleUrls: ['./restocks.component.scss'],
})
export class RestocksComponent implements OnInit, OnDestroy {
  records = signal<RestockRequest[]>([]);
  stats = signal<RestockStats>({ total: 0, draft: 0, pending: 0, approved: 0, lineItems: 0 });
  inventoryOptions = signal<Inventory[]>([]);
  currentUser = signal<any>(null);
  loading = signal(false);
  saving = signal(false);
  error = signal('');
  modalOpen = signal(false);
  draftConfirmationOpen = signal(false);
  modalMode = signal<'create' | 'edit'>('create');
  selectedId = signal('');
  approvingId = signal('');
  rejectingId = signal('');
  selectedBranchId = signal('');
  // status options removed from form — status is set by actions (create/save)
  private subscriptions = new Subscription();
  readonly form;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private scopeService: ScopeService,
    private restockService: RestockService,
    private inventoryService: InventoryService,
  ) {
    this.currentUser.set(this.authService.getCurrentUser());
    this.selectedBranchId.set(this.scopeService.getSelectedBranchId() || this.currentUser()?.branchId || '');
    this.form = this.fb.group({
      referenceNumber: [''],
      notes: [''],
      lineItems: this.fb.array([this.createLineItemGroup()]),
    });
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.scopeService.selectedBranchId$.subscribe((branchId) => {
        const selected = branchId || this.currentUser()?.branchId || '';
        if (selected !== this.selectedBranchId()) {
          this.selectedBranchId.set(selected);
          void this.loadData();
        }
      }),
    );

    void this.loadData();
  }

  get lineItems(): FormArray {
    return this.form.get('lineItems') as FormArray;
  }

  async loadData(): Promise<void> {
    this.loading.set(true);
    this.error.set('');

    try {
      const branchId = this.selectedBranchId() || undefined;
      const orgId = this.scopeService.getSelectedOrganizationId() || this.currentUser()?.organizationId || '';
      const [stats, restocks, inventoryResponse] = await Promise.all([
        firstValueFrom(this.restockService.getRestockStats(branchId)),
        firstValueFrom(this.restockService.getRestocks(1, 20, branchId)),
        orgId
          ? firstValueFrom(this.inventoryService.getInventoryByOrganization(orgId, branchId, 1, 100))
          : firstValueFrom(this.inventoryService.getAllInventory(1, 100)),
      ]);

      this.stats.set(stats);
      this.records.set(restocks.data);
      this.inventoryOptions.set(inventoryResponse.data);
    } catch (error: any) {
      this.error.set(error?.error?.message || error?.message || 'Failed to load restocks.');
      this.records.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  openCreate(): void {
    this.modalMode.set('create');
    this.selectedId.set('');
    this.form.reset({
      referenceNumber: '',
      notes: '',
    });
    this.lineItems.clear();
    this.addLineItem();
    this.form.markAsPristine();
    this.modalOpen.set(true);
  }

  async openEdit(item: RestockRequest): Promise<void> {
    this.modalMode.set('edit');
    this.selectedId.set(item._id);
    this.form.patchValue({
      referenceNumber: item.referenceNumber || '',
      notes: item.notes || '',
    });
    this.lineItems.clear();
    for (const lineItem of item.lineItems || []) {
      this.lineItems.push(this.createLineItemGroup(lineItem));
    }
    if (!this.lineItems.length) {
      this.addLineItem();
    }
    this.modalOpen.set(true);
  }

  closeModal(): void {
    if (this.form.dirty && this.lineItems.length > 0 && this.lineItems.at(0).get('inventoryId')?.value) {
      this.draftConfirmationOpen.set(true);
      return;
    }
    this.closeDraftConfirmation();
  }

  closeDraftConfirmation(): void {
    this.draftConfirmationOpen.set(false);
    this.modalOpen.set(false);
    this.form.reset();
    this.lineItems.clear();
    this.addLineItem();
    this.form.markAsPristine();
  }

  async saveDraft(): Promise<void> {
    this.saving.set(true);
    try {
      const payload: any = this.buildPayload();
      payload.status = RestockRequestStatus.DRAFT;
      if (this.modalMode() === 'create') {
        await firstValueFrom(this.restockService.createRestock(payload));
      } else {
        await firstValueFrom(this.restockService.updateRestock(this.selectedId(), payload));
      }
      this.closeDraftConfirmation();
      await this.loadData();
    } catch (error: any) {
      this.error.set(error?.error?.message || error?.message || 'Failed to save draft restock request.');
    } finally {
      this.saving.set(false);
    }
  }

  addLineItem(item?: Partial<RestockLineItem>): void {
    this.lineItems.push(this.createLineItemGroup(item));
  }

  removeLineItem(index: number): void {
    if (this.lineItems.length === 1) {
      return;
    }
    this.lineItems.removeAt(index);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onInventorySelect(index: number): void {
    const lineItemGroup = this.lineItems.at(index);
    const inventoryId = lineItemGroup.get('inventoryId')?.value;
    const selected = this.inventoryOptions().find((item) => item._id === inventoryId);
    if (!selected) {
      return;
    }

    lineItemGroup.patchValue({
      sku: selected.sku,
      name: selected.name,
      unitCost: selected.costPrice || 0,
    });
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    try {
      const payload: any = this.buildPayload();

      if (this.modalMode() === 'create') {
        // create then submit to mark as pending
        const created = await firstValueFrom(this.restockService.createRestock(payload));
        console.log('SAVE_RESPONSE_CREATED', created);
        if (created && created._id) {
          const submitRes = await firstValueFrom(this.restockService.submitRestock(created._id));
          console.log('SUBMIT_RESPONSE_CREATED', submitRes);
        }
      } else {
        const current = this.records().find((r) => r._id === this.selectedId());
        const updated = await firstValueFrom(this.restockService.updateRestock(this.selectedId(), payload));
        console.log('SAVE_RESPONSE_UPDATED', updated);
        // if editing a draft, explicitly submit to move to pending
        if (current && current.status === RestockRequestStatus.DRAFT) {
          const submitRes = await firstValueFrom(this.restockService.submitRestock(this.selectedId()));
          console.log('SUBMIT_RESPONSE_UPDATED', submitRes);
        }
      }

      // close without showing draft confirmation
      this.form.markAsPristine();
      this.closeDraftConfirmation();
      await this.loadData();
    } catch (error: any) {
      this.error.set(error?.error?.message || error?.message || 'Failed to save restock request.');
    } finally {
      this.saving.set(false);
    }
  }

  async submit(id: string): Promise<void> {
    this.saving.set(true);
    try {
      await firstValueFrom(this.restockService.submitRestock(id));
      await this.loadData();
    } catch (error: any) {
      this.error.set(error?.error?.message || error?.message || 'Failed to submit restock request.');
    } finally {
      this.saving.set(false);
    }
  }

  async approve(item: RestockRequest): Promise<void> {
    const confirmed = window.confirm('Approve this restock request and update inventory quantities?');
    if (!confirmed) return;

    this.approvingId.set(item._id);
    try {
      await firstValueFrom(this.restockService.approveRestock(item._id));
      await this.loadData();
    } catch (error: any) {
      this.error.set(error?.error?.message || error?.message || 'Failed to approve restock request.');
    } finally {
      this.approvingId.set('');
    }
  }

  async reject(item: RestockRequest): Promise<void> {
    const confirmed = window.confirm('Reject this restock request?');
    if (!confirmed) return;

    this.rejectingId.set(item._id);
    try {
      await firstValueFrom(this.restockService.rejectRestock(item._id, 'Rejected from restock queue'));
      await this.loadData();
    } catch (error: any) {
      this.error.set(error?.error?.message || error?.message || 'Failed to reject restock request.');
    } finally {
      this.rejectingId.set('');
    }
  }

  statusLabel(status: string): string {
    return status ? status.toUpperCase() : 'UNKNOWN';
  }

  actionHint(status: string): string {
    switch (status) {
      case RestockRequestStatus.DRAFT:
        return 'Draft requests can be edited and submitted to pending.';
      case RestockRequestStatus.PENDING:
        return 'Pending requests can be approved or rejected.';
      case RestockRequestStatus.APPROVED:
        return 'This request has been approved.';
      case RestockRequestStatus.REJECTED:
        return 'This request has been rejected.';
      default:
        return 'Status unavailable.';
    }
  }

  inventoryLabel(item: Inventory): string {
    return `${item.name} (${item.sku})`;
  }

  private createLineItemGroup(item?: Partial<RestockLineItem>) {
    return this.fb.group({
      inventoryId: [item?.inventoryId || '', Validators.required],
      sku: [item?.sku || ''],
      name: [item?.name || ''],
      requestedQuantity: [item?.requestedQuantity ?? 1, [Validators.required, Validators.min(1)]],
      approvedQuantity: [item?.approvedQuantity ?? item?.requestedQuantity ?? 1, [Validators.required, Validators.min(0)]],
      unitCost: [item?.unitCost ?? 0, [Validators.required, Validators.min(0)]],
      notes: [item?.notes || ''],
    });
  }

  private buildPayload() {
    const raw = this.form.getRawValue();
    const organizationId = this.currentUser()?.organizationId || undefined;
    let branchId = this.currentUser()?.branchId || undefined;

    if (!branchId) {
      const selectedBranchIds = raw.lineItems
        .map((lineItem: any) => this.inventoryOptions().find((item) => item._id === lineItem.inventoryId)?.branchId)
        .filter(Boolean) as string[];
      const uniqueBranchIds = Array.from(new Set(selectedBranchIds));
      if (uniqueBranchIds.length > 1) {
        throw new Error('Selected inventory items must belong to the same branch.');
      }
      branchId = uniqueBranchIds[0];
    }

    return {
      referenceNumber: raw.referenceNumber?.trim() || undefined,
      notes: raw.notes?.trim() || undefined,
      organizationId,
      branchId,
      lineItems: raw.lineItems.map((lineItem: any) => ({
        inventoryId: lineItem.inventoryId,
        requestedQuantity: Number(lineItem.requestedQuantity),
        approvedQuantity: Number(lineItem.approvedQuantity),
        unitCost: Number(lineItem.unitCost),
        notes: lineItem.notes?.trim() || undefined,
      })),
    };
  }
}
