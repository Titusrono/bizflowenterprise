import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { AuthResponse } from '../../../../core/models';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(private authService: AuthService) {}

  login(email: string, password: string): Observable<AuthResponse> {
    return this.authService.login(email, password);
  }
}
