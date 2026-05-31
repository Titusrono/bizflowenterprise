import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Expense {
  _id: string;
  supplierId?: string | null;
  description: string;
  amount: number;
  paymentStatus?: string;
  balanceDue?: number;
  status?: string;
}

export interface PaymentPayload {
  payment: {
    amount: number;
    method: 'bank' | 'cash' | 'mpesa';
    paidAt?: string;
    reference?: string;
    notes?: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class ExpensesService {
  private apiUrl = `${environment.apiUrl}/expenses`;

  constructor(private http: HttpClient) {}

  create(payload: Partial<Expense>): Observable<Expense> {
    return this.http.post<Expense>(this.apiUrl, payload);
  }

  getByOrganization(orgId: string, page = 1, limit = 20): Observable<PaginatedResponse<Expense>> {
    let params = new HttpParams().set('page', String(page)).set('limit', String(limit));
    return this.http.get<PaginatedResponse<Expense>>(`${this.apiUrl}/organization/${orgId}`, { params });
  }

  recordPayment(id: string, payload: PaymentPayload): Observable<Expense> {
    return this.http.post<Expense>(`${this.apiUrl}/${id}/payments`, payload);
  }

  deleteExpense(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
