import { Component, OnInit, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  constructor(private themeService: ThemeService) {
    // Initialize theme from storage
    effect(() => {
      // This effect will run when theme changes
      const theme = this.themeService.getTheme()();
    });
  }

  ngOnInit(): void {
    // Theme is already initialized in ThemeService constructor
  }
}

