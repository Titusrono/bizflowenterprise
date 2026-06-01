import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { JournalsService } from '../../service/journals.service';
import { ToastrService } from 'ngx-toastr';
import { JournalsFormComponent } from '../journals-form/journals-form.component';

interface Journal {
  _id: string;
  journalNumber: string;
  type: string;
  status: string;
  period: string;
  description: string;
  lines: any[];
  totalDebit: number;
  totalCredit: number;
  createdAt: string;
}

@Component({
  selector: 'app-journals-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, JournalsFormComponent],
  templateUrl: './journals-list.component.html',
  styleUrls: ['./journals-list.component.scss'],
})
export class JournalsListComponent implements OnInit {
  journals = signal<Journal[]>([]);
  loading = signal(false);
  showForm = signal(false);
  editingId = signal<string | null>(null);
  currentPage = signal(1);
  pageSize = signal(50);
  total = signal(0);

  // Make Math available in template
  readonly Math = Math;

  filterForm: FormGroup;

  journalTypes = [
    { value: 'GL', label: 'General Journal' },
    { value: 'SJ', label: 'Sales Journal' },
    { value: 'PJ', label: 'Purchase Journal' },
    { value: 'CRJ', label: 'Cash Receipt Journal' },
    { value: 'CPJ', label: 'Cash Payment Journal' },
  ];

  journalStatuses = [
    { value: 'DRAFT', label: 'Draft' },
    { value: 'POSTED', label: 'Posted' },
    { value: 'REVERSED', label: 'Reversed' },
  ];

  constructor(
    private journalsService: JournalsService,
    private fb: FormBuilder,
    private toastr: ToastrService,
  ) {
    this.filterForm = this.fb.group({
      status: ['POSTED'],
      journalType: [''],
      period: [''],
    });
  }

  ngOnInit(): void {
    this.loadJournals();
  }

  loadJournals(): void {
    this.loading.set(true);
    const filters = this.filterForm.value;

    this.journalsService.getJournals(filters, this.currentPage(), this.pageSize()).subscribe({
      next: (response) => {
        this.journals.set(response.data || []);
        this.total.set(response.total || 0);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading journals:', error);
        this.toastr.error('Failed to load journals');
        this.loading.set(false);
      },
    });
  }

  applyFilters(): void {
    this.currentPage.set(1);
    this.loadJournals();
  }

  resetFilters(): void {
    this.filterForm.reset({
      status: 'POSTED',
      journalType: '',
      period: '',
    });
    this.currentPage.set(1);
    this.loadJournals();
  }

  openCreate(): void {
    this.editingId.set(null);
    this.showForm.set(true);
  }

  editJournal(journal: Journal): void {
    if (journal.status !== 'DRAFT') {
      this.toastr.error('Only draft journals can be edited');
      return;
    }
    this.editingId.set(journal._id);
    this.showForm.set(true);
  }

  onFormSubmit(success: boolean): void {
    if (success) {
      this.resetForm();
      this.loadJournals();
    }
  }

  postJournal(id: string): void {
    if (confirm('Are you sure you want to post this journal?')) {
      this.journalsService.postJournal(id).subscribe({
        next: () => {
          this.toastr.success('Journal posted successfully');
          this.loadJournals();
        },
        error: (error) => {
          console.error('Error posting journal:', error);
          this.toastr.error('Failed to post journal');
        },
      });
    }
  }

  reverseJournal(id: string): void {
    if (confirm('Are you sure you want to reverse this journal?')) {
      this.journalsService.reverseJournal(id).subscribe({
        next: () => {
          this.toastr.success('Journal reversed successfully');
          this.loadJournals();
        },
        error: (error) => {
          console.error('Error reversing journal:', error);
          this.toastr.error('Failed to reverse journal');
        },
      });
    }
  }

  deleteJournal(id: string): void {
    if (confirm('Are you sure you want to delete this journal?')) {
      this.journalsService.deleteJournal(id).subscribe({
        next: () => {
          this.toastr.success('Journal deleted successfully');
          this.loadJournals();
        },
        error: (error) => {
          console.error('Error deleting journal:', error);
          this.toastr.error('Failed to delete journal');
        },
      });
    }
  }

  resetForm(): void {
    this.editingId.set(null);
    this.showForm.set(false);
  }

  toggleForm(): void {
    this.showForm.update(v => !v);
    if (!this.showForm()) {
      this.resetForm();
    }
  }

  getStatusBadge(status: string): string {
    switch (status) {
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'POSTED':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'REVERSED':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-neutral-100 text-neutral-700 dark:bg-neutral-900/30 dark:text-neutral-300';
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.loadJournals();
    }
  }

  nextPage(): void {
    if (this.currentPage() * this.pageSize() < this.total()) {
      this.currentPage.update(p => p + 1);
      this.loadJournals();
    }
  }
}
