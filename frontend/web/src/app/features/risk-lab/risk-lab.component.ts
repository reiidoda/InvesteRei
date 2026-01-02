import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '../../core/api';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="card">
      <h2 style="margin-top:0;">Risk Lab</h2>
      <p class="small">
        Paste returns (JSON array). Computes Sharpe, Max Drawdown, VaR and CVaR (educational).
        Requires login.
      </p>

      <label>returns (JSON array)</label>
      <textarea [(ngModel)]="returnsText" rows="4" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;"></textarea>

      <div style="height:12px;"></div>
      <button (click)="run()">Compute</button>
      <div style="height:10px;"></div>
      <div class="small">{{msg()}}</div>

      <div *ngIf="result()" style="margin-top: 14px;">
        <pre>{{ result() | json }}</pre>
      </div>
    </div>
  `
})
export class RiskLabComponent {
  returnsText = '[0.01,-0.02,0.005,0.012,-0.003,0.004,0.002,-0.006,0.009,0.003,0.002,0.001,-0.004,0.006,0.004,0.003,-0.002,0.001,0.002,0.003,0.004,0.002,-0.003,0.005,0.006,0.001,-0.001,0.002,0.003,0.004,0.002,0.001]';
  msg = signal('');
  result = signal<any | null>(null);

  constructor(private http: HttpClient) {}

  run() {
    this.msg.set('Computing...');
    this.result.set(null);

    let arr: number[];
    try { arr = JSON.parse(this.returnsText); } catch { this.msg.set('Invalid JSON'); return; }

    this.http.post<any>(`${API_BASE}/api/v1/risk/metrics/advanced`, { returns: arr, confidence: 0.95, riskFree: 0.0, downsideThreshold: 0.0 })
      .subscribe({
        next: (r) => { this.result.set(r); this.msg.set('Done.'); },
        error: (e) => this.msg.set(e?.error?.message || 'Request failed (are you logged in?)')
      });
  }
}
