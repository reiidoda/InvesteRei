import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '../../core/api';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <h2 style="margin-top:0;">Trade Surveillance</h2>
      <p class="small">Monitor alerts triggered by execution patterns.</p>

      <div class="row">
        <div style="flex:1;">
          <label>Limit</label>
          <input [(ngModel)]="limit" type="number" />
        </div>
        <div style="flex:1; align-self:flex-end;">
          <button class="secondary" (click)="load()">Refresh</button>
        </div>
      </div>
      <div style="height:6px;"></div>
      <div class="small">{{msg()}}</div>

      <div *ngIf="alerts().length" style="margin-top:10px;">
        <div class="row" style="font-weight:600;">
          <div style="flex:1;">Type</div>
          <div style="flex:1;">Severity</div>
          <div style="flex:1;">Symbol</div>
          <div style="flex:1;">Notional</div>
          <div style="flex:2;">Detail</div>
        </div>
        <div *ngFor="let a of alerts()" class="row" style="border-bottom:1px solid #eee; padding:6px 0;">
          <div style="flex:1;">{{a.alertType}}</div>
          <div style="flex:1;">{{a.severity}}</div>
          <div style="flex:1;">{{a.symbol || '-'}}</div>
          <div style="flex:1;">{{a.notional || '-'}}</div>
          <div style="flex:2;" class="small">{{a.detail}}</div>
        </div>
      </div>
    </div>
  `
})
export class SurveillanceComponent {
  alerts = signal<any[]>([]);
  msg = signal('');
  limit = 50;

  constructor(private http: HttpClient) {
    this.load();
  }

  load() {
    const params: any = { limit: this.limit };
    this.http.get<any[]>(`${API_BASE}/api/v1/surveillance/alerts`, { params }).subscribe({
      next: (r) => { this.alerts.set(r || []); this.msg.set(''); },
      error: (e) => this.msg.set(e?.error?.message || 'Load failed')
    });
  }
}
