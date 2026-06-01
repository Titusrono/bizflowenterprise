import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class JournalsService {
  private apiUrl = '/api/accounting/journals';

  constructor(private http: HttpClient) {}

  getJournals(filters: any = {}, page = 1, limit = 50): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters.status) {
      params = params.set('status', filters.status);
    }

    if (filters.journalType) {
      params = params.set('journalType', filters.journalType);
    }

    if (filters.period) {
      params = params.set('period', filters.period);
    }

    return this.http.get<any>(`${this.apiUrl}`, { params });
  }

  getJournalById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createJournal(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, data);
  }

  updateJournal(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  deleteJournal(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  postJournal(id: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/post`, {});
  }

  reverseJournal(id: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/reverse`, {});
  }
}
