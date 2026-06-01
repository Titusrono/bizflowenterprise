import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GeneralLedgerService {
  private apiUrl = '/api/accounting/general-ledger';

  constructor(private http: HttpClient) {}

  getGLEntries(filters: any = {}, page = 1, limit = 50): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters.accountId) {
      params = params.set('accountId', filters.accountId);
    }

    if (filters.fromDate) {
      params = params.set('fromDate', filters.fromDate);
    }

    if (filters.toDate) {
      params = params.set('toDate', filters.toDate);
    }

    return this.http.get<any>(`${this.apiUrl}`, { params });
  }

  getAccountLedger(accountId: string, page = 1, limit = 100): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<any>(`${this.apiUrl}/account/${accountId}`, { params });
  }

  getLedgerByDateRange(accountId: string, fromDate: string, toDate: string): Observable<any> {
    const params = new HttpParams()
      .set('fromDate', fromDate)
      .set('toDate', toDate);

    return this.http.get<any>(`${this.apiUrl}/account/${accountId}/date-range`, { params });
  }

  getTrialBalance(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/trial-balance`);
  }

  reconcileEntries(entryIds: string[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reconcile`, { entryIds });
  }
}
