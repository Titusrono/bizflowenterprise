import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Tax {
  _id: string;
  name: string;
  percentage: number;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class TaxesService {
  private apiUrl = `${environment.apiUrl}/taxes`;

  constructor(private http: HttpClient) {}

  getTaxes(search?: string): Observable<Tax[]> {
    let params = new HttpParams();

    if (search?.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<Tax[]>(this.apiUrl, { params });
  }

  getTaxById(id: string): Observable<Tax> {
    return this.http.get<Tax>(`${this.apiUrl}/${id}`);
  }

  createTax(tax: Partial<Tax>): Observable<Tax> {
    return this.http.post<Tax>(this.apiUrl, tax);
  }

  updateTax(id: string, tax: Partial<Tax>): Observable<Tax> {
    return this.http.put<Tax>(`${this.apiUrl}/${id}`, tax);
  }

  deleteTax(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}