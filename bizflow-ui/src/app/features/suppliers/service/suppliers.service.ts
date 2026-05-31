import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Supplier {
  _id: string;
  name: string;
  phoneNumber?: string;
  email?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class SuppliersService {
  private apiUrl = `${environment.apiUrl}/suppliers`;

  constructor(private http: HttpClient) {}

  getSuppliers(search?: string): Observable<Supplier[]> {
    let params = new HttpParams();

    if (search?.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<Supplier[]>(this.apiUrl, { params });
  }

  getSupplierById(id: string): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.apiUrl}/${id}`);
  }

  createSupplier(supplier: Partial<Supplier>): Observable<Supplier> {
    return this.http.post<Supplier>(this.apiUrl, supplier);
  }

  updateSupplier(id: string, supplier: Partial<Supplier>): Observable<Supplier> {
    return this.http.put<Supplier>(`${this.apiUrl}/${id}`, supplier);
  }

  deleteSupplier(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}