import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export type PaymentProviderType = 'cash' | 'mpesa' | 'till' | 'paybill' | 'bank';

export interface PaymentSetting {
  _id: string;
  name: string;
  providerType: PaymentProviderType;
  accountName?: string;
  bankName?: string;
  branchName?: string;
  phoneNumber?: string;
  tillNumber?: string;
  paybillNumber?: string;
  accountNumber?: string;
  notes?: string;
  isDefault?: boolean;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentsService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  getPayments(search?: string): Observable<PaymentSetting[]> {
    let params = new HttpParams();

    if (search?.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<PaymentSetting[]>(this.apiUrl, { params });
  }

  getPaymentById(id: string): Observable<PaymentSetting> {
    return this.http.get<PaymentSetting>(`${this.apiUrl}/${id}`);
  }

  createPayment(payment: Partial<PaymentSetting>): Observable<PaymentSetting> {
    return this.http.post<PaymentSetting>(this.apiUrl, payment);
  }

  updatePayment(id: string, payment: Partial<PaymentSetting>): Observable<PaymentSetting> {
    return this.http.put<PaymentSetting>(`${this.apiUrl}/${id}`, payment);
  }

  deletePayment(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}