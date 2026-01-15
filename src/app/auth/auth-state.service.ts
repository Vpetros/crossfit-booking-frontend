import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TokenStorage } from './token.storage';

export type AuthState = {
  isLoggedIn: boolean;
  username: string | null;
  roles: string[];
};

function readAuthState(): AuthState {
  const token = TokenStorage.getToken();
  return {
    isLoggedIn: !!token,
    username: TokenStorage.getUsername(),
    roles: TokenStorage.getRoles(),
  };
}

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly subject = new BehaviorSubject<AuthState>(readAuthState());
  readonly state$ = this.subject.asObservable();

  /** after login/logout to update the UI */
  refresh(): void {
    this.subject.next(readAuthState());
  }

  /** Convenience getters */
  get snapshot(): AuthState {
    return this.subject.value;
  }
}