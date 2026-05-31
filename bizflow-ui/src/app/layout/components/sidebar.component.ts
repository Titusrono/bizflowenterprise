import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  queryParams?: Record<string, string>;
  badge?: number;
}

interface NavGroup {
  label: string;
  icon: string;
  key: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside
      class="fixed left-0 top-0 h-full w-64 bg-white dark:bg-[#0a1220] border-r border-neutral-200 dark:border-[#1e293b] transition-transform duration-300 z-40 overflow-hidden -translate-x-full md:translate-x-0"
      [class.translate-x-0]="sidebarOpen()"
      [class.-translate-x-full]="!sidebarOpen()"
    >
      <!-- Logo Section -->
      <div class="p-6 border-b border-neutral-200 dark:border-[#1e293b]">
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex-center text-white font-bold text-lg">
            B
          </div>
          <div>
            <h1 class="text-lg font-bold text-neutral-900 dark:text-white">BizFlow</h1>
            <p class="text-xs text-neutral-500 dark:text-[#94a3b8]">Enterprise</p>
          </div>
        </div>
      </div>

      <!-- Navigation Items -->
      <nav class="flex flex-col gap-2 p-4">
        <div *ngFor="let item of navigationItems()" class="mb-2">
          <a
            [routerLink]="item.route"
            [queryParams]="item.queryParams || null"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: false }"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-700 dark:text-[#cbd5e1] hover:bg-primary-50 dark:hover:bg-[#1a2540] transition-all duration-200 relative group"
            [ngClass]="{
              'bg-primary-100': isNavItemActive(item),
              'dark:bg-primary-900': isNavItemActive(item),
              'text-primary-600': isNavItemActive(item),
              'dark:text-primary-400': isNavItemActive(item)
            }"
          >
            <i class="bi" [ngClass]="item.icon + ' text-base'"></i>
            <span class="font-medium flex-1">{{ item.label }}</span>
            <span
              *ngIf="item.badge && item.badge > 0"
              class="badge badge-primary ml-2"
            >
              {{ item.badge }}
            </span>
          </a>
        </div>

        <div *ngFor="let group of navigationGroups()" class="mb-2">
          <button
            type="button"
            (click)="toggleGroup(group.key)"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-700 dark:text-[#cbd5e1] hover:bg-primary-50 dark:hover:bg-[#1a2540] transition-all duration-200"
          >
            <span class="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300">
              <i class="bi" [ngClass]="group.icon + ' text-xs'"></i>
            </span>
            <span class="font-semibold flex-1 text-left uppercase tracking-wider text-[11px]">{{ group.label }}</span>
            <i class="bi text-sm transition-transform" [ngClass]="isGroupOpen(group.key) ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
          </button>

          <div *ngIf="isGroupOpen(group.key)" class="mt-2 ml-3 space-y-2">
            <a
              *ngFor="let item of group.items"
              [routerLink]="item.route"
              [queryParams]="item.queryParams || null"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: false }"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-700 dark:text-[#cbd5e1] hover:bg-primary-50 dark:hover:bg-[#1a2540] transition-all duration-200 relative group"
              [ngClass]="{
                'bg-primary-100': isNavItemActive(item),
                'dark:bg-primary-900': isNavItemActive(item),
                'text-primary-600': isNavItemActive(item),
                'dark:text-primary-400': isNavItemActive(item)
              }"
            >
              <i class="bi" [ngClass]="item.icon + ' text-base'"></i>
              <span class="font-medium flex-1">{{ item.label }}</span>
              <span
                *ngIf="item.badge && item.badge > 0"
                class="badge badge-primary ml-2"
              >
                {{ item.badge }}
              </span>
            </a>
          </div>
        </div>
      </nav>

      <!-- Footer -->
      <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-200 dark:border-[#1e293b] bg-white dark:bg-[#0a1220]">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 flex-1">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500"></div>
            <div class="text-sm">
              <p class="font-medium text-neutral-900 dark:text-white">{{ currentUser()?.firstName }}</p>
              <p class="text-xs text-neutral-500 dark:text-[#94a3b8]">{{ currentUser()?.role }}</p>
            </div>
          </div>
          <button
            (click)="toggleTheme()"
            class="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-[#1a2540] transition-colors"
            [title]="isDarkMode() ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <i class="bi" [ngClass]="isDarkMode() ? 'bi-sun-fill' : 'bi-moon-fill'"></i>
          </button>
        </div>
      </div>
    </aside>

    <!-- Mobile Toggle Button -->
    <button
      (click)="toggleSidebar()"
      class="md:hidden fixed top-4 left-4 p-2 rounded-lg bg-primary-500 text-white z-50 hover:bg-primary-600 transition-colors"
      aria-label="Toggle sidebar"
    >
      <i class="bi bi-list"></i>
    </button>
  `,
  styles: [],
})
export class SidebarComponent implements OnInit {
  sidebarOpen = signal(false);
  navigationItems = signal<NavItem[]>([]);
  navigationGroups = signal<NavGroup[]>([]);
  openGroups = signal<Record<string, boolean>>({ inventory: false, sales: false, reports: false, administration: false });
  currentUser = signal<User | null>(null);
  private activeRoute = signal<string>('');

  constructor(
    private themeService: ThemeService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeNavigation();
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser.set(user);
    });
  }

  private initializeNavigation(): void {
    const items: NavItem[] = [
      { label: 'Dashboard', icon: 'bi-speedometer2', route: '/dashboard', badge: 0 },
    ];

    const groups: NavGroup[] = [
      {
        label: 'Sales',
        icon: 'bi-cart3',
        key: 'sales',
        items: [
          { label: 'Cash Sales', icon: 'bi-cash-stack', route: '/sales', queryParams: { type: 'cash' } },
          { label: 'Credit Sales', icon: 'bi-receipt', route: '/sales', queryParams: { type: 'credit' } },
        ],
      },
      {
        label: 'Reports',
        icon: 'bi-bar-chart-fill',
        key: 'reports',
        items: [
          { label: 'Analytics', icon: 'bi-graph-up-arrow', route: '/analytics' },
          { label: 'Reports', icon: 'bi-file-earmark-bar-graph-fill', route: '/reports' },
        ],
      },
      {
        label: 'Inventory',
        icon: 'bi-box-seam',
        key: 'inventory',
        items: [
          { label: 'Inventory', icon: 'bi-box-seam', route: '/inventory' },
          { label: 'Restocks', icon: 'bi-arrow-repeat', route: '/restocks' },
          { label: 'Categories', icon: 'bi-tags-fill', route: '/categories' },
        ],
      },
      {
        label: 'Administration',
        icon: 'bi-shield-lock-fill',
        key: 'administration',
        items: [
          { label: 'Organizations', icon: 'bi-building', route: '/organizations' },
          { label: 'Branches', icon: 'bi-geo-alt-fill', route: '/branches' },
          { label: 'Users', icon: 'bi-people-fill', route: '/users' },
          { label: 'Settings', icon: 'bi-gear-fill', route: '/settings' },
        ],
      },
    ];

    this.navigationItems.set(items);
    this.navigationGroups.set(groups);
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  isNavItemActive(item: NavItem): boolean {
    if (!this.isActive(item.route)) {
      return false;
    }

    if (!item.queryParams) {
      return true;
    }

    return Object.entries(item.queryParams).every(([key, value]) =>
      this.router.url.includes(`${key}=${value}`),
    );
  }

  isGroupOpen(key: string): boolean {
    return this.openGroups()[key] ?? false;
  }

  toggleGroup(key: string): void {
    this.openGroups.update((groups) => {
      const nextState = !groups[key];

      return Object.keys(groups).reduce<Record<string, boolean>>((accumulator, groupKey) => {
        accumulator[groupKey] = groupKey === key ? nextState : false;
        return accumulator;
      }, {});
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  navigateToSales(type: 'cash' | 'credit'): void {
    this.router.navigate(['/sales'], { queryParams: { type } });
  }
}
