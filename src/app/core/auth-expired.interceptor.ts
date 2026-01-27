import { inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService } from '../auth/auth.service';

function isAuthEndpoint(url: string): boolean {
  return url.includes('/api/auth/login') || url.includes('/api/auth/register');
}

// In-memory guard against multiple parallel redirects
let redirectInProgress = false;

export function authExpiredInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        const status = err.status;

        if ((status === 401 || status === 403) && !isAuthEndpoint(req.url)) {
          // If already logged out, do not spam redirects
          if (!auth.isLoggedIn) {
            return throwError(() => err);
          }

          console.warn('[authExpiredInterceptor] auth failed', {
            status,
            url: req.url,
          });

          auth.logout();

          // Avoid multiple navigations when many requests fail at once
          if (!redirectInProgress && router.url !== '/auth/login') {
            redirectInProgress = true;

            router.navigateByUrl('/auth/login', { replaceUrl: true }).finally(() => {
              redirectInProgress = false;
            });
          }
        }
      }

      return throwError(() => err);
    }),
  );
}