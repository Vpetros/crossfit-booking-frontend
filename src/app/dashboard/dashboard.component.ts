import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TokenStorage } from '../auth/token.storage';

import { DashboardUserComponent } from './user/dashboard-user.component';
import { DashboardAdminComponent } from './admin/dashboard-admin.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardUserComponent, DashboardAdminComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  username = TokenStorage.getUsername() ?? 'User';
  roles = TokenStorage.getRoles();

  get isAdmin(): boolean {
    return this.roles.includes('ROLE_ADMIN');
  }
}