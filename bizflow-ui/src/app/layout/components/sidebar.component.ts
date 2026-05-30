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
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside
      class="fixed left-0 top-0 h-full w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 transition-transform duration-300 z-40 overflow-y-auto scrollbar-thin -translate-x-full md:translate-x-0"
      [class.translate-x-0]="sidebarOpen()"
      [class.-translate-x-full]="!sidebarOpen()"
    >
      <!-- Logo Section -->
      <div class="p-6 border-b border-neutral-200 dark:border-neutral-800">
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex-center text-white font-bold text-lg">
            B
          </div>
          <div>
            <h1 class="text-lg font-bold text-neutral-900 dark:text-white">BizFlow</h1>
            <p class="text-xs text-neutral-500 dark:text-neutral-400">Enterprise</p>
          </div>
        </div>
      </div>

      <!-- Navigation Items -->
      <nav class="flex flex-col gap-2 p-4">
        <div *ngFor="let item of navigationItems()" class="mb-2">
          <a
            [routerLink]="item.route"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: false }"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-neutral-800 transition-all duration-200 relative group"
            [ngClass]="{
              'bg-primary-100': isActive(item.route),
              'dark:bg-neutral-800': isActive(item.route),
              'text-primary-600': isActive(item.route),
              'dark:text-primary-400': isActive(item.route)
            }"
          >
            <i class="bi" [ngClass]="item.icon + ' text-lg'"></i>
            <span class="font-medium flex-1">{{ item.label }}</span>
            <span
              *ngIf="item.badge && item.badge > 0"
              class="badge badge-primary ml-2"
            >
              {{ item.badge }}
            </span>
          </a>
        </div>
      </nav>

      <!-- Divider -->
      <div class="divider my-4"></div>

      <!-- Organization Section -->
      <div class="px-4 py-3">
        <p class="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
          Organization
        </p>
        <div class="space-y-2">
          <button
            (click)="navigateTo('/organizations')"
            class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <i class="bi bi-building text-lg"></i>
            <span>Organizations</span>
          </button>
          <button
            (click)="navigateTo('/branches')"
            class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <i class="bi bi-geo-alt-fill text-lg"></i>
            <span>Branches</span>
          </button>
          <button
            (click)="navigateTo('/users')"
            class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <i class="bi bi-people-fill text-lg"></i>
            <span>Users</span>
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 flex-1">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500"></div>
            <div class="text-sm">
              <p class="font-medium text-neutral-900 dark:text-white">{{ currentUser()?.firstName }}</p>
              <p class="text-xs text-neutral-500 dark:text-neutral-400">{{ currentUser()?.role }}</p>
            </div>
          </div>
          <button
            (click)="toggleTheme()"
            class="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
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
      { label: 'Analytics', icon: 'bi-graph-up-arrow', route: '/analytics' },
      { label: 'Reports', icon: 'bi-file-earmark-bar-graph-fill', route: '/reports' },
      { label: 'Settings', icon: 'bi-gear-fill', route: '/settings' },
    ];
    this.navigationItems.set(items);
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

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
