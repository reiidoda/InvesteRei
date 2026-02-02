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
      <h2 style="margin-top:0;">Best Execution</h2>
      <p class="small">Track slippage versus market quotes at execution time.</p>

      <div class="row">
        <div style="flex:1;">
          <label>Symbol (optional)</label>
          <input [(ngModel)]="symbol" placeholder="AAPL" />
        </div>
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

      <div *ngIf="records().length" style="margin-top:10px;">
        <div class="row" style="font-weight:600;">
          <div style="flex:1;">Symbol</div>
          <div style="flex:1;">Side</div>
          <div style="flex:1;">Executed</div>
          <div style="flex:1;">Market</div>
          <div style="flex:1;">Slippage (bps)</div>
          <div style="flex:2;">Time</div>
        </div>
        <div *ngFor="let r of records()" class="row" style="border-bottom:1px solid #eee; padding:6px 0;">
          <div style="flex:1;">{{r.symbol}}</div>
          <div style="flex:1;">{{r.side}}</div>
          <div style="flex:1;">{{r.executedPrice || '-'}}</div>
          <div style="flex:1;">{{r.marketPrice || '-'}}</div>
          <div style="flex:1;">{{r.slippageBps || '-'}}</div>
          <div style="flex:2;" class="small">{{r.createdAt}}</div>
        </div>
      </div>
    </div>
  `
})
export class BestExecutionComponent {
  records = signal<any[]>([]);
  msg = signal('');
  symbol = '';
  limit = 50;

  constructor(private http: HttpClient) {
    this.load();
  }

  load() {
    const params: any = { limit: this.limit };
    if (this.symbol) params.symbol = this.symbol;
    this.http.get<any[]>(`${API_BASE}/api/v1/best-execution`, { params }).subscribe({
      next: (r) => { this.records.set(r || []); this.msg.set(''); },
      error: (e) => this.msg.set(e?.error?.message || 'Load failed')
    });
  }
}
