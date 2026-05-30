import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { User } from '../../core/models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="sticky top-0 z-30 w-full bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 transition-colors duration-300">
      <div class="grid w-full grid-cols-[1fr_auto_1fr] items-center h-16 md:h-20 px-4 sm:px-6 lg:px-8 gap-4">
        <div class="justify-self-start">
          <h2 class="text-lg md:text-2xl font-bold text-neutral-900 dark:text-white truncate">
            {{ pageTitle() }}
          </h2>
        </div>

        <div class="hidden sm:flex justify-self-center w-full max-w-md items-center gap-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg px-3 py-2">
            <i class="bi bi-search text-neutral-400"></i>
            <input
              type="text"
              placeholder="Search..."
              class="bg-transparent border-0 focus:outline-none focus:ring-0 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 w-full"
            />
        </div>

        <div class="justify-self-end flex items-center gap-2 md:gap-4">
          <button
            type="button"
            (click)="toggleTheme()"
            class="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            [title]="isDarkMode() ? 'Switch to light mode' : 'Switch to dark mode'"
            aria-label="Toggle theme"
          >
            <i class="bi text-xl" [ngClass]="isDarkMode() ? 'bi-sun-fill' : 'bi-moon-fill'"></i>
          </button>

          <button class="relative p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors" aria-label="Notifications">
            <i class="bi bi-bell-fill text-lg"></i>
            <span
              *ngIf="notifications() > 0"
              class="absolute top-1 right-1 w-4 h-4 bg-danger-500 text-white text-xs flex-center rounded-full"
            >
              {{ notifications() }}
            </span>
          </button>

          <button class="relative p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors" aria-label="Messages">
            <i class="bi bi-chat-dots-fill text-lg"></i>
            <span
              *ngIf="messages() > 0"
              class="absolute top-1 right-1 w-4 h-4 bg-info-500 text-white text-xs flex-center rounded-full"
            >
              {{ messages() }}
            </span>
          </button>

          <div class="hidden md:block h-6 w-px bg-neutral-200 dark:bg-neutral-700"></div>

          <div class="relative" (click)="toggleUserMenu()">
            <button class="flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              <span class="hidden md:block text-sm font-medium text-neutral-900 dark:text-white">
                {{ currentUser()?.firstName }}
              </span>
              <i class="bi bi-chevron-down text-neutral-400"></i>
            </button>

            <div
              *ngIf="userMenuOpen()"
              class="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden animate-slide-down"
            >
              <div class="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
                <p class="text-sm font-medium text-neutral-900 dark:text-white">
                  {{ currentUser()?.firstName }} {{ currentUser()?.lastName }}
                </p>
                <p class="text-xs text-neutral-500 dark:text-neutral-400">{{ currentUser()?.email }}</p>
              </div>

              <nav class="flex flex-col">
                <button
                  (click)="navigateTo('/profile')"
                  class="px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors text-left"
                >
                  <i class="bi bi-person-fill me-2"></i>Profile
                </button>
                <button
                  (click)="navigateTo('/settings')"
                  class="px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors text-left"
                >
                  <i class="bi bi-gear-fill me-2"></i>Settings
                </button>
                <button
                  (click)="logout()"
                  class="px-4 py-2 text-sm text-danger-600 dark:text-danger-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors text-left border-t border-neutral-200 dark:border-neutral-700"
                >
                  <i class="bi bi-box-arrow-right me-2"></i>Logout
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [],
})
export class HeaderComponent implements OnInit {
  pageTitle = signal('Dashboard');
  notifications = signal(3);
  messages = signal(2);
  userMenuOpen = signal(false);
  currentUser = signal<User | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser.set(user);
    });
    this.updatePageTitle();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updatePageTitle();
      }
    });
  }

  private updatePageTitle(): void {
    const routeParts = this.router.url.split('?')[0].split('/').filter((p) => p);
    const active = routeParts[0] || 'dashboard';
    const titleMap: Record<string, string> = {
      dashboard: 'Dashboard',
      users: 'Users',
      organizations: 'Organizations',
      branches: 'Branches',
      analytics: 'Analytics',
      reports: 'Reports',
      settings: 'Settings',
      profile: 'Profile',
    };

    this.pageTitle.set(titleMap[active] || active.charAt(0).toUpperCase() + active.slice(1));
  }

  toggleUserMenu(): void {
    this.userMenuOpen.update((v) => !v);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.userMenuOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
    this.userMenuOpen.set(false);
  }
}
