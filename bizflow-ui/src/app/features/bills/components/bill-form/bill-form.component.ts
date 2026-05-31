import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ReactiveFormsModule, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SuppliersService } from '../../../suppliers/service/suppliers.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../core/services/auth.service';
import { ScopeService } from '../../../../core/services/scope.service';

@Component({
  selector: 'app-bill-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './bill-form.component.html',
  styleUrls: ['./bill-form.component.scss'],
})
export class BillFormComponent implements OnInit {
  @Output() created = new EventEmitter<void>();
  form: FormGroup;
  suppliers: any[] = [];
  total = 0;

  constructor(
    private fb: FormBuilder,
    private suppliersService: SuppliersService,
    private http: HttpClient,
    private authService: AuthService,
    private scopeService: ScopeService,
  ) {
    this.form = this.fb.group({ supplierId: ['', Validators.required], lineItems: this.fb.array([]) });
  }

  ngOnInit(): void {
    this.loadSuppliers();
    this.addLine();
  }

  get lineItems(): FormArray {
    return this.form.get('lineItems') as FormArray;
  }

  addLine() {
    this.lineItems.push(this.fb.group({ name: ['', Validators.required], quantity: [1, Validators.min(1)], unitPrice: [0, Validators.min(0)], subtotal: [0] }));
  }

  removeLine(i: number) {
    this.lineItems.removeAt(i);
    this.recalcTotal();
  }

  recalcLine(i: number) {
    const ctl = this.lineItems.at(i) as FormGroup;
    const q = Number(ctl.get('quantity')?.value || 0);
    const p = Number(ctl.get('unitPrice')?.value || 0);
    ctl.get('subtotal')?.setValue(q * p, { emitEvent: false });
    this.recalcTotal();
  }

  recalcTotal() {
    this.total = this.lineItems.controls.reduce((s, c) => s + Number(c.get('subtotal')?.value || 0), 0);
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
      supplierId: this.form.value.supplierId,
      lineItems: this.form.value.lineItems,
      subtotal: this.total,
      total: this.total,
    };
    this.http.post(`${environment.apiUrl}/bills`, payload).subscribe(() => this.created.emit());
  }
}
