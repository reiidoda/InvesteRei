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
          <div class="small">AI automated investing with approval controls.</div>
        </div>
        <div class="row" style="align-items:center;">
          <a routerLink="/" style="text-decoration:none;">Portfolio Lab</a>
          <a routerLink="/auto-invest" style="text-decoration:none;">Auto-Invest</a>
          <a routerLink="/risk" style="text-decoration:none;">Risk Lab</a>
          <a routerLink="/ai" style="text-decoration:none;">AI Forecast</a>
          <a routerLink="/simulation" style="text-decoration:none;">Simulation</a>
          <a routerLink="/market-data" style="text-decoration:none;">Market Data</a>
          <a routerLink="/manual-trade" style="text-decoration:none;">Manual Trade</a>
          <a routerLink="/watchlists" style="text-decoration:none;">Watchlists</a>
          <a routerLink="/alerts" style="text-decoration:none;">Alerts</a>
          <a routerLink="/statements" style="text-decoration:none;">Statements</a>
          <a routerLink="/research" style="text-decoration:none;">Research</a>
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
