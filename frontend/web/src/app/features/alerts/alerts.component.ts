import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '../../core/api';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="card">
      <h2 style="margin-top:0;">Alerts</h2>
      <p class="small">Automated alerts with AI context and workflow-ready triggers.</p>

      <div class="row">
        <div style="flex:1;">
          <label>Type</label>
          <select [(ngModel)]="alertType" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="PRICE">Price</option>
            <option value="VOLATILITY">Volatility</option>
            <option value="DRAWDOWN">Drawdown</option>
            <option value="VOLUME">Volume</option>
            <option value="CUSTOM">Custom</option>
          </select>
        </div>
        <div style="flex:1;">
          <label>Symbol</label>
          <input [(ngModel)]="symbol" placeholder="AAPL" />
        </div>
        <div style="flex:1;">
          <label>Comparison</label>
          <select [(ngModel)]="comparison" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="ABOVE">Above</option>
            <option value="BELOW">Below</option>
            <option value="CROSS">Cross</option>
          </select>
        </div>
        <div style="flex:1;">
          <label>Target</label>
          <input [(ngModel)]="targetValue" type="number" />
        </div>
        <div style="flex:1;">
          <label>Frequency</label>
          <select [(ngModel)]="frequency" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="REALTIME">Realtime</option>
            <option value="HOURLY">Hourly</option>
            <option value="DAILY">Daily</option>
          </select>
        </div>
        <div style="flex:1; align-self:flex-end;">
          <button (click)="create()">Create Alert</button>
        </div>
      </div>

      <div style="height:8px;"></div>
      <div class="small">{{msg()}}</div>

      <div style="height:12px;"></div>
      <div class="row">
        <button class="secondary" (click)="load()">Refresh</button>
      </div>

      <div *ngIf="alerts().length" style="margin-top:10px;">
        <div class="row" style="font-weight:600;">
          <div style="flex:1;">Type</div>
          <div style="flex:1;">Symbol</div>
          <div style="flex:1;">Status</div>
          <div style="flex:2;">AI Summary</div>
          <div style="flex:2; text-align:right;">Actions</div>
        </div>
        <div *ngFor="let a of alerts()" class="row" style="border-bottom:1px solid #eee; padding:6px 0;">
          <div style="flex:1;">{{a.alertType}}</div>
          <div style="flex:1;">{{a.symbol}}</div>
          <div style="flex:1;">{{a.status}}</div>
          <div style="flex:2;" class="small">{{a.aiSummary || 'No AI summary'}}</div>
          <div style="flex:2; text-align:right;">
            <button class="secondary" (click)="setStatus(a.id, 'ACTIVE')">Activate</button>
            <button class="secondary" (click)="setStatus(a.id, 'PAUSED')">Pause</button>
            <button class="secondary" (click)="trigger(a.id)">Trigger</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AlertsComponent {
  alertType = 'PRICE';
  symbol = 'AAPL';
  comparison = 'ABOVE';
  targetValue = 180;
  frequency = 'REALTIME';

  msg = signal('');
  alerts = signal<any[]>([]);

  constructor(private http: HttpClient) {
    this.load();
  }

  create() {
    this.msg.set('Creating alert...');
    const body = {
      alertType: this.alertType,
      symbol: this.symbol,
      comparison: this.comparison,
      targetValue: Number(this.targetValue),
      frequency: this.frequency,
    };
    this.http.post(`${API_BASE}/api/v1/alerts`, body).subscribe({
      next: () => { this.msg.set('Created.'); this.load(); },
      error: (e) => this.msg.set(e?.error?.message || 'Create failed')
    });
  }

  load() {
    this.http.get<any[]>(`${API_BASE}/api/v1/alerts`).subscribe({
      next: (r) => this.alerts.set(r || []),
      error: (e) => this.msg.set(e?.error?.message || 'Load failed')
    });
  }

  setStatus(id: string, status: string) {
    this.http.post(`${API_BASE}/api/v1/alerts/${id}/status`, { status }).subscribe({
      next: () => this.load(),
      error: (e) => this.msg.set(e?.error?.message || 'Update failed')
    });
  }

  trigger(id: string) {
    this.http.post(`${API_BASE}/api/v1/alerts/${id}/trigger`, {}).subscribe({
      next: () => this.load(),
      error: (e) => this.msg.set(e?.error?.message || 'Trigger failed')
    });
  }
}
