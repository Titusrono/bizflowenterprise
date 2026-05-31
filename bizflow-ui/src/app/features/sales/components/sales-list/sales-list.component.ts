import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, Subscription } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { ScopeService } from '../../../../core/services/scope.service';
import { Inventory, InventoryService } from '../../../inventory/service/inventory.service';
import {
  CreateSalePayload,
  PaymentMethod,
  SaleRecord,
  SaleStats,
  SaleType,
  SalesService,
} from '../../service/sales.service';
import { PaymentModalComponent } from '../payment-modal/payment-modal.component';

@Component({
  selector: 'app-sales-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PaymentModalComponent],
  templateUrl: './sales-list.component.html',
  styleUrls: ['./sales-list.component.scss'],
})
export class SalesListComponent implements OnInit, OnDestroy {
  records = signal<SaleRecord[]>([]);
  inventoryOptions = signal<Inventory[]>([]);
  stats = signal<SaleStats>({
    totalSales: 0,
    cashSales: 0,
    creditSales: 0,
    paidSales: 0,
    unpaidSales: 0,
    partialSales: 0,
    openInvoices: 0,
    clearedInvoices: 0,
    totalValue: 0,
    totalCollected: 0,
    totalOutstanding: 0,
  });
  currentUser = signal<any>(null);
  selectedBranchId = signal('');
  activeTab = signal<SaleType>('cash');
  scopedType = signal<SaleType | null>(null);
  loading = signal(false);
  saving = signal(false);
  error = signal('');

  saleModalOpen = signal(false);
  paymentModalOpen = signal(false);
  selectedSaleForPayment = signal<SaleRecord | null>(null);

  private subscriptions = new Subscription();

  readonly saleForm;

  readonly activeRecords = computed(() => this.records().filter((record) => record.saleType === this.activeTab()));
  readonly filteredActiveRecords = computed(() => {
    const start = this.startDate() ? new Date(this.startDate() as string) : null;
    const end = this.endDate() ? new Date(this.endDate() as string) : null;
    return this.records()
      .filter((r) => r.saleType === this.activeTab())
      .filter((r) => {
        if (!start && !end) return true;
        const created = new Date(r.createdAt);
        if (start && created < start) return false;
        if (end) {
          const endOfDay = new Date(end);
          endOfDay.setHours(23, 59, 59, 999);
          if (created > endOfDay) return false;
        }
        return true;
      });
  });

  readonly filteredAllRecords = computed(() => {
    const start = this.startDate() ? new Date(this.startDate() as string) : null;
    const end = this.endDate() ? new Date(this.endDate() as string) : null;
    return this.records().filter((r) => {
      if (!start && !end) return true;
      const created = new Date(r.createdAt);
      if (start && created < start) return false;
      if (end) {
        const endOfDay = new Date(end);
        endOfDay.setHours(23, 59, 59, 999);
        if (created > endOfDay) return false;
      }
      return true;
    });
  });

  readonly showCombined = computed(() => this.router.url.includes('/sales/stats'));

  readonly visibleRecords = computed(() => (this.showCombined() ? this.filteredAllRecords() : this.filteredActiveRecords()));
    startDate = signal<string | null>(null);
    endDate = signal<string | null>(null);
  readonly summaryCards = computed(() => {
    const sourceStats = this.useComputedStats() ? this.computedStats() : this.stats();

    if (this.showCombined()) {
      return [
        { label: 'Total Cash', value: Number(sourceStats.totalCash || 0) },
        { label: 'Cash Sales Revenue', value: Number(sourceStats.revenueCashSales || 0) },
        { label: 'Paid Invoices Revenue', value: Number(sourceStats.revenuePaidInvoices || 0) },
        { label: 'Credit Revenue', value: Number(sourceStats.revenueCredits || 0) },
        { label: 'Pending Invoices', value: Number(sourceStats.openInvoices || 0) },
      ];
    }

    if (this.activeTab() === 'credit') {
      return [
        { label: 'Credit Sales', value: sourceStats.creditSales },
        { label: 'Open Invoices', value: sourceStats.openInvoices },
        { label: 'Cleared Invoices', value: sourceStats.clearedInvoices },
        { label: 'Outstanding', value: Number(sourceStats.totalOutstanding || 0) },
      ];
    }

    return [
      { label: 'Cash Sales', value: sourceStats.cashSales },
      { label: 'Collected', value: Number(sourceStats.totalCollected || 0) },
      { label: 'Paid Sales', value: sourceStats.paidSales },
      { label: 'Total Value', value: Number(sourceStats.totalValue || 0) },
    ];
  });

  readonly useComputedStats = computed(() => Boolean(this.startDate() || this.endDate()));

  readonly computedStats = computed((): SaleStats => {
    const recs = (this.startDate() || this.endDate()) ? this.records().filter((r) => {
      const start = this.startDate() ? new Date(this.startDate() as string) : null;
      const end = this.endDate() ? new Date(this.endDate() as string) : null;
      const created = new Date(r.createdAt);
      if (start && created < start) return false;
      if (end) {
        const endOfDay = new Date(end);
        endOfDay.setHours(23, 59, 59, 999);
        if (created > endOfDay) return false;
      }
      return true;
    }) : this.records();

    // base aggregates
    const totalSales = recs.length;
    const cashSalesCount = recs.filter((r) => r.saleType === 'cash').length;
    const creditSalesCount = recs.filter((r) => r.saleType === 'credit').length;
    const paidSalesCount = recs.filter((r) => r.paymentStatus === 'paid').length;
    const unpaidSalesCount = recs.filter((r) => r.paymentStatus === 'unpaid').length;
    const partialSalesCount = recs.filter((r) => r.paymentStatus === 'partial').length;
    const openInvoicesCount = recs.filter((r) => r.invoiceStatus === 'open').length;
    const clearedInvoicesCount = recs.filter((r) => r.invoiceStatus === 'cleared').length;
    const totalValue = recs.reduce((s, r) => s + Number(r.subtotal || 0), 0);
    const totalCollected = recs.reduce((s, r) => s + Number(r.totalPaid || 0), 0);
    const totalOutstanding = recs.reduce((s, r) => s + Number(r.balanceDue || 0), 0);

    // revenue breakdowns
    const revenueCashSales = recs.filter((r) => r.saleType === 'cash').reduce((s, r) => s + Number(r.subtotal || 0), 0);
    const paidInvoices = recs.filter((r) => r.saleType === 'credit' && (r.invoiceStatus === 'cleared' || r.paymentStatus === 'paid'));
    const revenuePaidInvoices = paidInvoices.reduce((s, r) => s + Number(r.subtotal || 0), 0);
    const revenueCredits = recs.filter((r) => r.saleType === 'credit').reduce((s, r) => s + Number(r.subtotal || 0), 0);

    // total cash = cash sales subtotal + paid invoices subtotal
    const totalCash = revenueCashSales + revenuePaidInvoices;

    // payment method breakdown across all recorded payments
    let bankTotal = 0;
    let cashTotal = 0;
    let mpesaTotal = 0;
    let otherTotal = 0;
    for (const r of recs) {
      (r.payments || []).forEach((p) => {
        const method = (p.method || 'other') as string;
        if (method === 'bank' || method === 'cash' || method === 'mpesa') {
          if (method === 'bank') {
            bankTotal += Number(p.amount || 0);
          } else if (method === 'cash') {
            cashTotal += Number(p.amount || 0);
          } else {
            mpesaTotal += Number(p.amount || 0);
          }
        } else {
          otherTotal += Number(p.amount || 0);
        }
      });
    }

    const stats: SaleStats = {
      totalSales,
      cashSales: cashSalesCount,
      creditSales: creditSalesCount,
      paidSales: paidSalesCount,
      unpaidSales: unpaidSalesCount,
      partialSales: partialSalesCount,
      openInvoices: openInvoicesCount,
      clearedInvoices: clearedInvoicesCount,
      totalValue,
      totalCollected,
      totalOutstanding,
      totalCash,
      revenueCashSales,
      revenuePaidInvoices,
      revenueCredits,
      paymentMethodBreakdown: {
        bank: bankTotal,
        cash: cashTotal,
        mpesa: mpesaTotal,
        other: otherTotal,
      },
    };

    return stats;
  });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private scopeService: ScopeService,
    private inventoryService: InventoryService,
    private salesService: SalesService,
  ) {
    this.currentUser.set(this.authService.getCurrentUser());
    this.selectedBranchId.set(this.scopeService.getSelectedBranchId() || this.currentUser()?.branchId || '');

    this.saleForm = this.fb.group({
      customerName: [''],
      customerPhone: [''],
      notes: [''],
      invoiceDueDate: [''],
      lineItems: this.fb.array([this.createLineItemGroup()]),
    });
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.route.queryParamMap.subscribe((params) => {
        const type = params.get('type');
        if (type === 'credit') {
          this.scopedType.set('credit');
          this.activeTab.set('credit');
          return;
        }

        if (type === 'cash') {
          this.scopedType.set('cash');
          this.activeTab.set('cash');
          return;
        }

        this.scopedType.set(null);
      }),
    );

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

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get lineItems(): FormArray {
    return this.saleForm.get('lineItems') as FormArray;
  }

  async loadData(): Promise<void> {
    this.loading.set(true);
    this.error.set('');

    try {
      const branchId = this.selectedBranchId() || undefined;
      const orgId = this.scopeService.getSelectedOrganizationId() || this.currentUser()?.organizationId || '';

      const [stats, cashSales, creditSales, inventoryResponse] = await Promise.all([
        firstValueFrom(this.salesService.getSalesStats(branchId)),
        firstValueFrom(this.salesService.getSales(1, 100, branchId, 'cash')),
        firstValueFrom(this.salesService.getSales(1, 100, branchId, 'credit')),
        orgId
          ? firstValueFrom(this.inventoryService.getInventoryByOrganization(orgId, branchId, 1, 200))
          : firstValueFrom(this.inventoryService.getAllInventory(1, 200)),
      ]);

      this.stats.set(stats);
      this.records.set([...cashSales.data, ...creditSales.data]);
      this.inventoryOptions.set(inventoryResponse.data);
    } catch (error: any) {
      this.error.set(error?.error?.message || error?.message || 'Failed to load sales data.');
      this.records.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  switchTab(tab: SaleType): void {
    if (this.scopedType()) {
      return;
    }

    this.activeTab.set(tab);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { type: tab },
      queryParamsHandling: 'merge',
    });
  }

  openCreateSale(type: SaleType): void {
    if (!this.scopedType()) {
      this.activeTab.set(type);
    }

    this.saleForm.reset({
      customerName: '',
      customerPhone: '',
      notes: '',
      invoiceDueDate: '',
    });

    this.lineItems.clear();
    this.addLineItem();
    this.saleModalOpen.set(true);
    this.error.set('');
  }

  closeCreateSale(): void {
    this.saleModalOpen.set(false);
    this.saleForm.reset();
    this.lineItems.clear();
    this.addLineItem();
  }

  addLineItem(): void {
    this.lineItems.push(this.createLineItemGroup());
  }

  removeLineItem(index: number): void {
    if (this.lineItems.length <= 1) {
      return;
    }
    this.lineItems.removeAt(index);
  }

  onInventorySelect(index: number): void {
    const group = this.lineItems.at(index);
    const inventoryId = group.get('inventoryId')?.value;
    const selected = this.inventoryOptions().find((item) => item._id === inventoryId);

    if (!selected) {
      return;
    }

    group.patchValue({
      sku: selected.sku,
      name: selected.name,
      unitPrice: selected.unitPrice || 0,
      availableQuantity: selected.quantity || 0,
    });
  }

  async saveSale(): Promise<void> {
    if (this.saleForm.invalid) {
      this.saleForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set('');

    try {
      const payload = this.buildSalePayload();
      await firstValueFrom(this.salesService.createSale(payload));
      this.closeCreateSale();
      await this.loadData();
    } catch (error: any) {
      this.error.set(error?.error?.message || error?.message || 'Failed to create sale.');
    } finally {
      this.saving.set(false);
    }
  }

  openPaymentModal(record: SaleRecord): void {
    this.selectedSaleForPayment.set(record);
    this.paymentModalOpen.set(true);
  }

  closePaymentModal(): void {
    this.paymentModalOpen.set(false);
    this.selectedSaleForPayment.set(null);
  }

  async submitPayment(payload: {
    amount: number;
    method: PaymentMethod;
    paidAt?: string;
    reference?: string;
    notes?: string;
  }): Promise<void> {
    const selected = this.selectedSaleForPayment();
    if (!selected) {
      return;
    }

    this.saving.set(true);
    this.error.set('');

    try {
      await firstValueFrom(
        this.salesService.recordPayment(selected._id, {
          payment: payload,
        }),
      );
      this.closePaymentModal();
      await this.loadData();
    } catch (error: any) {
      this.error.set(error?.error?.message || error?.message || 'Failed to record payment.');
    } finally {
      this.saving.set(false);
    }
  }

  paymentStatusLabel(status: string): string {
    return status ? status.toUpperCase() : 'UNKNOWN';
  }

  invoiceStatusLabel(status: string): string {
    return status ? status.toUpperCase() : 'UNKNOWN';
  }

  trackBalance(record: SaleRecord): number {
    return Number(record.balanceDue || 0);
  }

  inventoryLabel(item: Inventory): string {
    return `${item.name} (${item.sku}) • ${item.quantity} in stock`;
  }

  currentDraftTotal(): number {
    const raw = this.saleForm.getRawValue();
    return (raw.lineItems || []).reduce((sum: number, item: any) => {
      const quantity = Number(item.quantity || 0);
      const unitPrice = Number(item.unitPrice || 0);
      return sum + quantity * unitPrice;
    }, 0);
  }

  saleMode(): SaleType {
    return this.scopedType() || this.activeTab();
  }

  pageHeading(): string {
    if (this.activeTab() === 'credit') {
      return 'Credit Sales & Invoices';
    }

    return 'Sales';
  }

  pageDescription(): string {
    if (this.activeTab() === 'credit') {
      return 'Create and manage credit invoices, track outstanding balances, and clear payments over time.';
    }

    return 'Create instant cash sales, reduce stock immediately, and track same-day payment collection.';
  }

  registerDescription(): string {
    if (this.activeTab() === 'credit') {
      return 'View credit invoices, payment progress, and outstanding balances.';
    }

    return 'View completed cash sales and payment collection records.';
  }

  private createLineItemGroup() {
    return this.fb.group({
      inventoryId: ['', Validators.required],
      sku: [''],
      name: [''],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      availableQuantity: [0],
    });
  }

  private buildSalePayload(): CreateSalePayload {
    const raw = this.saleForm.getRawValue();
    const saleTotal = this.currentDraftTotal();
    const saleType = this.saleMode();

    const payload: CreateSalePayload = {
      saleType,
      customerName: raw.customerName || undefined,
      customerPhone: raw.customerPhone || undefined,
      notes: raw.notes || undefined,
      invoiceDueDate: saleType === 'credit' ? (raw.invoiceDueDate || undefined) : undefined,
      organizationId: this.scopeService.getSelectedOrganizationId() || this.currentUser()?.organizationId || undefined,
      branchId: this.selectedBranchId() || this.currentUser()?.branchId || undefined,
      lineItems: raw.lineItems.map((line: any) => ({
        inventoryId: line.inventoryId,
        quantity: Number(line.quantity),
        unitPrice: Number(line.unitPrice),
      })),
    };

    if (saleType === 'cash') {
      payload.payments = [
        {
          amount: saleTotal,
          method: 'cash',
        },
      ];
    }

    return payload;
  }
}
