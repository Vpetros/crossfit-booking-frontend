import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { TokenStorage } from '../../auth/token.storage';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);

  const roles = TokenStorage.getRoles();
  const isAdmin = roles.includes('ROLE_ADMIN');

  if (!isAdmin) {
    router.navigateByUrl('/dashboard');
    return false;
  }

  return true;
};