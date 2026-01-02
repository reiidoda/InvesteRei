import { Component, computed, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthStore } from './core/auth.store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <div class="container">
      <div class="row" style="justify-content: space-between; align-items: center;">
        <div>
          <div class="row" style="align-items:center; gap:12px;">
  <img src="assets/investerei-logo.png" width="34" height="34" style="border-radius:10px;" alt="InvesteRei"/>
  <div style="font-weight: 700; font-size: 18px;">InvesteRei</div>
</div>
          <div class="small">Simulation-first math tools — not financial advice.</div>
        </div>
        <div class="row" style="align-items:center;">
          <a routerLink="/" style="text-decoration:none;">Portfolio Lab</a>
          <a routerLink="/auto-invest" style="text-decoration:none;">Auto-Invest</a>
          <a routerLink="/risk" style="text-decoration:none;">Risk Lab</a>
          <a routerLink="/login" style="text-decoration:none;">Login</a>
          <button class="secondary" *ngIf="isAuthed()" (click)="logout()">Logout</button>
        </div>
      </div>

      <div style="height: 18px;"></div>
      <router-outlet></router-outlet>
    </div>
  `
})
export class AppComponent {
  isAuthed = computed(() => this.auth.token() !== null);

  constructor(private auth: AuthStore) {}

  logout() { this.auth.clear(); }
}
