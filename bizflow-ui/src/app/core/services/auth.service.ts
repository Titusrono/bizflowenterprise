import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, AuthResponse, UserRole } from '../models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly tokenKey = environment.auth.tokenKey;
  private readonly refreshTokenKey = environment.auth.refreshTokenKey;

  private currentUserSubject = new BehaviorSubject<User | null>(this.loadUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(!!this.getToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Register a new user
   */
  register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName: string;
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap((response) => {
        this.setTokens(response.accessToken, response.refreshToken, response.expiresIn);
        this.setCurrentUser(response.user);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Login user
   */
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap((response) => {
          this.setTokens(response.accessToken, response.refreshToken, response.expiresIn);
          this.setCurrentUser(response.user);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Refresh access token
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return this.http
      .post<AuthResponse>(`${this.apiUrl}/refresh`, { refreshToken })
      .pipe(
        tap((response) => {
          this.setTokens(response.accessToken, response.refreshToken, response.expiresIn);
        }),
        catchError((error) => {
          this.logout();
          throw error;
        })
      );
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get access token
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.currentUserSubject.value;
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role: UserRole | UserRole[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Map roles to permissions
    const rolePermissions: Record<UserRole, string[]> = {
      [UserRole.SUPER_ADMIN]: ['*'], // All permissions
      [UserRole.ADMIN]: ['create', 'read', 'update', 'delete'],
      [UserRole.MANAGER]: ['create', 'read', 'update'],
      [UserRole.USER]: ['read'],
    };

    const permissions = rolePermissions[user.role];
    return permissions.includes('*') || permissions.includes(permission);
  }

  /**
   * Update user profile
   */
  updateProfile(userId: string, data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${userId}`, data).pipe(
      tap((user) => {
        this.setCurrentUser(user);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Forgot password
   */
  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.apiUrl}/forgot-password`, { email })
      .pipe(catchError(this.handleError));
  }

  /**
   * Reset password
   */
  resetPassword(token: string, password: string): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.apiUrl}/reset-password`, { token, password })
      .pipe(catchError(this.handleError));
  }

  /**
   * Change password
   */
  changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.apiUrl}/change-password`, {
        userId,
        currentPassword,
        newPassword,
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Set current user
   */
  private setCurrentUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Set tokens
   */
  private setTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
    localStorage.setItem(this.tokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
    localStorage.setItem(environment.auth.expiresInKey, expiresIn.toString());
  }

  /**
   * Load user from storage
   */
  private loadUserFromStorage(): User | null {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }

  /**
   * Handle HTTP errors
   */
  private handleError = (error: any) => {
    console.error('API Error:', error);
    return throwError(() => error);
  };
}
