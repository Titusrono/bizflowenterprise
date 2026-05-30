import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { AuthResponse } from '../../../../core/models';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  constructor(private authService: AuthService) {}

  register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName: string;
  }): Observable<AuthResponse> {
    return this.authService.register(data);
  }
}
