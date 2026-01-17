import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '../../core/api';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="card">
      <h2 style="margin-top:0;">Simulation Lab</h2>
      <p class="small">
        Submit a backtest job (async) and fetch results once complete.
      </p>
      <div class="row" style="align-items:center; margin-bottom:8px;" *ngIf="quota()">
        <div class="small" style="flex:1;">
          <strong>Quota:</strong>
          pending {{quota()?.pending || 0}}/{{quota()?.maxPending || 0}} •
          running {{quota()?.running || 0}}/{{quota()?.maxRunning || 0}} •
          active {{quota()?.active || 0}}/{{quota()?.maxActive || 0}}
        </div>
        <button class="secondary" (click)="loadQuota()">Refresh quota</button>
      </div>
      <div class="small" *ngIf="quotaMsg()">{{quotaMsg()}}</div>

      <div class="row">
        <div style="flex:1;">
          <label>Strategy</label>
          <select [(ngModel)]="strategy" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="BUY_AND_HOLD">Buy & Hold</option>
            <option value="DCA">DCA</option>
          </select>
        </div>
        <div style="flex:1;">
          <label>Initial Cash</label>
          <input [(ngModel)]="initialCash" type="number" />
        </div>
        <div style="flex:1;">
          <label>Contribution</label>
          <input [(ngModel)]="contribution" type="number" />
        </div>
        <div style="flex:1;">
          <label>Contribution Every (periods)</label>
          <input [(ngModel)]="contributionEvery" type="number" />
        </div>
      </div>

      <div style="height: 12px;"></div>
      <label>returns (JSON array)</label>
      <textarea [(ngModel)]="returnsText" rows="4" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;"></textarea>

      <div style="height: 12px;"></div>
      <div class="row">
        <div style="flex:1;">
          <label>Load returns from market data</label>
          <input [(ngModel)]="symbol" placeholder="AAPL" />
        </div>
        <div style="flex:1;">
          <label>Start (YYYY-MM-DD)</label>
          <input [(ngModel)]="start" placeholder="2024-01-01" />
        </div>
        <div style="flex:1;">
          <label>End (YYYY-MM-DD)</label>
          <input [(ngModel)]="end" placeholder="2024-03-31" />
        </div>
        <div style="flex:1; align-self:flex-end;">
          <button class="secondary" (click)="loadReturns()">Load Returns</button>
        </div>
      </div>

      <div style="height: 12px;"></div>
      <div class="row">
        <button (click)="run()">Submit Backtest</button>
        <button class="secondary" (click)="refresh()" [disabled]="!jobId">Refresh Status</button>
      </div>
      <div style="height: 8px;"></div>
      <div class="small">{{msg()}}</div>

      <div *ngIf="job()" style="margin-top: 14px;">
        <div><strong>Job Status:</strong> {{job()?.status}}</div>
        <div class="small" *ngIf="job()?.strategyConfigVersion">Config v{{job()?.strategyConfigVersion}} • Hash {{job()?.returnsHash}}</div>
        <div class="small" *ngIf="job()?.error">Error: {{job()?.error}}</div>
        <div *ngIf="job()?.result">
          <div class="small">Equity points: {{job()?.result?.equityCurve?.length || 0}} • Drawdown points: {{job()?.result?.drawdownCurve?.length || 0}}</div>
          <pre *ngIf="job()?.result?.equityCurve?.length">{{ job()?.result?.equityCurve?.slice(0, 20) | json }}</pre>
          <pre *ngIf="job()?.result?.drawdownCurve?.length">{{ job()?.result?.drawdownCurve?.slice(0, 20) | json }}</pre>
          <pre>{{ job()?.result | json }}</pre>
        </div>
      </div>
    </div>
  `
})
export class SimulationLabComponent implements OnInit {
  returnsText = '[0.01,-0.02,0.005,0.012,-0.003,0.004,0.002,-0.006,0.009,0.003,0.002,0.001,-0.004,0.006,0.004,0.003,-0.002,0.001,0.002,0.003,0.004,0.002,-0.003,0.005,0.006,0.001,-0.001,0.002,0.003,0.004,0.002,0.001]';
  strategy = 'BUY_AND_HOLD';
  initialCash = 10000;
  contribution = 0;
  contributionEvery = 1;

  symbol = 'AAPL';
  start = '';
  end = '';

  jobId = '';
  job = signal<any | null>(null);
  msg = signal('');
  quota = signal<any | null>(null);
  quotaMsg = signal('');

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadQuota();
  }

  run() {
    this.msg.set('Submitting job...');
    this.job.set(null);
    let arr: number[];
    try { arr = JSON.parse(this.returnsText); } catch { this.msg.set('Invalid returns JSON'); return; }

    const body = {
      returns: arr,
      strategy: this.strategy,
      initialCash: Number(this.initialCash),
      contribution: Number(this.contribution),
      contributionEvery: Number(this.contributionEvery)
    };

    this.http.post<any>(`${API_BASE}/api/v1/simulation/backtest`, body).subscribe({
      next: (r) => {
        this.jobId = r.id;
        this.job.set(r);
        this.msg.set('Job submitted.');
      },
      error: (e) => this.msg.set(e?.error?.message || 'Submit failed')
    });
  }

  refresh() {
    if (!this.jobId) return;
    this.msg.set('Refreshing...');
    this.http.get<any>(`${API_BASE}/api/v1/simulation/backtest/${this.jobId}`).subscribe({
      next: (r) => { this.job.set(r); this.msg.set(''); },
      error: (e) => this.msg.set(e?.error?.message || 'Refresh failed')
    });
  }

  loadQuota() {
    this.quotaMsg.set('Loading quota...');
    this.http.get<any>(`${API_BASE}/api/v1/simulation/quota`).subscribe({
      next: (r) => {
        this.quota.set(r);
        this.quotaMsg.set('Quota updated.');
      },
      error: (e) => this.quotaMsg.set(e?.error?.message || 'Quota load failed')
    });
  }

  loadReturns() {
    if (!this.symbol.trim()) { this.msg.set('Symbol required'); return; }
    this.msg.set('Loading returns...');
    const params: any = { symbol: this.symbol.trim() };
    if (this.start.trim()) params.start = this.start.trim();
    if (this.end.trim()) params.end = this.end.trim();
    this.http.get<number[]>(`${API_BASE}/api/v1/market-data/returns`, { params }).subscribe({
      next: (r) => {
        this.returnsText = JSON.stringify(r);
        this.msg.set(`Loaded ${r.length} returns.`);
      },
      error: (e) => this.msg.set(e?.error?.message || 'Load returns failed')
    });
  }
}
