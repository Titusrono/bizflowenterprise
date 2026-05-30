import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  status: string;
  organizationId?: string;
  branchId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  admins: number;
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
export class UsersService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  /**
   * Get all users with pagination
   */
  getAllUsers(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Observable<PaginatedResponse<User>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PaginatedResponse<User>>(this.apiUrl, { params });
  }

  /**
   * Get user statistics
   */
  getUserStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.apiUrl}/stats/summary`);
  }

  /**
   * Get user statistics for an organization
   */
  getOrganizationUserStats(organizationId: string): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.apiUrl}/organization/${organizationId}/stats/summary`);
  }

  /**
   * Get user by ID
   */
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get users by organization
   */
  getUsersByOrganization(
    organizationId: string,
    page: number = 1,
    limit: number = 10,
  ): Observable<PaginatedResponse<User>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<PaginatedResponse<User>>(
      `${this.apiUrl}/organization/${organizationId}`,
      { params },
    );
  }

  /**
   * Get users by branch
   */
  getUsersByBranch(
    branchId: string,
    page: number = 1,
    limit: number = 10,
  ): Observable<PaginatedResponse<User>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<PaginatedResponse<User>>(
      `${this.apiUrl}/branch/${branchId}`,
      { params },
    );
  }

  /**
   * Get users by role
   */
  getUsersByRole(
    role: string,
    organizationId?: string,
  ): Observable<User[]> {
    let params = new HttpParams();
    if (organizationId) {
      params = params.set('organizationId', organizationId);
    }

    return this.http.get<User[]>(`${this.apiUrl}/role/${role}`, { params });
  }

  /**
   * Create user
   */
  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  /**
   * Update user
   */
  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  /**
   * Delete user
   */
  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
