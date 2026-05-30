import { Injectable, effect } from '@angular/core';
import { signal, Signal } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly storageKey = environment.theme.storageKey;
  private readonly defaultTheme = environment.theme.defaultTheme as 'light' | 'dark';

  // Signal to track theme changes
  theme = signal<'light' | 'dark'>(this.loadThemeFromStorage());

  constructor() {
    // Effect to update DOM and localStorage when theme changes
    effect(() => {
      const currentTheme = this.theme();
      this.applyTheme(currentTheme);
      localStorage.setItem(this.storageKey, currentTheme);
    });

    // Initialize theme on service creation
    this.initializeTheme();
  }

  /**
   * Initialize theme from localStorage or system preference
   */
  private initializeTheme(): void {
    const savedTheme = this.loadThemeFromStorage();
    this.theme.set(savedTheme);
  }

  /**
   * Load theme from localStorage
   */
  private loadThemeFromStorage(): 'light' | 'dark' {
    const saved = localStorage.getItem(this.storageKey);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return this.defaultTheme;
  }

  /**
   * Apply theme to the document
   */
  private applyTheme(theme: 'light' | 'dark'): void {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    const currentTheme = this.theme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.theme.set(newTheme);
  }

  /**
   * Set a specific theme
   */
  setTheme(theme: 'light' | 'dark'): void {
    this.theme.set(theme);
  }

  /**
   * Get current theme
   */
  getTheme(): Signal<'light' | 'dark'> {
    return this.theme;
  }

  /**
   * Check if current theme is dark
   */
  isDarkMode(): boolean {
    return this.theme() === 'dark';
  }
}
