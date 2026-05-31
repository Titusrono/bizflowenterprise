import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Bill {
  _id: string;
  supplierId: string;
  total: number;
  subtotal: number;
  lineItems: any[];
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
export class BillsService {
  private apiUrl = `${environment.apiUrl}/bills`;

  constructor(private http: HttpClient) {}

  create(payload: Partial<Bill>): Observable<Bill> {
    return this.http.post<Bill>(this.apiUrl, payload);
  }

  getByOrganization(orgId: string, page = 1, limit = 20): Observable<PaginatedResponse<Bill>> {
    let params = new HttpParams().set('page', String(page)).set('limit', String(limit));
    return this.http.get<PaginatedResponse<Bill>>(`${this.apiUrl}/organization/${orgId}`, { params });
  }

  recordPayment(id: string, payload: PaymentPayload): Observable<Bill> {
    return this.http.post<Bill>(`${this.apiUrl}/${id}/payments`, payload);
  }

  deleteBill(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
