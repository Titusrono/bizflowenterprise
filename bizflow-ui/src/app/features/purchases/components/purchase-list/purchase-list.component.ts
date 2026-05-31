import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PurchasesService } from '../../service/purchases.service';
import { PurchaseFormComponent } from '../purchase-form/purchase-form.component';
import { AuthService } from '../../../../core/services/auth.service';
import { ScopeService } from '../../../../core/services/scope.service';

@Component({
  selector: 'app-purchase-list',
  standalone: true,
  imports: [CommonModule, PurchaseFormComponent],
  templateUrl: './purchase-list.component.html',
  styleUrls: ['./purchase-list.component.scss'],
})
export class PurchaseListComponent implements OnInit {
  records: any[] = [];
  loading = signal(false);
  modalOpen = signal(false);
  currentUser = signal<any>(null);

  constructor(
    private purchasesService: PurchasesService,
    private authService: AuthService,
    private scopeService: ScopeService,
  ) {
    this.currentUser.set(this.authService.getCurrentUser());
  }

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  async loadData(): Promise<void> {
    this.loading.set(true);
    try {
      const orgId = this.scopeService.getSelectedOrganizationId() || this.currentUser()?.organizationId || '';
      const resp: any = await firstValueFrom(this.purchasesService.getByOrganization(orgId, 1, 20));
      this.records = resp.data || [];
    } finally {
      this.loading.set(false);
    }
  }

  openCreate(): void {
    this.modalOpen.set(true);
  }

  async onCreated(): Promise<void> {
    this.modalOpen.set(false);
    await this.loadData();
  }
}
