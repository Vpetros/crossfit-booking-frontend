export class TokenStorage {
  private static readonly TOKEN_KEY = 'access_token';
  private static readonly ROLES_KEY = 'roles';
  private static readonly USERNAME_KEY = 'username';


  static setToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setRoles(roles: string[]) {
    localStorage.setItem(this.ROLES_KEY, JSON.stringify(roles));
  }

  static getRoles(): string[] {
  const raw = localStorage.getItem(this.ROLES_KEY);
  return raw ? JSON.parse(raw) : [];
  }

  static setUsername(username: string) {
    localStorage.setItem(this.USERNAME_KEY, username);
  }

  static getUsername(): string | null {
    return localStorage.getItem(this.USERNAME_KEY);
  }


  static clear() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ROLES_KEY);
    localStorage.removeItem(this.USERNAME_KEY);
  }
}