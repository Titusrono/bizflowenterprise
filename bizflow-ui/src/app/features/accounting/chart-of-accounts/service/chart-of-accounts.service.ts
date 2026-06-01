import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChartOfAccountsService {
  private apiUrl = '/api/accounting/chart-of-accounts';

  constructor(private http: HttpClient) {}

  /**
   * Get Chart of Accounts
   */
  getChartOfAccounts(filters: any = {}, page = 1, limit = 50): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters.accountType !== null && filters.accountType !== undefined) {
      params = params.set('accountType', filters.accountType.toString());
    }

    if (filters.accountCode) {
      params = params.set('accountCode', filters.accountCode);
    }

    if (filters.isActive !== null && filters.isActive !== undefined) {
      params = params.set('isActive', filters.isActive.toString());
    }

    return this.http.get<any>(`${this.apiUrl}`, { params });
  }

  /**
   * Get Chart of Account by ID
   */
  getChartOfAccountById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create Chart of Account
   */
  createChartOfAccount(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, data);
  }

  /**
   * Update Chart of Account
   */
  updateChartOfAccount(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Delete Chart of Account
   */
  deleteChartOfAccount(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Deactivate Chart of Account
   */
  deactivateAccount(id: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/deactivate`, {});
  }

  /**
   * Get Account Balance
   */
  getAccountBalance(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/balance`);
  }

  /**
   * Get Account by Code
   */
  getAccountByCode(code: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/code/${code}`);
  }

  /**
   * Get Active Accounts (for posting)
   */
  getActiveAccounts(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/active`);
  }

  /**
   * Seed Chart of Accounts with default accounting standard data
   * Backend handles all logic and validation on server side
   */
  seedChartOfAccounts(organizationId?: string): Observable<any> {
    // Backend will get organizationId from user context, so we only send empty body
    return this.http.post<any>(`${this.apiUrl}/seed`, {});
  }
}
