import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { BillsService } from '../../service/bills.service';
import { BillFormComponent } from '../bill-form/bill-form.component';
import { AuthService } from '../../../../core/services/auth.service';
import { ScopeService } from '../../../../core/services/scope.service';

@Component({
  selector: 'app-bill-list',
  standalone: true,
  imports: [CommonModule, BillFormComponent],
  templateUrl: './bill-list.component.html',
  styleUrls: ['./bill-list.component.scss'],
})
export class BillListComponent implements OnInit {
  bills: any[] = [];
  loading = signal(false);
  modalOpen = signal(false);
  currentUser = signal<any>(null);

  constructor(
    private billsService: BillsService,
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
      const resp: any = await firstValueFrom(this.billsService.getByOrganization(orgId, 1, 20));
      this.bills = resp.data || [];
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
