import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Customer {
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
export class CustomersService {
  private apiUrl = `${environment.apiUrl}/customers`;

  constructor(private http: HttpClient) {}

  getCustomers(search?: string): Observable<Customer[]> {
    let params = new HttpParams();

    if (search?.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<Customer[]>(this.apiUrl, { params });
  }

  getCustomerById(id: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/${id}`);
  }

  createCustomer(customer: Partial<Customer>): Observable<Customer> {
    return this.http.post<Customer>(this.apiUrl, customer);
  }

  updateCustomer(id: string, customer: Partial<Customer>): Observable<Customer> {
    return this.http.put<Customer>(`${this.apiUrl}/${id}`, customer);
  }

  deleteCustomer(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}