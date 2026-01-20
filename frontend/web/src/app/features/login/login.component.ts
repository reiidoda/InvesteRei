import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_BASE, MfaStatusResponse, TokenResponse } from '../../core/api';
import { AuthStore } from '../../core/auth.store';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <h2 style="margin-top:0;">Login</h2>
      <p class="small">Create an account or login. Token is stored locally.</p>

      <div class="row">
        <div style="flex:1;">
          <label>Email</label>
          <input [(ngModel)]="email" placeholder="you@example.com" />
        </div>
        <div style="flex:1;">
          <label>Password</label>
          <input [(ngModel)]="password" type="password" placeholder="min 8 chars" />
        </div>
      </div>

      <div style="height: 12px;"></div>

      <div class="row">
        <button (click)="register()">Register</button>
        <button class="secondary" (click)="login()">Login</button>
      </div>

      <div *ngIf="mfaRequired()" style="margin-top: 16px;">
        <label>MFA Code</label>
        <input [(ngModel)]="mfaCode" placeholder="123456" />
        <div class="small" *ngIf="mfaTokenExpiresAt()">
          MFA token expires at {{mfaTokenExpiresAt()}}
        </div>
        <div style="height: 8px;"></div>
        <button class="secondary" (click)="verifyMfa()">Verify MFA</button>
      </div>

      <div style="height: 10px;"></div>
      <div class="small">{{msg()}}</div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  mfaCode = '';
  msg = signal('');
  mfaRequired = signal(false);
  mfaToken = signal('');
  mfaTokenExpiresAt = signal('');

  constructor(private http: HttpClient, private auth: AuthStore, private router: Router) {}

  register() {
    this.msg.set('Registering...');
    this.http.post<TokenResponse>(`${API_BASE}/api/v1/auth/register`, {
      email: this.email, password: this.password
    }).subscribe({
      next: (r) => {
        if (r.token) {
          this.auth.setToken(r.token);
          this.msg.set('Registered.');
          this.router.navigateByUrl('/');
          return;
        }
        this.msg.set('Registered, but no token returned.');
      },
      error: (e) => this.msg.set(e?.error?.message || 'Register failed')
    });
  }

  login() {
    this.mfaRequired.set(false);
    this.mfaToken.set('');
    this.mfaTokenExpiresAt.set('');
    this.mfaCode = '';
    this.msg.set('Logging in...');
    this.http.post<TokenResponse>(`${API_BASE}/api/v1/auth/login`, {
      email: this.email, password: this.password
    }).subscribe({
      next: (r) => {
        if (r.mfaRequired) {
          this.mfaRequired.set(true);
          this.mfaToken.set(r.mfaToken || '');
          this.mfaTokenExpiresAt.set(r.mfaTokenExpiresAt || '');
          this.msg.set('MFA required. Enter your code.');
          return;
        }
        if (r.token) {
          this.auth.setToken(r.token);
          this.msg.set('Logged in.');
          this.router.navigateByUrl('/');
          return;
        }
        this.msg.set('Login failed (no token).');
      },
      error: (e) => this.msg.set(e?.error?.message || 'Login failed')
    });
  }

  verifyMfa() {
    if (!this.mfaCode.trim()) {
      this.msg.set('Enter MFA code.');
      return;
    }
    if (!this.mfaToken()) {
      this.msg.set('Missing MFA token. Retry login.');
      return;
    }
    this.msg.set('Verifying MFA...');
    this.http.post<MfaStatusResponse>(`${API_BASE}/api/v1/auth/mfa/verify`, {
      code: this.mfaCode.trim(),
      mfaToken: this.mfaToken()
    }).subscribe({
      next: (r) => {
        if (r.token) {
          this.auth.setToken(r.token);
          this.msg.set('MFA verified.');
          this.router.navigateByUrl('/');
          return;
        }
        this.msg.set('MFA verification failed.');
      },
      error: (e) => this.msg.set(e?.error?.message || 'MFA verification failed')
    });
  }
}
