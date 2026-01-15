import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse, RegisterRequest, MessageResponse } from './auth.models';
import { TokenStorage } from './token.storage';
import { AuthStateService } from './auth-state.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient,
    private authState: AuthStateService
  ) {}

  login(req: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/api/auth/login`, req)
      .pipe(
        tap((res) => {

          
          if (res?.token) TokenStorage.setToken(res.token);
          if (res?.role) TokenStorage.setRoles([res.role]);
          if (res?.username) TokenStorage.setUsername(res.username);

          this.authState.refresh(); // update navbar
        }),
      );
  }

  register(req: RegisterRequest) {
    return this.http.post<MessageResponse>(`${this.baseUrl}/api/auth/register`, req, {
      observe: 'response',
    });
  }

  logout(): void {
    TokenStorage.clear();
    this.authState.refresh(); // update navbar
  }

  get token(): string | null {
    return TokenStorage.getToken();
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }
}