import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ScopeService {
  private readonly selectedOrganizationIdSubject = new BehaviorSubject<string>(this.getInitialOrganizationId());
  private readonly selectedBranchIdSubject = new BehaviorSubject<string>('');

  selectedOrganizationId$ = this.selectedOrganizationIdSubject.asObservable();
  selectedBranchId$ = this.selectedBranchIdSubject.asObservable();

  setOrganizationId(organizationId: string): void {
    this.selectedOrganizationIdSubject.next(organizationId);
  }

  setBranchId(branchId: string): void {
    this.selectedBranchIdSubject.next(branchId);
  }

  getSelectedOrganizationId(): string {
    return this.selectedOrganizationIdSubject.value;
  }

  getSelectedBranchId(): string {
    return this.selectedBranchIdSubject.value;
  }

  private getInitialOrganizationId(): string {
    try {
      const selectedOrganization = localStorage.getItem('selectedOrganization');
      if (selectedOrganization) {
        const parsed = JSON.parse(selectedOrganization) as { id?: string };
        if (parsed.id) {
          return parsed.id;
        }
      }

      const user = localStorage.getItem('user');
      if (user) {
        const parsed = JSON.parse(user) as { organizationId?: string };
        if (parsed.organizationId) {
          return parsed.organizationId;
        }
      }
    } catch {
      return '';
    }

    return '';
  }
}
