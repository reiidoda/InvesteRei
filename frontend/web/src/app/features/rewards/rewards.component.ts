import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '../../core/api';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <h2 style="margin-top:0;">Rewards & Bonuses</h2>
      <p class="small">New-money bonuses tied to funding and investing activity.</p>

      <div class="row">
        <button class="secondary" (click)="loadOffers()">Refresh Offers</button>
        <button class="secondary" (click)="loadEnrollments()">Refresh Enrollments</button>
        <button class="secondary" (click)="evaluate()">Evaluate</button>
      </div>
      <div style="height:6px;"></div>
      <div class="small">{{msg()}}</div>

      <div *ngIf="offers().length" style="margin-top:10px;">
        <h3>Offers</h3>
        <div *ngFor="let o of offers()" class="row" style="border-bottom:1px solid #eee; padding:6px 0;">
          <div style="flex:3;">
            <div><strong>{{o.name}}</strong></div>
            <div class="small">{{o.description}}</div>
          </div>
          <div style="flex:1;">Min: {{o.minDeposit}}</div>
          <div style="flex:1;">Bonus: {{o.bonusAmount}}</div>
          <div style="flex:1; text-align:right;">
            <button (click)="enroll(o.id)">Enroll</button>
          </div>
        </div>
      </div>

      <div *ngIf="enrollments().length" style="margin-top:14px;">
        <h3>Enrollments</h3>
        <div *ngFor="let e of enrollments()" class="row" style="border-bottom:1px solid #eee; padding:6px 0;">
          <div style="flex:2;">{{e.offerId}}</div>
          <div style="flex:1;">{{e.status}}</div>
          <div style="flex:2;" class="small">{{e.createdAt}}</div>
        </div>
      </div>
    </div>
  `
})
export class RewardsComponent {
  offers = signal<any[]>([]);
  enrollments = signal<any[]>([]);
  msg = signal('');

  constructor(private http: HttpClient) {
    this.loadOffers();
    this.loadEnrollments();
  }

  loadOffers() {
    this.http.get<any[]>(`${API_BASE}/api/v1/rewards/offers`).subscribe({
      next: (r) => { this.offers.set(r || []); this.msg.set(''); },
      error: (e) => this.msg.set(e?.error?.message || 'Load offers failed')
    });
  }

  loadEnrollments() {
    this.http.get<any[]>(`${API_BASE}/api/v1/rewards/enrollments`).subscribe({
      next: (r) => { this.enrollments.set(r || []); this.msg.set(''); },
      error: (e) => this.msg.set(e?.error?.message || 'Load enrollments failed')
    });
  }

  enroll(offerId: string) {
    this.msg.set('Enrolling...');
    this.http.post<any>(`${API_BASE}/api/v1/rewards/enroll`, { offerId }).subscribe({
      next: () => { this.msg.set('Enrolled.'); this.loadEnrollments(); },
      error: (e) => this.msg.set(e?.error?.message || 'Enroll failed')
    });
  }

  evaluate() {
    this.msg.set('Evaluating...');
    this.http.post<any[]>(`${API_BASE}/api/v1/rewards/evaluate`, {}).subscribe({
      next: (r) => { this.enrollments.set(r || []); this.msg.set(''); },
      error: (e) => this.msg.set(e?.error?.message || 'Evaluate failed')
    });
  }
}
