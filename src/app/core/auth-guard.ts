import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenStorage } from '../auth/token.storage';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = TokenStorage.getToken();

  if (token) return true;

  router.navigateByUrl('/auth/login');
  return false;
};