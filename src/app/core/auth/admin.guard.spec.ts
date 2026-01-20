import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router } from '@angular/router';

import { adminGuard } from './admin.guard';
import { TokenStorage } from '../../auth/token.storage';

describe('adminGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => adminGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Router,
          useValue: { navigateByUrl: jasmine.createSpy('navigateByUrl') },
        },
      ],
    });

    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should allow activation when ROLE_ADMIN exists', () => {
    TokenStorage.setToken('token');
    TokenStorage.setRoles(['ROLE_ADMIN']);

    const result = executeGuard({} as any, {} as any);

    expect(result).toBeTrue();

    const router = TestBed.inject(Router) as any;
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('should redirect to /dashboard and block when logged in but not admin', () => {
    TokenStorage.setToken('token');
    TokenStorage.setRoles(['ROLE_USER']);

    const router = TestBed.inject(Router) as any;

    const result = executeGuard({} as any, {} as any);

    expect(result).toBeFalse();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('should redirect to /dashboard and block when logged out', () => {
    const router = TestBed.inject(Router) as any;

    const result = executeGuard({} as any, {} as any);

    expect(result).toBeFalse();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });
});
