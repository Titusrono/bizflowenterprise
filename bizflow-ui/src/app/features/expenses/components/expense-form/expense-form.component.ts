import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SuppliersService } from '../../../suppliers/service/suppliers.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../core/services/auth.service';
import { ScopeService } from '../../../../core/services/scope.service';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './expense-form.component.html',
  styleUrls: ['./expense-form.component.scss'],
})
export class ExpenseFormComponent implements OnInit {
  @Output() created = new EventEmitter<void>();
  form: FormGroup;
  suppliers: any[] = [];

  constructor(
    private fb: FormBuilder,
    private suppliersService: SuppliersService,
    private http: HttpClient,
    private authService: AuthService,
    private scopeService: ScopeService,
  ) {
    this.form = this.fb.group({ supplierId: [''], description: ['', Validators.required], amount: [0, Validators.min(0)] });
  }

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers() {
    this.suppliersService.getSuppliers().subscribe((res) => (this.suppliers = res));
  }

  submit() {
    if (this.form.invalid) return;

    const currentUser = this.authService.getCurrentUser();
    const orgId = this.scopeService.getSelectedOrganizationId() || currentUser?.organizationId || '';

    const payload = {
      organizationId: orgId,
      supplierId: this.form.value.supplierId || null,
      description: this.form.value.description,
      amount: this.form.value.amount,
    };
    this.http.post(`${environment.apiUrl}/expenses`, payload).subscribe(() => this.created.emit());
  }
}
