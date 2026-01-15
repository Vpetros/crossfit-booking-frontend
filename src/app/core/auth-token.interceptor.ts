import { HttpInterceptorFn } from '@angular/common/http';
import { TokenStorage } from '../auth/token.storage';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = TokenStorage.getToken();
  if (!token) return next(req);

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  );
};