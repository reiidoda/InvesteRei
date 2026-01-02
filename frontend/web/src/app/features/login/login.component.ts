import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_BASE, TokenResponse } from '../../core/api';
import { AuthStore } from '../../core/auth.store';

@Component({
  standalone: true,
  imports: [FormsModule],
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

      <div style="height: 10px;"></div>
      <div class="small">{{msg()}}</div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  msg = signal('');

  constructor(private http: HttpClient, private auth: AuthStore, private router: Router) {}

  register() {
    this.msg.set('Registering...');
    this.http.post<TokenResponse>(`${API_BASE}/api/v1/auth/register`, {
      email: this.email, password: this.password
    }).subscribe({
      next: (r) => { this.auth.setToken(r.token); this.msg.set('Registered.'); this.router.navigateByUrl('/'); },
      error: (e) => this.msg.set(e?.error?.message || 'Register failed')
    });
  }

  login() {
    this.msg.set('Logging in...');
    this.http.post<TokenResponse>(`${API_BASE}/api/v1/auth/login`, {
      email: this.email, password: this.password
    }).subscribe({
      next: (r) => { this.auth.setToken(r.token); this.msg.set('Logged in.'); this.router.navigateByUrl('/'); },
      error: (e) => this.msg.set(e?.error?.message || 'Login failed')
    });
  }
}
