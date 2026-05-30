import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

interface ModuleStat {
  label: string;
  value: string;
  change: string;
  icon: string;
}

interface ModuleAction {
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-module-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="space-y-6">
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">
            {{ category() }}
          </p>
          <h1 class="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mt-2">
            {{ title() }}
          </h1>
          <p class="text-neutral-600 dark:text-neutral-400 mt-2 max-w-3xl">
            {{ description() }}
          </p>
        </div>
        <button class="btn btn-primary">
          <i class="bi bi-plus-lg me-2"></i>
          New {{ shortLabel() }}
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div *ngFor="let stat of stats()" class="card">
          <div class="card-body p-5">
            <div class="flex items-center justify-between gap-4 mb-3">
              <p class="text-sm font-medium text-neutral-600 dark:text-neutral-400">{{ stat.label }}</p>
              <i class="bi" [ngClass]="stat.icon + ' text-lg text-primary-500'"></i>
            </div>
            <div class="flex items-end justify-between gap-4">
              <p class="text-2xl font-bold text-neutral-900 dark:text-white">{{ stat.value }}</p>
              <span class="text-xs font-semibold text-success-600 dark:text-success-400">{{ stat.change }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div class="xl:col-span-2 card">
          <div class="card-header flex items-center justify-between">
            <h2 class="text-lg font-semibold text-neutral-900 dark:text-white">Overview</h2>
            <i class="bi bi-bar-chart-fill text-neutral-500"></i>
          </div>
          <div class="card-body">
            <div class="min-h-[18rem] rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-700 bg-white/60 dark:bg-neutral-900/60 flex items-center justify-center text-center px-6">
              <div>
                <i class="bi bi-graph-up-arrow text-3xl text-primary-500"></i>
                <p class="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
                  Visual insights for {{ shortLabel() }} will appear here.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h2 class="text-lg font-semibold text-neutral-900 dark:text-white">Quick Actions</h2>
          </div>
          <div class="card-body space-y-4">
            <div *ngFor="let action of actions()" class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-300">
                <i class="bi" [ngClass]="action.icon"></i>
              </div>
              <div>
                <p class="font-medium text-neutral-900 dark:text-white">{{ action.title }}</p>
                <p class="text-sm text-neutral-600 dark:text-neutral-400">{{ action.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class ModulePageComponent implements OnInit {
  title = signal('Module');
  shortLabel = signal('Item');
  category = signal('Module');
  description = signal('Manage records, review activity, and take action from a single workspace.');
  stats = signal<ModuleStat[]>([]);
  actions = signal<ModuleAction[]>([]);

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const data = this.route.snapshot.data as Partial<{
      title: string;
      shortLabel: string;
      category: string;
      description: string;
      stats: ModuleStat[];
      actions: ModuleAction[];
    }>;

    this.title.set(data.title || 'Module');
    this.shortLabel.set(data.shortLabel || 'Item');
    this.category.set(data.category || 'Module');
    this.description.set(data.description || 'Manage records, review activity, and take action from a single workspace.');
    this.stats.set(
      data.stats || [
        { label: 'Total', value: '128', change: '+12%', icon: 'bi-collection' },
        { label: 'Active', value: '94', change: '+8%', icon: 'bi-lightning-charge-fill' },
        { label: 'Pending', value: '18', change: '+3%', icon: 'bi-hourglass-split' },
        { label: 'Archived', value: '16', change: '+1%', icon: 'bi-archive-fill' },
      ]
    );
    this.actions.set(
      data.actions || [
        { title: 'Create record', description: 'Add a new entry quickly.', icon: 'bi-plus-circle-fill' },
        { title: 'Review list', description: 'Browse, filter, and inspect items.', icon: 'bi-list-check' },
        { title: 'Export data', description: 'Download the current view.', icon: 'bi-download' },
      ]
    );
  }
}
