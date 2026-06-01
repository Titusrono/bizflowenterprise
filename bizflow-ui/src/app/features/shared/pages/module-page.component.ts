import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { UserRole } from '../../../core/models';
import { AuthService } from '../../../core/services/auth.service';
import { ScopeService } from '../../../core/services/scope.service';
import {
  OrganizationsService,
  Organization,
  OrganizationStats,
} from '../../../core/services/organizations.service';
import {
  BranchesService,
  Branch,
  BranchStats,
} from '../../../core/services/branches.service';
import {
  UsersService,
  User,
  UserStats,
} from '../../../core/services/users.service';
import { PurchasesService } from '../../purchases/service/purchases.service';
import { BillsService } from '../../bills/service/bills.service';
import { ExpensesService } from '../../expenses/service/expenses.service';
import { PaymentModalComponent } from '../../sales/components/payment-modal/payment-modal.component';

import { PurchaseFormComponent } from '../../purchases/components/purchase-form/purchase-form.component';
import { BillFormComponent } from '../../bills/components/bill-form/bill-form.component';
import { ExpenseFormComponent } from '../../expenses/components/expense-form/expense-form.component';

interface ModuleStat {
  label: string;
  value: string;
  change: string;
  icon: string;
}

interface DisplayRecord {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  updatedAt: string;
  icon: string;
  metaPrimary: string;
  metaSecondary?: string;
  metaTertiary?: string;
}

type ModuleKind = 'organizations' | 'branches' | 'users' | 'other';
type ModalMode = 'create' | 'edit';

@Component({
  selector: 'app-module-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PurchaseFormComponent, BillFormComponent, ExpenseFormComponent, PaymentModalComponent],
  template: `
    <section class="space-y-6">
      <div class="flex items-start justify-between gap-4 flex-wrap sticky top-4 z-40 bg-inherit py-3">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">
            {{ category() }}
          </p>
          <h1 class="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mt-2">
            {{ title() }}
          </h1>
          <p class="text-neutral-600 dark:text-neutral-400 mt-2 max-w-3xl">
            {{ description() }}
          </p>
        </div>

        <div class="flex items-center gap-3">
          <ng-container *ngIf="headerBranches().length">
            <div class="space-y-1">
              <label class="text-sm text-neutral-500 dark:text-neutral-400">Branch</label>
              <select class="input-field" [value]="scopeBranchId()" (change)="onBranchScopeChange($any($event.target).value)">
                <option *ngFor="let b of headerBranches()" [value]="b._id">{{ b.name }} ({{ b.code }})</option>
              </select>
            </div>
          </ng-container>

          <button class="btn btn-ghost" type="button" (click)="reload()">
            <i class="bi bi-arrow-clockwise me-2"></i>
            Refresh
          </button>
          <button class="btn btn-primary" type="button" (click)="openCreateModal()">
            <i class="bi bi-plus-lg me-2"></i>
            New {{ shortLabel() }}
          </button>
        </div>
      </div>

      <div class="card border border-neutral-200/70 dark:border-neutral-800" *ngIf="!isPurchaseModule() && !isBillModule() && !isExpenseModule()">
        <div class="card-body grid gap-4 lg:grid-cols-3 p-4 md:p-5">
          <label class="block space-y-2 lg:col-span-2">
            <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">Search</span>
            <input
              class="input-field"
              type="search"
              [value]="searchQuery()"
              (input)="onSearch($any($event.target).value)"
              placeholder="Search by name, code, email, or location"
            />
          </label>

          <div *ngIf="showOrganizationScope()" class="space-y-2">
            <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">Organization</span>
            <select
              class="input-field"
              [value]="scopeOrganizationId()"
              (change)="onOrganizationScopeChange($any($event.target).value)"
            >
              <option value="">Select organization</option>
              <option *ngFor="let organization of organizationOptions()" [value]="organization._id">
                {{ organization.name }} ({{ organization.code }})
              </option>
            </select>
          </div>

          <div *ngIf="showBranchScope()" class="space-y-2">
            <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">Branch</span>
            <select
              class="input-field"
              [value]="scopeBranchId()"
              (change)="onBranchScopeChange($any($event.target).value)"
            >
              <option *ngFor="let branch of branchOptions()" [value]="branch._id">
                {{ branch.name }} ({{ branch.code }})
              </option>
            </select>
          </div>

          <div *ngIf="!showOrganizationScope() && currentUser()?.organizationId" class="rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-700 p-4 lg:col-span-3">
            <p class="text-sm font-semibold text-neutral-700 dark:text-neutral-200">Scoped to your organization</p>
            <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">All branch and user records stay within the active organization relationship.</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div *ngFor="let stat of stats()" class="card">
          <div class="card-body p-5">
            <div class="flex items-center justify-between gap-4 mb-3">
              <p class="text-sm font-medium text-neutral-600 dark:text-neutral-400">{{ stat.label }}</p>
              <i class="bi" [ngClass]="stat.icon + ' text-lg text-primary-500'"></i>
            </div>
            <div class="flex items-end justify-between gap-4">
              <p class="text-2xl font-bold text-neutral-900 dark:text-white">{{ stat.value }}</p>
              <span class="text-xs font-semibold text-success-600 dark:text-success-400">{{ stat.change }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card border border-neutral-200/70 dark:border-neutral-800">
        <div class="card-header flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 class="text-lg font-semibold text-neutral-900 dark:text-white">Live records</h2>
            <p class="text-sm text-neutral-600 dark:text-neutral-400">
              {{ filteredRecords().length }} record(s) shown from the latest API response.
            </p>
          </div>
          <span class="badge badge-primary">{{ loading() ? 'Refreshing' : 'Live' }}</span>
        </div>

        <div class="card-body p-0">
          <div *ngIf="error(); else tableState" class="p-6">
            <div class="alert alert-danger">
              <i class="bi bi-exclamation-triangle-fill mt-0.5"></i>
              <div>
                <p class="font-semibold">Could not load records</p>
                <p class="text-sm">{{ error() }}</p>
              </div>
            </div>
          </div>

          <ng-template #tableState>
            <div *ngIf="loading()" class="p-6">
              <div class="rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-700 min-h-[15rem] flex items-center justify-center">
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Loading live records...</p>
              </div>
            </div>

            <div *ngIf="!loading() && filteredRecords().length; else emptyState" class="overflow-x-auto">
              <table class="table min-w-full">
                <thead>
                  <tr>
                    <th>Record</th>
                    <th>Details</th>
                    <th>Updated</th>
                    <th>Status</th>
                    <th class="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let record of filteredRecords()">
                    <td>
                      <div class="flex items-start gap-3">
                        <div class="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-300 shrink-0">
                          <i class="bi" [ngClass]="record.icon"></i>
                        </div>
                        <div class="min-w-0">
                          <p class="font-semibold text-neutral-900 dark:text-white truncate">{{ record.title }}</p>
                          <p class="text-sm text-neutral-500 dark:text-neutral-400 truncate">{{ record.subtitle }}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="space-y-1">
                        <p class="text-sm text-neutral-700 dark:text-neutral-300">{{ record.metaPrimary }}</p>
                        <p *ngIf="record.metaSecondary" class="text-xs text-neutral-500 dark:text-neutral-400">{{ record.metaSecondary }}</p>
                        <p *ngIf="record.metaTertiary" class="text-xs text-neutral-500 dark:text-neutral-400">{{ record.metaTertiary }}</p>
                      </div>
                    </td>
                    <td class="text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{{ record.updatedAt }}</td>
                    <td>
                      <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold" [ngClass]="statusClass(record.status)">
                        {{ record.status }}
                      </span>
                    </td>
                    <td>
                      <div class="flex items-center justify-end gap-2 flex-wrap">
                        <ng-container *ngIf="isPurchaseModule()">
                          <button 
                            *ngIf="showApproveAction(record.status)"
                            class="btn btn-ghost btn-sm" 
                            type="button" 
                            (click)="approvePurchase(record.id)" 
                            [disabled]="saving()">
                            <i class="bi bi-check2-circle me-1"></i>
                            Approve
                          </button>
                          <button 
                            *ngIf="showReceiveAction(record.status)"
                            class="btn btn-ghost btn-sm" 
                            type="button" 
                            (click)="receivePurchase(record.id)" 
                            [disabled]="saving()">
                            <i class="bi bi-box-seam me-1"></i>
                            Receive
                          </button>
                          <button 
                            *ngIf="showConvertToBillAction(record.status)"
                            class="btn btn-primary btn-sm" 
                            type="button" 
                            (click)="convertPurchaseToBill(record.id)" 
                            [disabled]="saving()">
                            <i class="bi bi-arrow-right-circle me-1"></i>
                            To Bill
                          </button>
                          <button 
                            *ngIf="showPaidAction(record.status)"
                            class="btn btn-success btn-sm" 
                            type="button" 
                            (click)="markPurchasePaid(record.id)" 
                            [disabled]="saving()">
                            <i class="bi bi-cash-coin me-1"></i>
                            Paid
                          </button>
                        </ng-container>

                        <ng-container *ngIf="isBillModule() || isExpenseModule()">
                          <button class="btn btn-primary btn-sm" type="button" (click)="openPaymentModal(record.id)" [disabled]="saving() || selectedPaymentAmount(record.id) <= 0">
                            <i class="bi bi-wallet2 me-1"></i>
                            Pay
                          </button>
                        </ng-container>

                        <button class="btn btn-ghost btn-sm" type="button" (click)="openEditModal(record.id)">
                          <i class="bi bi-pencil-square me-1"></i>
                          Edit
                        </button>
                        <button class="btn btn-danger btn-sm" type="button" (click)="deleteRecord(record.id)">
                          <i class="bi bi-trash3 me-1"></i>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <ng-template #emptyState>
              <div class="p-6">
                <div class="rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-700 min-h-[15rem] flex items-center justify-center text-center px-6">
                  <div>
                    <i class="bi bi-inbox text-3xl text-primary-500"></i>
                    <p class="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
                      No {{ shortLabel().toLowerCase() }} records were returned yet.
                    </p>
                  </div>
                </div>
              </div>
            </ng-template>
          </ng-template>
        </div>
      </div>

      <div *ngIf="modalOpen()" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
        <div class="card w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col">
          <div class="card-header flex items-start justify-between gap-4">
            <div>
              <h2 class="text-xl font-semibold text-neutral-900 dark:text-white">{{ modalTitle() }}</h2>
              <p class="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{{ modalDescription() }}</p>
            </div>
            <button class="btn btn-ghost btn-sm" type="button" (click)="closeModal()">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <ng-container *ngIf="isPurchaseModule()">
            <app-purchase-form (created)="onChildCreated()"></app-purchase-form>
          </ng-container>

          <ng-container *ngIf="isBillModule()">
            <app-bill-form (created)="onChildCreated()"></app-bill-form>
          </ng-container>

          <ng-container *ngIf="isExpenseModule()">
            <app-expense-form (created)="onChildCreated()"></app-expense-form>
          </ng-container>

          <ng-container *ngIf="!isPurchaseModule() && !isBillModule() && !isExpenseModule()">
            <form [formGroup]="recordForm" (ngSubmit)="saveRecord()" class="card-body space-y-5 overflow-y-auto">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label *ngIf="showNameField()" class="block space-y-2">
                  <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">{{ nameLabel() }}</span>

                  <input class="input-field" formControlName="name" [placeholder]="namePlaceholder()" />
                </label>

                <label *ngIf="showCodeField()" class="block space-y-2">
                  <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">Code</span>
                  <input class="input-field uppercase" formControlName="code" placeholder="ORG-001" />
                </label>

                <label *ngIf="showEmailField()" class="block space-y-2">
                  <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">Email</span>
                  <input class="input-field" formControlName="email" type="email" placeholder="name@example.com" />
                </label>

                <label *ngIf="showPasswordField()" class="block space-y-2">
                  <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">Password</span>
                  <input class="input-field" formControlName="password" type="password" placeholder="••••••••" />
                </label>

                <label *ngIf="showFirstNameField()" class="block space-y-2">
                  <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">First name</span>
                  <input class="input-field" formControlName="firstName" placeholder="First name" />
                </label>

                <label *ngIf="showLastNameField()" class="block space-y-2">
                  <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">Last name</span>
                  <input class="input-field" formControlName="lastName" placeholder="Last name" />
                </label>

                <label *ngIf="showPhoneField()" class="block space-y-2">
                  <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">Phone</span>
                  <input class="input-field" formControlName="phone" placeholder="+1 555 000 0000" />
                </label>

                <label *ngIf="showLocationField()" class="block space-y-2">
                  <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">Location</span>
                  <input class="input-field" formControlName="location" placeholder="Main office location" />
                </label>

                <label *ngIf="showAddressField()" class="block space-y-2 md:col-span-2">
                  <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">Address</span>
                  <input class="input-field" formControlName="address" placeholder="Street address" />
                </label>

                <label *ngIf="showCityField()" class="block space-y-2">
                  <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">City</span>
                  <input class="input-field" formControlName="city" placeholder="City" />
                </label>

                <label *ngIf="showStateField()" class="block space-y-2">
                  <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">State</span>
                  <input class="input-field" formControlName="state" placeholder="State" />
                </label>

                <label *ngIf="showCountryField()" class="block space-y-2">
                  <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">Country</span>
                  <input class="input-field" formControlName="country" placeholder="Country" />
                </label>

              <label *ngIf="showZipField()" class="block space-y-2">
                <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">ZIP code</span>
                <input class="input-field" formControlName="zipCode" placeholder="ZIP code" />
              </label>

              <label *ngIf="showDescriptionField()" class="block space-y-2 md:col-span-2">
                <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">Description</span>
                <textarea class="input-field min-h-[6rem]" formControlName="description" placeholder="Optional description"></textarea>
              </label>

              <label *ngIf="showRoleField()" class="block space-y-2">
                <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">Role</span>
                <select class="input-field" formControlName="role">
                  <option value="super_admin">Super admin</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="user">User</option>
                </select>
              </label>

              <label *ngIf="showStatusField()" class="block space-y-2">
                <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">Status</span>
                <select class="input-field" formControlName="status">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                  <option *ngIf="moduleKind() === 'organizations'" value="archived">Archived</option>
                </select>
              </label>

              <label *ngIf="showOrganizationPicker()" class="block space-y-2 md:col-span-2">
                <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">Organization</span>
                <select class="input-field" formControlName="organizationId" (change)="onOrganizationFormChange($any($event.target).value)">
                  <option value="">Select organization</option>
                  <option *ngFor="let organization of organizationOptions()" [value]="organization._id">
                    {{ organization.name }} ({{ organization.code }})
                  </option>
                </select>
              </label>

              <label *ngIf="showBranchPicker()" class="block space-y-2 md:col-span-2">
                <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">Branch</span>
                <select class="input-field" formControlName="branchId">
                  <option value="">No branch</option>
                  <option *ngFor="let branch of branchOptions()" [value]="branch._id">
                    {{ branch.name }} ({{ branch.code }})
                  </option>
                </select>
              </label>
            </div>

            <div class="flex items-center justify-end gap-3 pt-2">
              <button type="button" class="btn btn-ghost" (click)="closeModal()">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="saving() || recordForm.invalid">
                <i class="bi bi-save2 me-2"></i>
                {{ saving() ? 'Saving...' : (modalMode() === 'create' ? 'Create' : 'Update') }}
              </button>
            </div>
          </form>
          </ng-container>
        </div>
      </div>

      <div *ngIf="paymentModalOpen()" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
        <div class="w-full max-w-2xl">
          <app-payment-modal
            [sale]="selectedPaymentRecord()"
            [title]="paymentTitle()"
            [description]="paymentDescription()"
            [referenceLabel]="paymentReferenceLabel()"
            [maxAmount]="selectedPaymentAmount()"
            [saving]="saving()"
            (cancel)="closePaymentModal()"
            (submitPayment)="submitPayment($event)"
          ></app-payment-modal>
        </div>
      </div>
    </section>
  `,
})
export class ModulePageComponent implements OnInit {
  title = signal('Module');
  shortLabel = signal('Item');
  category = signal('Module');
  description = signal('Manage records, review activity, and take action from a single workspace.');
  stats = signal<ModuleStat[]>([]);
  records = signal<DisplayRecord[]>([]);
  rawRecords = signal<any[]>([]);
  organizationOptions = signal<Organization[]>([]);
  branchOptions = signal<Branch[]>([]);
  headerBranches = signal<Branch[]>([]);
  currentUser = signal<Organization | any>(null);
  scopeOrganizationId = signal('');
  scopeBranchId = signal('');
  searchQuery = signal('');
  modalOpen = signal(false);
  modalMode = signal<ModalMode>('create');
  selectedRecordId = signal('');
  paymentModalOpen = signal(false);
  selectedPaymentRecord = signal<any>(null);
  paymentTitle = signal('Record Payment');
  paymentDescription = signal('Settle this transaction using the selected payment method.');
  paymentReferenceLabel = signal('Reference');
  loading = signal(false);
  saving = signal(false);
  error = signal('');

  readonly moduleKind = signal<ModuleKind>('other');
  private readonly pageSize = 5;
  readonly recordForm: FormGroup;

  readonly filteredRecords = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const items = this.records();

    if (!query) {
      return items;
    }

    return items.filter((record) => {
      return [
        record.title,
        record.subtitle,
        record.metaPrimary,
        record.metaSecondary || '',
        record.metaTertiary || '',
        record.status,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  });

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService,
    private scopeService: ScopeService,
    private organizationsService: OrganizationsService,
    private branchesService: BranchesService,
    private usersService: UsersService,
    private purchasesService: PurchasesService,
    private billsService: BillsService,
    private expensesService: ExpensesService,
  ) {
    this.currentUser.set(this.authService.getCurrentUser());
    this.recordForm = this.fb.group({
      name: [''],
      code: [''],
      email: [''],
      password: [''],
      firstName: [''],
      lastName: [''],
      phone: [''],
      location: [''],
      address: [''],
      city: [''],
      state: [''],
      country: [''],
      zipCode: [''],
      description: [''],
      role: ['user'],
      status: ['active'],
      organizationId: [''],
      branchId: [''],
    });
  }

  isPurchaseModule(): boolean {
    return this.title().toLowerCase().includes('purchase');
  }

  isBillModule(): boolean {
    return this.title().toLowerCase().includes('bill');
  }

  isExpenseModule(): boolean {
    return this.title().toLowerCase().includes('expense');
  }

  // Purchase action visibility helpers
  showApproveAction(status: string): boolean {
    return status === 'OPEN';
  }

  showReceiveAction(status: string): boolean {
    return status === 'APPROVED';
  }

  showConvertToBillAction(status: string): boolean {
    return status === 'RECEIVED' || status === 'PARTIALLY_RECEIVED';
  }

  showPaidAction(status: string): boolean {
    return status === 'CONVERTED_TO_BILL';
  }

  onChildCreated(): void {
    this.closeModal();
    void this.loadModuleData();
  }

  openPaymentModal(recordId: string): void {
    const selected = this.findTransactionRecord(recordId);
    if (!selected) {
      return;
    }

    this.selectedPaymentRecord.set(selected);
    this.paymentModalOpen.set(true);
    this.paymentTitle.set(this.isBillModule() ? 'Record Bill Payment' : 'Record Expense Payment');
    this.paymentDescription.set(this.isBillModule() ? 'Clear the bill using cash, bank, or Mpesa.' : 'Settle the expense using cash, bank, or Mpesa.');
    this.paymentReferenceLabel.set(this.isBillModule() ? 'Bill' : 'Expense');
  }

  closePaymentModal(): void {
    this.paymentModalOpen.set(false);
    this.selectedPaymentRecord.set(null);
  }

  selectedPaymentAmount(recordId?: string): number {
    const selected = recordId ? this.findTransactionRecord(recordId) : this.selectedPaymentRecord();
    return Number(selected?.balanceDue ?? selected?.amount ?? selected?.total ?? 0);
  }

  async submitPayment(payload: {
    amount: number;
    method: 'bank' | 'cash' | 'mpesa';
    paidAt?: string;
    reference?: string;
    notes?: string;
  }): Promise<void> {
    const selected = this.selectedPaymentRecord();
    if (!selected) {
      return;
    }

    this.saving.set(true);
    this.error.set('');

    try {
      if (this.isBillModule()) {
        await firstValueFrom(this.billsService.recordPayment(selected._id, { payment: payload }));
      } else if (this.isExpenseModule()) {
        await firstValueFrom(this.expensesService.recordPayment(selected._id, { payment: payload }));
      }

      this.closePaymentModal();
      await this.loadModuleData();
    } catch (error: any) {
      this.error.set(error?.error?.message || error?.message || 'Failed to record payment.');
    } finally {
      this.saving.set(false);
    }
  }

  async approvePurchase(recordId: string): Promise<void> {
    try {
      await firstValueFrom(this.purchasesService.approvePurchase(recordId));
      await this.loadModuleData();
    } catch (error: any) {
      this.error.set(error?.error?.message || error?.message || 'Failed to approve purchase.');
    }
  }

  async receivePurchase(recordId: string): Promise<void> {
    const purchase = this.findTransactionRecord(recordId);
    if (!purchase) {
      return;
    }

    try {
      await firstValueFrom(
        this.purchasesService.receivePurchase(recordId, {
          lineItems: purchase.lineItems || [],
          receivedAt: new Date().toISOString(),
          notes: 'Received via UI',
        }),
      );
      await this.loadModuleData();
    } catch (error: any) {
      this.error.set(error?.error?.message || error?.message || 'Failed to receive purchase.');
    }
  }

  async markPurchasePaid(recordId: string): Promise<void> {
    try {
      await firstValueFrom(this.purchasesService.markPaid(recordId));
      await this.loadModuleData();
    } catch (error: any) {
      this.error.set(error?.error?.message || error?.message || 'Failed to mark purchase as paid.');
    }
  }

  async convertPurchaseToBill(recordId: string): Promise<void> {
    const purchase = this.findTransactionRecord(recordId);
    const source = purchase?.receipts?.length ? 'received' : 'ordered';

    try {
      await firstValueFrom(this.purchasesService.convertToBill(recordId, source));
      await this.loadModuleData();
    } catch (error: any) {
      this.error.set(error?.error?.message || error?.message || 'Failed to convert purchase to bill.');
    }
  }

  ngOnInit(): void {
    const data = this.route.snapshot.data as Partial<{
      title: string;
      shortLabel: string;
      category: string;
      description: string;
      stats: ModuleStat[];
    }>;

    this.title.set(data.title || 'Module');
    this.shortLabel.set(data.shortLabel || 'Item');
    this.category.set(data.category || 'Module');
    this.description.set(data.description || 'Manage records, review activity, and take action from a single workspace.');
    this.stats.set(
      data.stats || [
        { label: 'Total', value: '0', change: 'Live', icon: 'bi-collection' },
        { label: 'Active', value: '0', change: 'Live', icon: 'bi-lightning-charge-fill' },
        { label: 'Pending', value: '0', change: 'Live', icon: 'bi-hourglass-split' },
        { label: 'Archived', value: '0', change: 'Live', icon: 'bi-archive-fill' },
      ]
    );
    this.moduleKind.set(this.resolveModuleKind(this.title()));
    this.currentUser.set(this.authService.getCurrentUser());

    if (this.isScopedModule()) {
      const orgId = this.currentUser()?.organizationId || '';
      this.scopeOrganizationId.set(orgId);
      this.scopeService.setOrganizationId(orgId);
    }

    // load header branches (super-admin sees all, others see org-specific)
    void this.loadHeaderBranches(this.scopeOrganizationId());

    void this.loadModuleData();
  }

  private async loadHeaderBranches(organizationId?: string): Promise<void> {
    try {
      if (this.isSuperAdmin()) {
        const response = await firstValueFrom(this.branchesService.getAllBranches(1, 100));
        this.headerBranches.set(response.data);
      } else {
        const orgId = organizationId || this.currentUser()?.organizationId;
        if (!orgId) {
          this.headerBranches.set([]);
          return;
        }
        const response = await firstValueFrom(this.branchesService.getActiveBranches(orgId));
        this.headerBranches.set(response || []);
      }

      if (!this.scopeBranchId() && this.headerBranches().length) {
        this.scopeBranchId.set(this.currentUser()?.branchId || this.headerBranches()[0]._id);
      }
      this.scopeService.setBranchId(this.scopeBranchId());
    } catch (err) {
      this.headerBranches.set([]);
    }
  }

  private async loadModuleData(): Promise<void> {
    this.loading.set(true);
    this.error.set('');

    try {
      await this.loadOrganizationOptions();
      const organizationId = this.getScopedTransactionOrganizationId();

      switch (this.moduleKind()) {
        case 'organizations': {
          const [stats, response] = await Promise.all([
            firstValueFrom(this.organizationsService.getOrganizationStats()),
            firstValueFrom(this.organizationsService.getAllOrganizations(1, this.pageSize)),
          ]);

          this.stats.set(this.buildOrganizationStats(stats));
          this.records.set(response.data.map((organization) => this.mapOrganizationRecord(organization)));
          this.rawRecords.set(response.data);
          break;
        }
        case 'branches': {
          // If super-admin, show all branches and global stats; otherwise scope to organization
          if (this.isSuperAdmin()) {
            await this.loadBranchOptions('');
            const [stats, response] = await Promise.all([
              firstValueFrom(this.branchesService.getBranchStats()),
              firstValueFrom(this.branchesService.getAllBranches(1, this.pageSize)),
            ]);

            this.stats.set(this.buildBranchStats(stats));
            this.records.set(response.data.map((branch) => this.mapBranchRecord(branch)));
            this.rawRecords.set(response.data);
          } else {
            const organizationId = this.ensureOrganizationScope();
            await this.loadBranchOptions(organizationId);
            const [stats, response] = await Promise.all([
              firstValueFrom(this.branchesService.getOrganizationBranchStats(organizationId)),
              firstValueFrom(this.branchesService.getBranchesByOrganization(organizationId, 1, this.pageSize)),
            ]);

            this.stats.set(this.buildBranchStats(stats));
            this.records.set(response.data.map((branch) => this.mapBranchRecord(branch)));
          }
          break;
        }
        case 'users': {
          // Super-admin sees global users; others see organization-scoped users
          if (this.isSuperAdmin()) {
            const [stats, response] = await Promise.all([
              firstValueFrom(this.usersService.getUserStats()),
              firstValueFrom(this.usersService.getAllUsers(1, this.pageSize)),
            ]);

            this.stats.set(this.buildUserStats(stats));
            this.records.set(response.data.map((user) => this.mapUserRecord(user)));
            this.rawRecords.set(response.data);
          } else {
            const organizationId = this.ensureOrganizationScope();
            await this.loadBranchOptions(organizationId);
            const branchId = this.scopeBranchId();
            const [stats, response] = await Promise.all([
              firstValueFrom(this.usersService.getOrganizationUserStats(organizationId)),
              branchId
                ? firstValueFrom(this.usersService.getUsersByBranch(branchId, 1, this.pageSize))
                : firstValueFrom(this.usersService.getUsersByOrganization(organizationId, 1, this.pageSize)),
            ]);

            this.stats.set(this.buildUserStats(stats));
            this.records.set(response.data.map((user) => this.mapUserRecord(user)));
            this.rawRecords.set(response.data);
          }
          break;
        }
        default:
          if (this.isPurchaseModule()) {
            const response = await firstValueFrom(this.purchasesService.getByOrganization(organizationId, 1, this.pageSize));
            // Filter out converted purchases (those with billId set) to keep them only in bills list
            const activePurchases = response.data.filter(p => !p.billId && p.status !== 'CONVERTED_TO_BILL');
            this.stats.set(this.buildTransactionStats('Purchase', response.total, activePurchases.length, 'bi-bag-check-fill'));
            this.records.set(activePurchases.map((purchase) => this.mapPurchaseRecord(purchase)));
            this.rawRecords.set(activePurchases);
            break;
          }

          if (this.isBillModule()) {
            const response = await firstValueFrom(this.billsService.getByOrganization(organizationId, 1, this.pageSize));
            this.stats.set(this.buildTransactionStats('Bill', response.total, response.data.length, 'bi-receipt-cutoff'));
            this.records.set(response.data.map((bill) => this.mapBillRecord(bill)));
            this.rawRecords.set(response.data);
            break;
          }

          if (this.isExpenseModule()) {
            const response = await firstValueFrom(this.expensesService.getByOrganization(organizationId, 1, this.pageSize));
            this.stats.set(this.buildTransactionStats('Expense', response.total, response.data.length, 'bi-wallet2'));
            this.records.set(response.data.map((expense) => this.mapExpenseRecord(expense)));
            this.rawRecords.set(response.data);
            break;
          }

          this.records.set([]);
          break;
      }
    } catch (error: any) {
      this.error.set(error?.error?.message || error?.message || 'Failed to load records.');
      this.records.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  reload(): void {
    void this.loadModuleData();
  }

  onSearch(value: string): void {
    this.searchQuery.set(value);
  }

  showOrganizationScope(): boolean {
    return this.isScopedModule() && this.isSuperAdmin();
  }

  showBranchScope(): boolean {
    return this.moduleKind() === 'users';
  }

  onOrganizationScopeChange(organizationId: string): void {
    this.scopeOrganizationId.set(organizationId);
    this.scopeBranchId.set('');
    this.scopeService.setOrganizationId(organizationId);
    this.scopeService.setBranchId('');
    void this.loadHeaderBranches(organizationId);
    void this.loadModuleData();
  }

  onBranchScopeChange(branchId: string): void {
    this.scopeBranchId.set(branchId);
    this.scopeService.setBranchId(branchId);
    void this.loadModuleData();
  }

  async openCreateModal(): Promise<void> {
    this.modalMode.set('create');
    this.selectedRecordId.set('');

    // Ensure organization options are loaded for branches/users so the dropdown is populated
    if (this.showOrganizationPicker()) {
      await this.loadOrganizationOptions();
    }

    // For user creation, ensure branch options for the selected org are loaded
    if (this.moduleKind() === 'users') {
      const orgId = this.scopeOrganizationId() || this.currentUser()?.organizationId || '';
      if (orgId) {
        await this.loadBranchOptions(orgId);
      }
    }

    this.prepareForm();
    this.modalOpen.set(true);
  }

  openEditModal(recordId: string): void {
    void this.openEditFlow(recordId);
  }

  private async openEditFlow(recordId: string): Promise<void> {
    this.modalMode.set('edit');
    this.selectedRecordId.set(recordId);

    // If editing a user, ensure branch options for their organization are loaded
    if (this.moduleKind() === 'users') {
      const record = this.findRecord(recordId) as User | null;
      const orgId = record?.organizationId || this.scopeOrganizationId() || this.currentUser()?.organizationId || '';
      if (orgId) {
        await this.loadBranchOptions(orgId);
      }
    }

    // If editing a branch, ensure organization options are available so the organization picker can show the current value
    if (this.moduleKind() === 'branches') {
      await this.loadOrganizationOptions();
    }

    this.prepareForm(recordId);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.recordForm.reset();
  }

  async saveRecord(): Promise<void> {
    if (this.recordForm.invalid) {
      this.recordForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    try {
      const raw = this.recordForm.getRawValue();

      if (this.moduleKind() === 'organizations') {
        const payload = this.cleanPayload({
          name: raw.name,
          code: raw.code,
          email: raw.email,
          phone: raw.phone,
          address: raw.address,
          city: raw.city,
          state: raw.state,
          country: raw.country,
          zipCode: raw.zipCode,
          description: raw.description,
          status: this.modalMode() === 'edit' ? raw.status : undefined,
        });

        if (this.modalMode() === 'create') {
          await firstValueFrom(this.organizationsService.createOrganization(payload));
        } else {
          await firstValueFrom(this.organizationsService.updateOrganization(this.selectedRecordId(), payload));
        }
      }

      if (this.moduleKind() === 'branches') {
        const organizationId = raw.organizationId || this.scopeOrganizationId() || this.currentUser()?.organizationId || '';
        const payload = this.cleanPayload({
          name: raw.name,
          code: raw.code,
          location: raw.location,
          phone: raw.phone,
          email: raw.email,
          status: this.modalMode() === 'edit' ? raw.status : undefined,
        });

        if (this.modalMode() === 'create') {
          await firstValueFrom(this.branchesService.createBranch(payload, organizationId));
        } else {
          await firstValueFrom(this.branchesService.updateBranch(this.selectedRecordId(), payload));
        }
      }

      if (this.moduleKind() === 'users') {
        const payload = this.cleanPayload({
          email: raw.email,
          password: this.modalMode() === 'create' ? raw.password : undefined,
          firstName: raw.firstName,
          lastName: raw.lastName,
          phone: raw.phone,
          role: raw.role,
          status: this.modalMode() === 'edit' ? raw.status : undefined,
          organizationId: raw.organizationId || this.scopeOrganizationId() || this.currentUser()?.organizationId,
          branchId: raw.branchId || undefined,
        });

        if (this.modalMode() === 'create') {
          await firstValueFrom(this.usersService.createUser(payload));
        } else {
          await firstValueFrom(this.usersService.updateUser(this.selectedRecordId(), payload));
        }
      }

      this.closeModal();
      await this.loadModuleData();
    } catch (error: any) {
      this.error.set(error?.error?.message || error?.message || 'Failed to save record.');
    } finally {
      this.saving.set(false);
    }
  }

  async deleteRecord(recordId: string): Promise<void> {
    const confirmed = window.confirm(`Delete this ${this.shortLabel().toLowerCase()} record?`);
    if (!confirmed) {
      return;
    }

    try {
      if (this.moduleKind() === 'organizations') {
        await firstValueFrom(this.organizationsService.deleteOrganization(recordId));
      } else if (this.moduleKind() === 'branches') {
        await firstValueFrom(this.branchesService.deleteBranch(recordId));
      } else if (this.moduleKind() === 'users') {
        await firstValueFrom(this.usersService.deleteUser(recordId));
      } else if (this.isPurchaseModule()) {
        await firstValueFrom((this.purchasesService as any).deletePurchase(recordId));
      } else if (this.isBillModule()) {
        await firstValueFrom((this.billsService as any).deleteBill(recordId));
      } else if (this.isExpenseModule()) {
        await firstValueFrom((this.expensesService as any).deleteExpense(recordId));
      }

      await this.loadModuleData();
    } catch (error: any) {
      this.error.set(error?.error?.message || error?.message || 'Failed to delete record.');
    }
  }

  private resolveModuleKind(title: string): ModuleKind {
    const value = title.trim().toLowerCase();
    if (value.includes('organization')) return 'organizations';
    if (value.includes('branch')) return 'branches';
    if (value.includes('user')) return 'users';
    return 'other';
  }

  private buildOrganizationStats(stats: OrganizationStats): ModuleStat[] {
    return [
      { label: 'Total', value: String(stats.total), change: 'Live', icon: 'bi-collection' },
      { label: 'Active', value: String(stats.active), change: 'Live', icon: 'bi-lightning-charge-fill' },
      { label: 'Pending', value: String(stats.pending), change: 'Live', icon: 'bi-hourglass-split' },
      { label: 'Archived', value: String(stats.archived), change: 'Live', icon: 'bi-archive-fill' },
    ];
  }

  private buildBranchStats(stats: BranchStats): ModuleStat[] {
    return [
      { label: 'Total', value: String(stats.total), change: 'Live', icon: 'bi-collection' },
      { label: 'Active', value: String(stats.active), change: 'Live', icon: 'bi-lightning-charge-fill' },
      { label: 'Inactive', value: String(stats.inactive), change: 'Live', icon: 'bi-slash-circle' },
      { label: 'Pending', value: String(stats.pending), change: 'Live', icon: 'bi-hourglass-split' },
    ];
  }

  private buildUserStats(stats: UserStats): ModuleStat[] {
    return [
      { label: 'Total', value: String(stats.total), change: 'Live', icon: 'bi-people-fill' },
      { label: 'Active', value: String(stats.active), change: 'Live', icon: 'bi-lightning-charge-fill' },
      { label: 'Inactive', value: String(stats.inactive), change: 'Live', icon: 'bi-slash-circle' },
      { label: 'Admins', value: String(stats.admins), change: 'Live', icon: 'bi-shield-lock-fill' },
    ];
  }

  private mapOrganizationRecord(organization: Organization): DisplayRecord {
    return {
      id: organization._id,
      title: organization.name,
      subtitle: `${organization.code} · ${organization.email}`,
      status: organization.status,
      updatedAt: this.formatDate(organization.updatedAt),
      icon: 'bi-building',
      metaPrimary: organization.email,
      metaSecondary: this.joinParts([organization.city, organization.state, organization.country]),
      metaTertiary: organization.phone || organization.description || 'Organization profile',
    };
  }

  private mapBranchRecord(branch: Branch): DisplayRecord {
    const organization = this.organizationOptions().find((item) => item._id === branch.organizationId);

    return {
      id: branch._id,
      title: branch.name,
      subtitle: `${branch.code} · ${branch.location || branch.organizationId}`,
      status: branch.status,
      updatedAt: this.formatDate(branch.updatedAt),
      icon: 'bi-diagram-3',
      metaPrimary: organization ? organization.name : branch.organizationId,
      metaSecondary: branch.email || branch.phone || 'Branch contact',
      metaTertiary: branch.location || 'Branch location',
    };
  }

  private mapUserRecord(user: User): DisplayRecord {
    const organization = this.organizationOptions().find((item) => item._id === user.organizationId);
    const branch = this.branchOptions().find((item) => item._id === user.branchId);

    return {
      id: user._id,
      title: `${user.firstName} ${user.lastName}`.trim(),
      subtitle: `${user.email} · ${user.role}`,
      status: user.status,
      updatedAt: this.formatDate(user.updatedAt),
      icon: 'bi-person-badge',
      metaPrimary: user.role,
      metaSecondary: organization ? organization.name : (user.organizationId || 'Organization not set'),
      metaTertiary: branch ? branch.name : (user.branchId || 'No branch assigned'),
    };
  }

  private mapPurchaseRecord(purchase: any): DisplayRecord {
    return {
      id: purchase._id,
      title: purchase.purchaseNumber || purchase.referenceNumber || purchase._id,
      subtitle: purchase.supplierId || 'Supplier not set',
      status: purchase.status || 'OPEN',
      updatedAt: this.formatDate(purchase.updatedAt || purchase.createdAt),
      icon: 'bi-bag-check-fill',
      metaPrimary: `Total: ${this.formatCurrency(purchase.total ?? purchase.subtotal ?? 0)}`,
      metaSecondary: purchase.lineItems?.length ? `${purchase.lineItems.length} line item(s)` : 'No line items',
      metaTertiary: purchase.organizationId || 'Organization not set',
    };
  }

  private mapBillRecord(bill: any): DisplayRecord {
    return {
      id: bill._id,
      title: bill.billNumber || bill.referenceNumber || bill._id,
      subtitle: bill.supplierId || 'Supplier not set',
      status: bill.status || 'OPEN',
      updatedAt: this.formatDate(bill.updatedAt || bill.createdAt),
      icon: 'bi-receipt-cutoff',
      metaPrimary: `Total: ${this.formatCurrency(bill.total ?? bill.subtotal ?? 0)}`,
      metaSecondary: bill.purchaseId ? `From purchase ${bill.purchaseId}` : 'Standalone bill',
      metaTertiary: bill.organizationId || 'Organization not set',
    };
  }

  private mapExpenseRecord(expense: any): DisplayRecord {
    return {
      id: expense._id,
      title: expense.expenseNumber || expense.referenceNumber || expense._id,
      subtitle: expense.description || expense.supplierId || 'Expense entry',
      status: expense.status || 'OPEN',
      updatedAt: this.formatDate(expense.updatedAt || expense.createdAt),
      icon: 'bi-wallet2',
      metaPrimary: `Amount: ${this.formatCurrency(expense.amount ?? 0)}`,
      metaSecondary: expense.supplierId ? `Supplier: ${expense.supplierId}` : 'No supplier',
      metaTertiary: expense.organizationId || 'Organization not set',
    };
  }

  private buildTransactionStats(label: string, total: number, shown: number, icon: string): ModuleStat[] {
    return [
      { label: 'Total', value: String(total), change: 'Live', icon },
      { label: 'Shown', value: String(shown), change: 'Live', icon },
      { label: `${label}s`, value: String(total), change: 'Live', icon },
      { label: 'Pending', value: '0', change: 'Live', icon },
    ];
  }

  private async loadOrganizationOptions(): Promise<void> {
    // Allow super-admin to load organizations even when module is not 'scoped' so dropdowns
    // (create/edit) show the full organization list. For non-super-admins we only load when module is scoped.
    if (!this.isScopedModule() && !this.isSuperAdmin()) {
      return;
    }

    const response = await firstValueFrom(this.organizationsService.getAllOrganizations(1, 100));
    this.organizationOptions.set(response.data);

    // For non-super admins default to first org if none selected; super-admins remain unscoped (empty)
    if (!this.isSuperAdmin() && !this.scopeOrganizationId() && response.data.length) {
      this.scopeOrganizationId.set(response.data[0]._id);
    }
  }

  private getScopedTransactionOrganizationId(): string {
    return this.scopeOrganizationId() || this.scopeService.getSelectedOrganizationId() || this.currentUser()?.organizationId || '';
  }

  private async loadBranchOptions(organizationId: string): Promise<void> {
    if (!organizationId) {
      this.branchOptions.set([]);
      return;
    }

    const response = await firstValueFrom(this.branchesService.getBranchesByOrganization(organizationId, 1, 100));
    this.branchOptions.set(response.data);

    if (this.moduleKind() === 'users' && !this.scopeBranchId() && response.data.length) {
      this.scopeBranchId.set('');
    }
  }

  private ensureOrganizationScope(): string {
    const current = this.scopeOrganizationId();
    if (this.isSuperAdmin()) {
      // super-admin is not restricted to a single organization
      return '';
    }

    if (current) {
      return current;
    }

    const fallback = this.currentUser()?.organizationId || this.organizationOptions()[0]?._id || '';
    this.scopeOrganizationId.set(fallback);
    return fallback;
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0));
  }

  onOrganizationFormChange(orgId: string): void {
    if (!orgId) return;
    this.recordForm.get('branchId')?.setValue('');
    void this.loadBranchOptions(orgId);
  }

  private isScopedModule(): boolean {
    return this.moduleKind() === 'branches' || this.moduleKind() === 'users';
  }

  private isSuperAdmin(): boolean {
    return this.currentUser()?.role === UserRole.SUPER_ADMIN;
  }

  private prepareForm(recordId?: string): void {
    const record = recordId ? this.findRecord(recordId) : null;
    this.recordForm.reset();
    this.recordForm.enable();

    this.setValidators();

    if (this.moduleKind() === 'organizations') {
      if (record) {
        const organization = record as Organization;
        this.recordForm.patchValue({
          name: organization.name,
          code: organization.code,
          email: organization.email,
          phone: organization.phone,
          address: organization.address,
          city: organization.city,
          state: organization.state,
          country: organization.country,
          zipCode: organization.zipCode,
          description: organization.description,
          status: organization.status,
        });
      }
      return;
    }

    if (this.moduleKind() === 'branches') {
      if (this.isSuperAdmin()) {
        this.recordForm.get('organizationId')?.addValidators([Validators.required]);
      } else {
        this.recordForm.get('organizationId')?.setValue(this.ensureOrganizationScope());
        this.recordForm.get('organizationId')?.disable({ emitEvent: false });
      }

      if (record) {
        const branch = record as Branch;
        this.recordForm.patchValue({
          name: branch.name,
          code: branch.code,
          location: branch.location,
          phone: branch.phone,
          email: branch.email,
          status: branch.status,
        });
      } else if (!this.isSuperAdmin()) {
        this.recordForm.patchValue({ organizationId: this.ensureOrganizationScope() });
      }
      return;
    }

    if (this.moduleKind() === 'users') {
      this.recordForm.get('organizationId')?.addValidators([Validators.required]);

      if (!this.isSuperAdmin()) {
        this.recordForm.get('organizationId')?.setValue(this.ensureOrganizationScope());
        this.recordForm.get('organizationId')?.disable({ emitEvent: false });
      }

      if (record) {
        const user = record as User;
        this.recordForm.patchValue({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          status: user.status,
          organizationId: user.organizationId || this.ensureOrganizationScope(),
          branchId: user.branchId || '',
        });
      } else {
        this.recordForm.patchValue({
          role: 'user',
          organizationId: this.ensureOrganizationScope(),
          branchId: this.scopeBranchId(),
        });
      }
      return;
    }
  }

  private setValidators(): void {
    this.clearValidators();

    if (this.moduleKind() === 'organizations') {
      this.requireFields(['name', 'code', 'email']);
      if (this.modalMode() === 'edit') {
        this.requireFields(['status']);
      }
    }

    if (this.moduleKind() === 'branches') {
      this.requireFields(['name', 'code']);
      if (this.isSuperAdmin()) {
        this.requireFields(['organizationId']);
      }
      if (this.modalMode() === 'edit') {
        this.requireFields(['status']);
      }
    }

    if (this.moduleKind() === 'users') {
      this.requireFields(['email', 'firstName', 'lastName', 'role', 'organizationId']);
      if (this.modalMode() === 'create') {
        this.requireFields(['password']);
      } else {
        this.requireFields(['status']);
      }
    }

    this.recordForm.updateValueAndValidity();
  }

  private clearValidators(): void {
    Object.keys(this.recordForm.controls).forEach((controlName) => {
      const control = this.recordForm.get(controlName);
      control?.clearValidators();
      control?.enable({ emitEvent: false });
      control?.updateValueAndValidity({ emitEvent: false });
    });
  }

  private requireFields(fields: string[]): void {
    fields.forEach((field) => {
      this.recordForm.get(field)?.addValidators([Validators.required]);
    });
  }

  private findRecord(recordId: string): Organization | Branch | User | null {
    // Prefer rawRecords (actual API objects) when available so edit forms get complete data
    const raw = this.rawRecords().find((r: any) => r._id === recordId);
    if (raw) return raw as Organization | Branch | User;

    if (this.moduleKind() === 'organizations') {
      return this.organizationOptions().find((item) => item._id === recordId) || null;
    }

    if (this.moduleKind() === 'branches') {
      return this.branchOptions().find((item) => item._id === recordId) || null;
    }

    if (this.moduleKind() === 'users') {
      // fallback: try matching filtered raw users
      const current = this.filteredRawUsers().find((item) => item._id === recordId);
      return current || null;
    }

    return null;
  }

  private findTransactionRecord(recordId: string): any | null {
    return this.rawRecords().find((record: any) => record._id === recordId) || this.records().find((record) => record.id === recordId) || null;
  }

  private filteredRawUsers(): User[] {
    // Filter rawRecords (users) by current filteredRecords IDs
    const ids = new Set(this.filteredRecords().map((r) => r.id));
    return this.rawRecords().filter((r: any) => ids.has(r._id)) as User[];
  }

  private cleanPayload<T extends Record<string, any>>(payload: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== ''),
    ) as Partial<T>;
  }

  private joinParts(parts: Array<string | undefined | null>): string {
    return parts.filter(Boolean).join(' · ') || 'Organization';
  }

  modalTitle(): string {
    return `${this.modalMode() === 'create' ? 'Create' : 'Edit'} ${this.shortLabel()}`;
  }

  modalDescription(): string {
    if (this.moduleKind() === 'organizations') {
      return 'Keep organization records accurate and ready for downstream branches and users.';
    }

    if (this.moduleKind() === 'branches') {
      return 'Branches stay under the selected organization so the hierarchy remains clean.';
    }

    if (this.moduleKind() === 'users') {
      return 'Assign the user to the right organization and branch before saving.';
    }

    return 'Update the selected record.';
  }

  nameLabel(): string {
    if (this.moduleKind() === 'users') {
      return 'Name';
    }

    return 'Name';
  }

  namePlaceholder(): string {
    if (this.moduleKind() === 'organizations') {
      return 'Acme Holdings';
    }

    if (this.moduleKind() === 'branches') {
      return 'Main Branch';
    }

    return 'Enter name';
  }

  showNameField(): boolean { return this.moduleKind() !== 'other'; }
  showCodeField(): boolean { return this.moduleKind() !== 'other'; }
  showEmailField(): boolean { return this.moduleKind() !== 'other'; }
  showPasswordField(): boolean { return this.moduleKind() === 'users' && this.modalMode() === 'create'; }
  showFirstNameField(): boolean { return this.moduleKind() === 'users'; }
  showLastNameField(): boolean { return this.moduleKind() === 'users'; }
  showPhoneField(): boolean { return this.moduleKind() !== 'other'; }
  showLocationField(): boolean { return this.moduleKind() === 'branches'; }
  showAddressField(): boolean { return this.moduleKind() === 'organizations'; }
  showCityField(): boolean { return this.moduleKind() === 'organizations'; }
  showStateField(): boolean { return this.moduleKind() === 'organizations'; }
  showCountryField(): boolean { return this.moduleKind() === 'organizations'; }
  showZipField(): boolean { return this.moduleKind() === 'organizations'; }
  showDescriptionField(): boolean { return this.moduleKind() === 'organizations'; }
  showRoleField(): boolean { return this.moduleKind() === 'users'; }
  showStatusField(): boolean { return this.moduleKind() !== 'other' && this.modalMode() === 'edit'; }
  showOrganizationPicker(): boolean {
    return this.moduleKind() === 'branches' || this.moduleKind() === 'users';
  }
  showBranchPicker(): boolean {
    return this.moduleKind() === 'users';
  }

  statusClass(status: string | undefined): string {
    if (!status) {
      return 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300';
    }
    
    const normalized = status.toLowerCase();
    if (normalized === 'active') {
      return 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300';
    }

    if (normalized === 'pending') {
      return 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300';
    }

    if (normalized === 'inactive' || normalized === 'archived' || normalized === 'suspended') {
      return 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300';
    }

    return 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300';
  }

  private formatDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'Recently';
    }

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}
