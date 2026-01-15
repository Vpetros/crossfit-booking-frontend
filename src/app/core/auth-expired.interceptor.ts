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
          console.warn('[authExpiredInterceptor] auth failed', {
            status,
            url: req.url,
          });

          auth.logout();

          if (router.url !== '/auth/login') {
            router.navigateByUrl('/auth/login', { replaceUrl: true });
          }
        }
      }

      return throwError(() => err);
    }),
  );
}