import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ScopeService {
  private readonly selectedOrganizationIdSubject = new BehaviorSubject<string>('');
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
}
