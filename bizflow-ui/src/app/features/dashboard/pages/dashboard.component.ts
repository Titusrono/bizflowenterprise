import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DashboardCard {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: number;
  unit?: string;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  icon: string;
}

interface TopCategory {
  name: string;
  percentage: number;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="space-y-6 max-w-full">
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
            Welcome back, {{ userName() }}
          </h1>
          <p class="text-neutral-600 dark:text-neutral-400 mt-2">
            Here's what's happening with your business today
          </p>
        </div>
        <button class="btn btn-primary">
          <i class="bi bi-arrow-clockwise me-2"></i>
          Refresh
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        <div *ngFor="let card of dashboardCards()" class="card border-l-4" [ngClass]="'border-' + card.color">
          <div class="card-body p-5">
            <div class="flex items-center justify-between mb-3">
              <p class="text-sm font-medium text-neutral-600 dark:text-neutral-400">{{ card.title }}</p>
              <i class="bi" [ngClass]="card.icon + ' text-lg text-neutral-500'"></i>
            </div>
            <div class="flex items-end justify-between gap-4">
              <p class="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                {{ card.value }}
                <span *ngIf="card.unit" class="text-base text-neutral-500">{{ card.unit }}</span>
              </p>
              <span
                *ngIf="card.trend"
                [class]="'text-sm font-semibold ' + (card.trend > 0 ? 'text-success-500' : 'text-danger-500')"
              >
                {{ card.trend > 0 ? '▲' : '▼' }} {{ Math.abs(card.trend) }}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div class="xl:col-span-2 card">
          <div class="card-header flex items-center justify-between">
            <h3 class="text-lg font-semibold text-neutral-900 dark:text-white">Revenue Overview</h3>
            <i class="bi bi-graph-up-arrow text-neutral-500"></i>
          </div>
          <div class="card-body">
            <div class="min-h-[18rem] rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-700 bg-gradient-to-br from-primary-50/70 to-secondary-50/70 dark:from-neutral-800 dark:to-neutral-900 flex-center">
              <p class="text-neutral-500 dark:text-neutral-400">Chart Placeholder</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header flex items-center justify-between">
            <h3 class="text-lg font-semibold text-neutral-900 dark:text-white">Top Categories</h3>
            <i class="bi bi-pie-chart-fill text-neutral-500"></i>
          </div>
          <div class="card-body">
            <div class="space-y-4">
              <div *ngFor="let cat of topCategories()" class="flex items-center justify-between gap-3">
                <span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">{{ cat.name }}</span>
                <div class="flex items-center gap-2">
                  <div class="h-2 rounded-full w-12" [class]="'bg-' + cat.color"></div>
                  <span class="text-sm font-semibold text-neutral-900 dark:text-white">{{ cat.percentage }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header flex items-center justify-between">
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-white">Recent Activities</h3>
          <i class="bi bi-clock-history text-neutral-500"></i>
        </div>
        <div class="card-body">
          <div class="space-y-3">
            <div *ngFor="let activity of recentActivities()" class="flex items-start gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-700 last:border-0">
              <i class="bi" [ngClass]="activity.icon + ' mt-1 text-lg text-primary-500'"></i>
              <div class="flex-1">
                <p class="text-sm font-medium text-neutral-900 dark:text-white">{{ activity.type }}</p>
                <p class="text-xs text-neutral-600 dark:text-neutral-400">{{ activity.description }}</p>
              </div>
              <span class="text-xs text-neutral-500 dark:text-neutral-500 whitespace-nowrap">
                {{ formatTime(activity.timestamp) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [],
})
export class DashboardComponent implements OnInit {
  userName = signal('User');
  dashboardCards = signal<DashboardCard[]>([]);
  topCategories = signal<TopCategory[]>([]);
  recentActivities = signal<RecentActivity[]>([]);
  Math = Math;

  ngOnInit(): void {
    this.initializeDashboard();
  }

  private initializeDashboard(): void {
    this.dashboardCards.set([
      {
        title: 'Total Revenue',
        value: 45.2,
        icon: 'bi-cash-stack',
        color: 'primary-500',
        trend: 12.5,
        unit: 'K',
      },
      {
        title: 'Total Orders',
        value: 1234,
        icon: 'bi-box-seam',
        color: 'success-500',
        trend: 8.3,
      },
      {
        title: 'Active Users',
        value: 567,
        icon: 'bi-people-fill',
        color: 'info-500',
        trend: 5.2,
      },
      {
        title: 'Conversion Rate',
        value: 3.24,
        icon: 'bi-bar-chart-fill',
        color: 'warning-500',
        trend: -2.1,
        unit: '%',
      },
    ]);

    this.topCategories.set([
      { name: 'Electronics', percentage: 35, color: 'primary-500' },
      { name: 'Clothing', percentage: 25, color: 'secondary-500' },
      { name: 'Food', percentage: 20, color: 'success-500' },
      { name: 'Others', percentage: 20, color: 'warning-500' },
    ]);

    this.recentActivities.set([
      {
        id: '1',
        type: 'New Order',
        description: 'Customer ordered $500 worth of electronics',
        timestamp: new Date(Date.now() - 5 * 60000),
        icon: 'bi-clipboard-check-fill',
      },
      {
        id: '2',
        type: 'Payment Received',
        description: 'Payment of $1,200 received from ABC Corp',
        timestamp: new Date(Date.now() - 15 * 60000),
        icon: 'bi-check-circle-fill',
      },
      {
        id: '3',
        type: 'User Registered',
        description: 'New user john@example.com registered',
        timestamp: new Date(Date.now() - 30 * 60000),
        icon: 'bi-person-plus-fill',
      },
      {
        id: '4',
        type: 'Report Generated',
        description: 'Monthly sales report has been generated',
        timestamp: new Date(Date.now() - 60 * 60000),
        icon: 'bi-file-earmark-bar-graph-fill',
      },
    ]);
  }

  formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
  }
}
