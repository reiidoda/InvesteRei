import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private _token = signal<string | null>(localStorage.getItem('token'));

  token() { return this._token(); }

  setToken(t: string) {
    this._token.set(t);
    localStorage.setItem('token', t);
  }

  clear() {
    this._token.set(null);
    localStorage.removeItem('token');
  }
}
