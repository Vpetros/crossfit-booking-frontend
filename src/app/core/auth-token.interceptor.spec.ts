import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { HttpInterceptorFn } from '@angular/common/http';

import { authTokenInterceptor } from './auth-token.interceptor';
import { TokenStorage } from '../auth/token.storage';

describe('authTokenInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => authTokenInterceptor(req, next));

  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authTokenInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);

    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('interceptor function should be defined', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should NOT add Authorization header when token is missing', () => {
    http.get('/api/ping').subscribe();

    const req = httpMock.expectOne('/api/ping');
    expect(req.request.headers.has('Authorization')).toBeFalse();

    req.flush({ ok: true });
  });

  it('should add Authorization: Bearer <token> when token exists', () => {
    TokenStorage.setToken('test-token');

    http.get('/api/ping').subscribe();

    const req = httpMock.expectOne('/api/ping');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');

    req.flush({ ok: true });
  });
});
