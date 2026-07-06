import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { authGuard, guestGuard } from './guards/auth.guard';
import { AccountDetailsComponent } from './components/account-details/account-details.component';
import { LayoutComponent } from './components/layout/layout.component';
import { AnalyticsComponent } from './components/analytics/analytics.component';

export const routes: Routes = [
  {
    path: 'auth',
    component: AuthComponent,
    children: [
      { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
      { path: 'register', component: RegisterComponent },
    ],
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: {
          header: {
            title: 'Welcome back,',
            subtitle: 'Dashboard',
            useProfileNameAsSubtitle: true,
          },
        },
      },
      {
        path: 'analytics',
        component: AnalyticsComponent,
        data: {
          header: {
            title: 'Analytics',
            subtitle: 'View your analytics and insights',
          },
        },
      },
      {
        path: 'account/:id',
        component: AccountDetailsComponent,
        data: {
          header: {
            title: 'Account Details',
            subtitle: 'View your activity and balance',
          },
        },
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];
