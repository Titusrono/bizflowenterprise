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
    <div class="h-screen overflow-hidden bg-white dark:bg-[#09111f]">
      <app-sidebar></app-sidebar>
      <div class="md:ml-64 h-full flex flex-col pt-16 md:pt-20">
        <app-header></app-header>
        <main class="flex-1 overflow-y-auto px-4 py-4 sm:px-5 lg:px-6 xl:px-8 lg:py-5 dark:bg-[#09111f]">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
})
export class AuthenticatedShellComponent {}
