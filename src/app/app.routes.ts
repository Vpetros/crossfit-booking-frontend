import { Routes } from '@angular/router';
import { WeekComponent } from './week/week.component';
import { AppLayoutComponent } from './layout/app-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { authGuard } from './core/auth-guard';
import { adminGuard } from './core/auth/admin.guard';
import { AdminComponent } from './admin/admin.component';
import { MembersComponent } from './members/members.component';

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      {
        path: 'auth',
        loadChildren: () =>
          import('./auth/auth.routes').then((m) => m.AUTH_ROUTES),
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [authGuard],
      },
      {
        path: 'week',
        component: WeekComponent,
        canActivate: [authGuard],
      },
      { path: 'admin',
        component: AdminComponent,
        canActivate: [adminGuard],
      },
      { path: 'members',
        component: MembersComponent,
        canActivate: [adminGuard],
      },
      
      { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
      { path: '**', redirectTo: 'auth/login' },
    ],
  },
];
