import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Inventory, PaginatedResponse } from '../../inventory/service/inventory.service';

export enum RestockRequestStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface RestockLineItem {
  inventoryId: string;
  sku?: string;
  name?: string;
  requestedQuantity: number;
  approvedQuantity?: number;
  unitCost?: number;
  notes?: string;
}

export interface RestockRequest {
  _id: string;
  referenceNumber?: string;
  organizationId: string;
  branchId?: string;
  requestedBy: string;
  approvedBy?: string;
  approvedAt?: string;
  status: RestockRequestStatus | string;
  notes?: string;
  approvalNotes?: string;
  lineItems: RestockLineItem[];
  createdAt: string;
  updatedAt: string;
}

export interface RestockStats {
  total: number;
  draft: number;
  pending: number;
  approved: number;
  lineItems: number;
}

export interface RestockRequestPayload {
  referenceNumber?: string;
  notes?: string;
  organizationId?: string;
  branchId?: string;
  status?: RestockRequestStatus;
  lineItems: RestockLineItem[];
}

@Injectable({ providedIn: 'root' })
export class RestockService {
  private apiUrl = `${environment.apiUrl}/restocks`;

  constructor(private http: HttpClient) {}

  getRestocks(page: number = 1, limit: number = 10, branchId?: string): Observable<PaginatedResponse<RestockRequest>> {
    let params = new HttpParams().set('page', String(page)).set('limit', String(limit));
    if (branchId) {
      params = params.set('branchId', branchId);
    }
    return this.http.get<PaginatedResponse<RestockRequest>>(this.apiUrl, { params });
  }

  getRestockStats(branchId?: string): Observable<RestockStats> {
    let params = new HttpParams();
    if (branchId) {
      params = params.set('branchId', branchId);
    }
    return this.http.get<RestockStats>(`${this.apiUrl}/stats/summary`, { params });
  }

  createRestock(payload: RestockRequestPayload): Observable<RestockRequest> {
    return this.http.post<RestockRequest>(this.apiUrl, payload);
  }

  updateRestock(id: string, payload: RestockRequestPayload): Observable<RestockRequest> {
    return this.http.put<RestockRequest>(`${this.apiUrl}/${id}`, payload);
  }

  submitRestock(id: string): Observable<RestockRequest> {
    return this.http.post<RestockRequest>(`${this.apiUrl}/${id}/submit`, {});
  }

  approveRestock(id: string, approvalNotes?: string): Observable<RestockRequest> {
    return this.http.post<RestockRequest>(`${this.apiUrl}/${id}/approve`, { approvalNotes });
  }

  rejectRestock(id: string, approvalNotes?: string): Observable<RestockRequest> {
    return this.http.post<RestockRequest>(`${this.apiUrl}/${id}/reject`, { approvalNotes });
  }
}
