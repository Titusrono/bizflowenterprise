import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { GeneralLedgerService } from '../../service/general-ledger.service';
import { ToastrService } from 'ngx-toastr';

interface GLEntry {
  _id: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  balance: number;
  date: string;
  reference: string;
}

@Component({
  selector: 'app-general-ledger-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './general-ledger-list.component.html',
  styleUrls: ['./general-ledger-list.component.scss'],
})
export class GeneralLedgerListComponent implements OnInit {
  glEntries = signal<GLEntry[]>([]);
  loading = signal(false);
  currentPage = signal(1);
  pageSize = signal(50);
  total = signal(0);

  // Make Math available in template
  readonly Math = Math;

  filterForm: FormGroup;

  constructor(
    private glService: GeneralLedgerService,
    private fb: FormBuilder,
    private toastr: ToastrService,
  ) {
    this.filterForm = this.fb.group({
      accountId: [''],
      fromDate: [''],
      toDate: [''],
    });
  }

  ngOnInit(): void {
    this.loadGLEntries();
  }

  loadGLEntries(): void {
    this.loading.set(true);
    const filters = this.filterForm.value;

    this.glService.getGLEntries(filters, this.currentPage(), this.pageSize()).subscribe({
      next: (response) => {
        this.glEntries.set(response.data || []);
        this.total.set(response.total || 0);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading GL entries:', error);
        this.toastr.error('Failed to load General Ledger');
        this.loading.set(false);
      },
    });
  }

  applyFilters(): void {
    this.currentPage.set(1);
    this.loadGLEntries();
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.currentPage.set(1);
    this.loadGLEntries();
  }

  getTrialBalance(): void {
    this.glService.getTrialBalance().subscribe({
      next: (response) => {
        console.log('Trial Balance:', response);
        this.toastr.success('Trial balance retrieved');
      },
      error: (error) => {
        console.error('Error fetching trial balance:', error);
        this.toastr.error('Failed to fetch trial balance');
      },
    });
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.loadGLEntries();
    }
  }

  nextPage(): void {
    if (this.currentPage() * this.pageSize() < this.total()) {
      this.currentPage.update(p => p + 1);
      this.loadGLEntries();
    }
  }
}
