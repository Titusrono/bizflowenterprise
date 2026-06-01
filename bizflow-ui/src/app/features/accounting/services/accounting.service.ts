import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AccountingService {
  private apiUrl = `${environment.apiUrl}/accounting`;

  constructor(private http: HttpClient) {}

  // ============ CHART OF ACCOUNTS ENDPOINTS ============

  /**
   * Create new Chart of Account
   */
  createChartOfAccount(dto: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/chart-of-accounts`, dto);
  }

  /**
   * Get all Chart of Accounts with filtering
   */
  getChartOfAccounts(
    filters?: any,
    page: number = 1,
    limit: number = 50,
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters?.accountType) {
      params = params.set('accountType', filters.accountType.toString());
    }
    if (filters?.accountCode) {
      params = params.set('accountCode', filters.accountCode);
    }
    if (filters?.isActive !== undefined) {
      params = params.set('isActive', filters.isActive.toString());
    }

    return this.http.get(`${this.apiUrl}/chart-of-accounts`, { params });
  }

  /**
   * Get Chart of Account by ID
   */
  getChartOfAccountById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/chart-of-accounts/${id}`);
  }

  /**
   * Get Chart of Account by code
   */
  getChartOfAccountByCode(code: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/chart-of-accounts/code/${code}`);
  }

  /**
   * Get accounts by type
   */
  getAccountsByType(type: number, page = 1, limit = 50): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get(`${this.apiUrl}/chart-of-accounts/type/${type}`, {
      params,
    });
  }

  /**
   * Get active posting accounts
   */
  getActiveAccounts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/chart-of-accounts/active/list`);
  }

  /**
   * Get header accounts
   */
  getHeaderAccounts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/chart-of-accounts/headers/list`);
  }

  /**
   * Update Chart of Account
   */
  updateChartOfAccount(id: string, dto: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/chart-of-accounts/${id}`, dto);
  }

  /**
   * Deactivate account
   */
  deactivateAccount(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/chart-of-accounts/${id}/deactivate`, {});
  }

  /**
   * Delete Chart of Account
   */
  deleteChartOfAccount(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/chart-of-accounts/${id}`);
  }

  /**
   * Get account balance
   */
  getAccountBalance(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/chart-of-accounts/${id}/balance`);
  }

  // ============ JOURNAL ENDPOINTS ============

  /**
   * Create new Journal entry
   */
  createJournal(dto: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/journals`, dto);
  }

  /**
   * Get all journals with filtering
   */
  getJournals(
    filters?: any,
    page: number = 1,
    limit: number = 50,
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    if (filters?.journalType) {
      params = params.set('journalType', filters.journalType);
    }
    if (filters?.period) {
      params = params.set('period', filters.period);
    }
    if (filters?.fromDate) {
      params = params.set('fromDate', filters.fromDate);
    }
    if (filters?.toDate) {
      params = params.set('toDate', filters.toDate);
    }

    return this.http.get(`${this.apiUrl}/journals`, { params });
  }

  /**
   * Get Journal by ID
   */
  getJournalById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/journals/${id}`);
  }

  /**
   * Get journals by period
   */
  getJournalsByPeriod(period: string, page = 1, limit = 50): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get(`${this.apiUrl}/journals/period/${period}`, {
      params,
    });
  }

  /**
   * Get draft journals
   */
  getDraftJournals(): Observable<any> {
    return this.http.get(`${this.apiUrl}/journals/drafts/list`);
  }

  /**
   * Update Journal entry
   */
  updateJournal(id: string, dto: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/journals/${id}`, dto);
  }

  /**
   * Post Journal to General Ledger
   */
  postJournal(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/journals/${id}/post`, {});
  }

  /**
   * Reverse Journal entry
   */
  reverseJournal(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/journals/${id}/reverse`, {});
  }

  /**
   * Bulk post multiple journals
   */
  bulkPostJournals(journalIds: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/journals/bulk/post`, {
      journalIds,
    });
  }

  /**
   * Delete Journal entry
   */
  deleteJournal(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/journals/${id}`);
  }

  // ============ GENERAL LEDGER ENDPOINTS ============

  /**
   * Get GL entries for an account
   */
  getGeneralLedger(
    accountId: string,
    page: number = 1,
    limit: number = 100,
  ): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get(`${this.apiUrl}/general-ledger/account/${accountId}`, {
      params,
    });
  }

  /**
   * Get GL entries by date range
   */
  getGeneralLedgerByDateRange(
    accountId: string,
    fromDate: string,
    toDate: string,
    page = 1,
    limit = 100,
  ): Observable<any> {
    const params = new HttpParams()
      .set('fromDate', fromDate)
      .set('toDate', toDate)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get(
      `${this.apiUrl}/general-ledger/account/${accountId}/date-range`,
      { params },
    );
  }

  /**
   * Get GL entries by period
   */
  getGeneralLedgerByPeriod(
    accountId: string,
    period: string,
  ): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/general-ledger/account/${accountId}/period/${period}`,
    );
  }

  /**
   * Get account balance
   */
  getGLBalance(accountId: string, asOfDate?: string): Observable<any> {
    let params = new HttpParams();
    if (asOfDate) {
      params = params.set('asOfDate', asOfDate);
    }

    return this.http.get(`${this.apiUrl}/general-ledger/account/${accountId}/balance`, {
      params,
    });
  }

  /**
   * Get current account balance
   */
  getCurrentBalance(accountId: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/general-ledger/account/${accountId}/current-balance`,
    );
  }

  /**
   * Get Trial Balance
   */
  getTrialBalance(period?: string, asOfDate?: string): Observable<any> {
    let params = new HttpParams();
    if (period) {
      params = params.set('period', period);
    }
    if (asOfDate) {
      params = params.set('asOfDate', asOfDate);
    }

    return this.http.get(`${this.apiUrl}/general-ledger/trial-balance`, {
      params,
    });
  }

  /**
   * Get unreconciled entries
   */
  getUnreconciledEntries(
    accountId: string,
    page = 1,
    limit = 100,
  ): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get(
      `${this.apiUrl}/general-ledger/account/${accountId}/unreconciled`,
      { params },
    );
  }

  /**
   * Reconcile entries
   */
  reconcileEntries(entryIds: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/general-ledger/reconcile`, {
      entryIds,
    });
  }

  /**
   * Get account totals by period
   */
  getAccountTotalsByPeriod(accountId: string, period: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/general-ledger/account/${accountId}/period/${period}/totals`,
    );
  }

  /**
   * Get entries by counterparty
   */
  getCounterpartyLedger(
    counterpartyId: string,
    page = 1,
    limit = 100,
  ): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get(
      `${this.apiUrl}/general-ledger/counterparty/${counterpartyId}`,
      { params },
    );
  }

  /**
   * Get entries by reference
   */
  getEntriesByReference(referenceNumber: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/general-ledger/reference/${referenceNumber}`,
    );
  }

  /**
   * Generate GL Report
   */
  generateGLReport(period?: string, asOfDate?: string): Observable<any> {
    let params = new HttpParams();
    if (period) {
      params = params.set('period', period);
    }
    if (asOfDate) {
      params = params.set('asOfDate', asOfDate);
    }

    return this.http.get(`${this.apiUrl}/general-ledger/report/trial-balance`, {
      params,
    });
  }

  /**
   * Get account history
   */
  getAccountHistory(
    accountId: string,
    fromDate: string,
    toDate: string,
  ): Observable<any> {
    const params = new HttpParams()
      .set('fromDate', fromDate)
      .set('toDate', toDate);

    return this.http.get(
      `${this.apiUrl}/general-ledger/account/${accountId}/history`,
      { params },
    );
  }
}
