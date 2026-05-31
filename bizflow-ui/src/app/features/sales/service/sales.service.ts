import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export type SaleType = 'cash' | 'credit';
export type PaymentMethod = 'bank' | 'cash' | 'mpesa';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';
export type InvoiceStatus = 'open' | 'partial' | 'cleared';

export interface SaleLineItem {
  inventoryId: string;
  sku?: string;
  name?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SalePayment {
  amount: number;
  method: PaymentMethod;
  paidAt: string;
  reference?: string;
  notes?: string;
}

export interface SaleRecord {
  _id: string;
  saleNumber: string;
  invoiceNumber?: string;
  saleType: SaleType;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  invoiceDueDate?: string;
  paymentStatus: PaymentStatus;
  invoiceStatus: InvoiceStatus;
  subtotal: number;
  totalPaid: number;
  balanceDue: number;
  lineItems: SaleLineItem[];
  payments: SalePayment[];
  createdAt: string;
  updatedAt: string;
}

export interface SaleStats {
  totalSales: number;
  cashSales: number;
  creditSales: number;
  paidSales: number;
  unpaidSales: number;
  partialSales: number;
  openInvoices: number;
  clearedInvoices: number;
  totalValue: number;
  totalCollected: number;
  totalOutstanding: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateSalePayload {
  saleType: SaleType;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  invoiceDueDate?: string;
  organizationId?: string;
  branchId?: string;
  lineItems: Array<{
    inventoryId: string;
    quantity: number;
    unitPrice: number;
  }>;
  payments?: Array<{
    amount: number;
    method: PaymentMethod;
    paidAt?: string;
    reference?: string;
    notes?: string;
  }>;
}

export interface PaymentPayload {
  payment: {
    amount: number;
    method: PaymentMethod;
    paidAt?: string;
    reference?: string;
    notes?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class SalesService {
  private apiUrl = `${environment.apiUrl}/sales`;

  constructor(private http: HttpClient) {}

  getSales(
    page: number = 1,
    limit: number = 10,
    branchId?: string,
    saleType?: SaleType,
    paymentStatus?: PaymentStatus,
  ): Observable<PaginatedResponse<SaleRecord>> {
    let params = new HttpParams().set('page', String(page)).set('limit', String(limit));

    if (branchId) {
      params = params.set('branchId', branchId);
    }

    if (saleType) {
      params = params.set('saleType', saleType);
    }

    if (paymentStatus) {
      params = params.set('paymentStatus', paymentStatus);
    }

    return this.http.get<PaginatedResponse<SaleRecord>>(this.apiUrl, { params });
  }

  getSalesStats(branchId?: string): Observable<SaleStats> {
    let params = new HttpParams();
    if (branchId) {
      params = params.set('branchId', branchId);
    }
    return this.http.get<SaleStats>(`${this.apiUrl}/stats/summary`, { params });
  }

  createSale(payload: CreateSalePayload): Observable<SaleRecord> {
    return this.http.post<SaleRecord>(this.apiUrl, payload);
  }

  recordPayment(id: string, payload: PaymentPayload): Observable<SaleRecord> {
    return this.http.post<SaleRecord>(`${this.apiUrl}/${id}/payments`, payload);
  }
}
