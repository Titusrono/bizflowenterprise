import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Inventory {
  _id: string;
  name: string;
  sku: string;
  description?: string;
  category?: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  reorderLevel: number;
  location?: string;
  organizationId: string;
  branchId?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryStats {
  total: number;
  active: number;
  lowStock: number;
  outOfStock: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private apiUrl = `${environment.apiUrl}/inventory`;

  constructor(private http: HttpClient) {}

  getAllInventory(page: number = 1, limit: number = 10, search?: string): Observable<PaginatedResponse<Inventory>> {
    let params = new HttpParams().set('page', String(page)).set('limit', String(limit));
    if (search) params = params.set('search', search);
    return this.http.get<PaginatedResponse<Inventory>>(this.apiUrl, { params });
  }

  getInventoryStats(): Observable<InventoryStats> {
    return this.http.get<InventoryStats>(`${this.apiUrl}/stats/summary`);
  }

  getOrganizationInventoryStats(organizationId: string, branchId?: string): Observable<InventoryStats> {
    let params = new HttpParams();
    if (branchId) {
      params = params.set('branchId', branchId);
    }
    return this.http.get<InventoryStats>(`${this.apiUrl}/organization/${organizationId}/stats/summary`, { params });
  }

  getInventoryByOrganization(organizationId: string, branchId?: string, page: number = 1, limit: number = 10): Observable<PaginatedResponse<Inventory>> {
    let params = new HttpParams().set('page', String(page)).set('limit', String(limit));
    if (branchId) {
      params = params.set('branchId', branchId);
    }
    return this.http.get<PaginatedResponse<Inventory>>(`${this.apiUrl}/organization/${organizationId}`, { params });
  }

  getInventoryById(id: string): Observable<Inventory> {
    return this.http.get<Inventory>(`${this.apiUrl}/${id}`);
  }

  createInventory(payload: Partial<Inventory>): Observable<Inventory> {
    return this.http.post<Inventory>(this.apiUrl, payload);
  }

  updateInventory(id: string, payload: Partial<Inventory>): Observable<Inventory> {
    return this.http.put<Inventory>(`${this.apiUrl}/${id}`, payload);
  }

  deleteInventory(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
