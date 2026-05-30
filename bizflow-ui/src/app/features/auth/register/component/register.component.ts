import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RegisterService } from '../service/register.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { BIZFLOW_BRANDING } from '../../../../core/constants/branding.constants';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = signal(false);
  error = signal('');
  showPassword = signal(false);
  currentStep = signal(1); // 1 for account info, 2 for password setup
  branding = BIZFLOW_BRANDING;

  constructor(
    private fb: FormBuilder,
    private registerService: RegisterService,
    private router: Router,
    private themeService: ThemeService
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      organizationName: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      agreeTerms: [false, [Validators.requiredTrue]],
    });
  }

  goToNextStep(): void {
    // Validate step 1 fields
    if (this.currentStep() === 1) {
      const step1Controls = ['firstName', 'lastName', 'email', 'organizationName'];
      const allValid = step1Controls.every(
        (field) => this.registerForm.get(field)?.valid
      );

      if (!allValid) {
        this.error.set('Please fill in all required fields correctly');
        return;
      }
      this.error.set('');
      this.currentStep.set(2);
    }
  }

  goToPreviousStep(): void {
    if (this.currentStep() > 1) {
      this.error.set('');
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.error.set('Please fill in all required fields correctly');
      return;
    }

    const { password, confirmPassword } = this.registerForm.value;
    if (password !== confirmPassword) {
      this.error.set('Passwords do not match');
      return;
    }

    if (!this.registerForm.get('agreeTerms')?.value) {
      this.error.set('You must agree to the terms and privacy policy');
      return;
    }

    this.isLoading.set(true);
    this.error.set('');

    const { firstName, lastName, email, organizationName, password: pwd } = this.registerForm.value;

    this.registerService
      .register({
        email,
        password: pwd,
        firstName,
        lastName,
        organizationName,
      })
      .subscribe({
        next: () => {
          this.router.navigate(['/auth/login']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.error.set(err?.error?.message || 'Registration failed. Please try again.');
        },
      });
  }
}
