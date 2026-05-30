import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Organization {
  _id: string;
  name: string;
  code: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationStats {
  total: number;
  active: number;
  pending: number;
  archived: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root',
})
export class OrganizationsService {
  private apiUrl = `${environment.apiUrl}/organizations`;

  constructor(private http: HttpClient) {}

  /**
   * Get all organizations with pagination
   */
  getAllOrganizations(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Observable<PaginatedResponse<Organization>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PaginatedResponse<Organization>>(this.apiUrl, {
      params,
    });
  }

  /**
   * Get organization statistics
   */
  getOrganizationStats(): Observable<OrganizationStats> {
    return this.http.get<OrganizationStats>(`${this.apiUrl}/stats/summary`);
  }

  /**
   * Get organization by ID
   */
  getOrganizationById(id: string): Observable<Organization> {
    return this.http.get<Organization>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get organizations for current user
   */
  getUserOrganizations(): Observable<Organization[]> {
    return this.http.get<Organization[]>(`${this.apiUrl}/user/all`);
  }

  /**
   * Create organization
   */
  createOrganization(org: Partial<Organization>): Observable<Organization> {
    return this.http.post<Organization>(this.apiUrl, org);
  }

  /**
   * Update organization
   */
  updateOrganization(id: string, org: Partial<Organization>): Observable<Organization> {
    return this.http.put<Organization>(`${this.apiUrl}/${id}`, org);
  }

  /**
   * Delete organization
   */
  deleteOrganization(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Add member to organization
   */
  addMember(organizationId: string, userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${organizationId}/members/${userId}`, {});
  }

  /**
   * Remove member from organization
   */
  removeMember(organizationId: string, userId: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${organizationId}/members/${userId}`,
    );
  }
}
