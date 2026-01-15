import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenStorage } from '../auth/token.storage';

export function roleGuard(requiredRole: string): CanActivateFn {
  return () => {
    const router = inject(Router);

    const token = TokenStorage.getToken();
    if (!token) {
      router.navigateByUrl('/auth/login');
      return false;
    }

    const roles = TokenStorage.getRoles();
    const ok = roles.includes(requiredRole);

    if (!ok) {
      router.navigateByUrl('/dashboard');
      return false;
    }

    return true;
  };
}