import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Branch {
  _id: string;
  name: string;
  code: string;
  location?: string;
  phone?: string;
  email?: string;
  organizationId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface BranchStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
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
export class BranchesService {
  private apiUrl = `${environment.apiUrl}/branches`;

  constructor(private http: HttpClient) {}

  /**
   * Get all branches with pagination
   */
  getAllBranches(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Observable<PaginatedResponse<Branch>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PaginatedResponse<Branch>>(this.apiUrl, { params });
  }

  /**
   * Get branch statistics
   */
  getBranchStats(): Observable<BranchStats> {
    return this.http.get<BranchStats>(`${this.apiUrl}/stats/summary`);
  }

  /**
   * Get branch statistics for an organization
   */
  getOrganizationBranchStats(organizationId: string): Observable<BranchStats> {
    return this.http.get<BranchStats>(`${this.apiUrl}/organization/${organizationId}/stats/summary`);
  }

  /**
   * Get branch by ID
   */
  getBranchById(id: string): Observable<Branch> {
    return this.http.get<Branch>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get branches by organization
   */
  getBranchesByOrganization(
    organizationId: string,
    page: number = 1,
    limit: number = 10,
  ): Observable<PaginatedResponse<Branch>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<PaginatedResponse<Branch>>(
      `${this.apiUrl}/organization/${organizationId}`,
      { params },
    );
  }

  /**
   * Get active branches for organization
   */
  getActiveBranches(organizationId: string): Observable<Branch[]> {
    return this.http.get<Branch[]>(
      `${this.apiUrl}/organization/${organizationId}/active`,
    );
  }

  /**
   * Create branch
   */
  createBranch(
    branch: Partial<Branch>,
    organizationId: string,
  ): Observable<Branch> {
    const params = new HttpParams().set('organizationId', organizationId);
    return this.http.post<Branch>(this.apiUrl, branch, { params });
  }

  /**
   * Update branch
   */
  updateBranch(id: string, branch: Partial<Branch>): Observable<Branch> {
    return this.http.put<Branch>(`${this.apiUrl}/${id}`, branch);
  }

  /**
   * Delete branch
   */
  deleteBranch(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
