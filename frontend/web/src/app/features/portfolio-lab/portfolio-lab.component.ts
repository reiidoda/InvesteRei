import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_BASE, OptimizeRequest, OptimizeResponse } from '../../core/api';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="card">
      <h2 style="margin-top:0;">Portfolio Lab</h2>
      <p class="small">
        Enter expected returns (mu) and covariance matrix (cov). This returns an optimization proposal output, not advice.
        Requires login (Bearer token).
      </p>

      <div class="row">
        <div style="flex:1;">
          <label>mu (JSON array)</label>
          <textarea [(ngModel)]="muText" rows="3" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;"></textarea>
        </div>
        <div style="flex:1;">
          <label>cov (JSON matrix)</label>
          <textarea [(ngModel)]="covText" rows="3" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;"></textarea>
        </div>
      </div>

      <div style="height: 12px;"></div>

      <div class="row">
        <div style="flex:1;">
          <label>riskAversion</label>
          <input [(ngModel)]="riskAversion" type="number" />
        </div>
        <div style="flex:1;">
          <label>method</label>
      <select [(ngModel)]="method" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
        <option value="MEAN_VARIANCE_PGD">Mean-Variance (PGD)</option>
        <option value="MIN_VARIANCE">Min Variance</option>
        <option value="RISK_PARITY">Risk Parity</option>
        <option value="KELLY_APPROX">Kelly (Approx)</option>
        <option value="BLACK_LITTERMAN_MEANVAR">Black–Litterman + Mean-Var</option>
        <option value="RANDOM_MVP">Random MVP</option>
      </select>

      <div style="height:12px;"></div>

      <label>maxWeight</label>
          <input [(ngModel)]="maxWeight" type="number" step="0.05" />
        </div>
        <div style="flex:1;">
          <label>minWeight</label>
          <input [(ngModel)]="minWeight" type="number" step="0.05" />
        </div>
      </div>

      <div style="height: 12px;"></div>
      <button (click)="run()">Run Optimizer</button>
      <div style="height: 10px;"></div>
      <div class="small">{{msg()}}</div>

      <div *ngIf="result()" style="margin-top: 14px;">
        <pre>{{ result() | json }}</pre>
      </div>
    </div>
  `
})
export class PortfolioLabComponent {
  muText = '[0.10, 0.07, 0.04]';
  method = 'MEAN_VARIANCE_PGD';

  covText = '[[0.20,0.05,0.02],[0.05,0.12,0.01],[0.02,0.01,0.06]]';

  riskAversion = 6;
  maxWeight = 0.6;
  minWeight = 0.0;

  msg = signal('');
  result = signal<OptimizeResponse | null>(null);

  constructor(private http: HttpClient) {}

  run() {
    this.msg.set('Running...');
    this.result.set(null);

    let mu: number[];
    let cov: number[][];
    try {
      mu = JSON.parse(this.muText);
      cov = JSON.parse(this.covText);
    } catch {
      this.msg.set('Invalid JSON in mu/cov');
      return;
    }

    const body: OptimizeRequest = {
      mu, cov,
      method: this.method,
      riskAversion: Number(this.riskAversion),
      maxWeight: Number(this.maxWeight),
      minWeight: Number(this.minWeight),
    };

    this.http.post<OptimizeResponse>(`${API_BASE}/api/v1/portfolio/optimize`, body).subscribe({
      next: (r) => { this.result.set(r); this.msg.set('Done.'); },
      error: (e) => this.msg.set(e?.error?.message || 'Request failed (are you logged in?)')
    });
  }
}
