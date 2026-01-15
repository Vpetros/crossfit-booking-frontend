import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenStorage } from '../auth/token.storage';

export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = TokenStorage.getToken();

  //if user is authenticated, do not show login/register pages
  if (token) {
    router.navigateByUrl('/dashboard');
    return false;
  }

  return true;
};