import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import { AuthState, AuthStateService } from '../auth/auth-state.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.css'],
})
export class AppLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly authState = inject(AuthStateService);
  private readonly router = inject(Router);

  state$: Observable<AuthState> = this.authState.state$;

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/auth/login');
  }

  hasRole(state: AuthState, role: string): boolean {
    return state.roles.includes(role);
  }
}