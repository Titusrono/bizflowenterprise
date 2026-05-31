import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Purchase {
  _id: string;
  purchaseNumber: string;
  supplierId: string;
  subtotal: number;
  total: number;
  lineItems: any[];
  status?: string;
  balanceDue?: number;
  receivedTotal?: number;
  receipts?: any[];
  billId?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PurchasesService {
  private apiUrl = `${environment.apiUrl}/purchases`;

  constructor(private http: HttpClient) {}

  create(payload: any): Observable<Purchase> {
    return this.http.post<Purchase>(this.apiUrl, payload);
  }

  convertToBill(purchaseId: string, source: 'ordered' | 'received' = 'ordered') {
    return this.http.post(`${this.apiUrl}/${purchaseId}/convert-to-bill`, { source });
  }

  receivePurchase(purchaseId: string, payload: any) {
    return this.http.post(`${this.apiUrl}/${purchaseId}/receive`, payload);
  }

  approvePurchase(purchaseId: string) {
    return this.http.post(`${this.apiUrl}/${purchaseId}/approve`, {});
  }

  markPaid(purchaseId: string) {
    return this.http.post(`${this.apiUrl}/${purchaseId}/mark-paid`, {});
  }

  deletePurchase(purchaseId: string) {
    return this.http.delete(`${this.apiUrl}/${purchaseId}`);
  }

  getByOrganization(orgId: string, page = 1, limit = 20) {
    return this.http.get<{ data: Purchase[]; total: number }>(`${this.apiUrl}/organization/${orgId}?page=${page}&limit=${limit}`);
  }
}
