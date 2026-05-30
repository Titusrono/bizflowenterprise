import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header.component';
import { SidebarComponent } from './sidebar.component';

@Component({
  selector: 'app-authenticated-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent],
  template: `
    <div class="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <app-sidebar></app-sidebar>
      <div class="md:ml-64 min-h-screen flex flex-col">
        <app-header></app-header>
        <main class="flex-1 px-4 py-4 sm:px-5 lg:px-6 xl:px-8 lg:py-5">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
})
export class AuthenticatedShellComponent {}
