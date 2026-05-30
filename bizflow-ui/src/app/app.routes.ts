import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/component/login.component';
import { RegisterComponent } from './features/auth/register/component/register.component';
import { DashboardComponent } from './features/dashboard/pages/dashboard.component';
import { AuthenticatedShellComponent } from './layout/components/authenticated-shell.component';
import { ModulePageComponent } from './features/shared/pages/module-page.component';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'register',
        component: RegisterComponent,
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    component: AuthenticatedShellComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'users',
        component: ModulePageComponent,
        data: {
          category: 'Administration',
          title: 'Users',
          shortLabel: 'User',
          description: 'Manage user accounts, roles, and access for your organization.',
        },
      },
      {
        path: 'organizations',
        component: ModulePageComponent,
        data: {
          category: 'Company',
          title: 'Organizations',
          shortLabel: 'Organization',
          description: 'Track branches, owners, and enterprise-level organization records.',
        },
      },
      {
        path: 'branches',
        component: ModulePageComponent,
        data: {
          category: 'Operations',
          title: 'Branches',
          shortLabel: 'Branch',
          description: 'Monitor branch-level activity, locations, and operational performance.',
        },
      },
      {
        path: 'analytics',
        component: ModulePageComponent,
        data: {
          category: 'Insights',
          title: 'Analytics',
          shortLabel: 'Insight',
          description: 'Review trends, performance metrics, and growth signals across the business.',
        },
      },
      {
        path: 'reports',
        component: ModulePageComponent,
        data: {
          category: 'Reporting',
          title: 'Reports',
          shortLabel: 'Report',
          description: 'Generate and review operational, financial, and compliance reports.',
        },
      },
      {
        path: 'settings',
        component: ModulePageComponent,
        data: {
          category: 'Preferences',
          title: 'Settings',
          shortLabel: 'Setting',
          description: 'Update profile, security, and application preferences from one place.',
        },
      },
      {
        path: 'profile',
        component: ModulePageComponent,
        data: {
          category: 'Account',
          title: 'Profile',
          shortLabel: 'Profile',
          description: 'Review and update the active account profile.',
        },
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/auth/login',
  },
];
