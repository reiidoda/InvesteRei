import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '../../core/api';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="card">
      <h2 style="margin-top:0;">AI Forecast</h2>
      <p class="small">
        Forecast returns and risk, then evaluate baselines with walk-forward validation.
      </p>

      <label>returns (JSON array)</label>
      <textarea [(ngModel)]="returnsText" rows="4" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;"></textarea>

      <div style="height:12px;"></div>
      <div class="row">
        <div style="flex:1;">
          <label>Horizon (periods)</label>
          <input [(ngModel)]="horizon" type="number" min="1" max="30" />
        </div>
        <div style="flex:1; align-self:flex-end;">
          <button (click)="runForecast()">Return Forecast</button>
        </div>
        <div style="flex:1; align-self:flex-end;">
          <button class="secondary" (click)="runRisk()">Risk Forecast</button>
        </div>
      </div>

      <div style="height:12px;"></div>
      <div class="row">
        <div style="flex:1;">
          <label>Walk-forward Window</label>
          <input [(ngModel)]="evalWindow" type="number" min="30" max="2000" />
        </div>
        <div style="flex:1; align-self:flex-end;">
          <button class="secondary" (click)="runEvaluation()">Evaluate Baselines</button>
        </div>
      </div>

      <div style="height:10px;"></div>
      <div class="small">{{msg()}}</div>

      <div *ngIf="forecast()" style="margin-top: 12px;">
        <div><strong>Return Forecast</strong></div>
        <pre>{{ forecast() | json }}</pre>
      </div>

      <div *ngIf="risk()" style="margin-top: 12px;">
        <div><strong>Risk Forecast</strong></div>
        <pre>{{ risk() | json }}</pre>
      </div>

      <div *ngIf="evaluation()" style="margin-top: 12px;">
        <div><strong>Walk-forward Evaluation</strong></div>
        <pre>{{ evaluation() | json }}</pre>
      </div>

      <div style="height:18px;"></div>

      <h3>Model Registry</h3>
      <div class="row">
        <div style="flex:1;">
          <label>Model Name</label>
          <input [(ngModel)]="modelName" placeholder="risk-volatility" />
        </div>
        <div style="flex:1;">
          <label>Version</label>
          <input [(ngModel)]="modelVersion" placeholder="v1" />
        </div>
      </div>
      <div style="height:10px;"></div>
      <div class="row">
        <div style="flex:1;">
          <label>Training Start (ISO)</label>
          <input [(ngModel)]="trainingStart" placeholder="2024-01-01T00:00:00Z" />
        </div>
        <div style="flex:1;">
          <label>Training End (ISO)</label>
          <input [(ngModel)]="trainingEnd" placeholder="2024-06-30T00:00:00Z" />
        </div>
      </div>
      <div style="height:10px;"></div>
      <label>Metrics (JSON)</label>
      <textarea [(ngModel)]="metricsText" rows="3" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;"></textarea>
      <div style="height:10px;"></div>
      <div class="row">
        <button (click)="registerModel()">Register Model</button>
        <button class="secondary" (click)="loadModels()">Refresh Registry</button>
      </div>
      <div style="height:8px;"></div>
      <div class="small">{{modelMsg()}}</div>

      <pre *ngIf="models().length" style="margin-top:10px;">{{ models() | json }}</pre>
    </div>
  `
})
export class AiForecastComponent {
  returnsText = '[0.01,-0.02,0.005,0.012,-0.003,0.004,0.002,-0.006,0.009,0.003,0.002,0.001,-0.004,0.006,0.004,0.003,-0.002,0.001,0.002,0.003,0.004,0.002,-0.003,0.005,0.006,0.001,-0.001,0.002,0.003,0.004,0.002,0.001,0.002,0.001,0.003,0.002,0.001,0.003,0.004,0.002,0.001,0.002,0.003,0.004,0.002,0.001,0.002,0.003,0.004,0.002,0.001,0.002,0.003,0.004,0.002,0.001,0.002,0.003,0.004,0.002]';
  horizon = 1;
  evalWindow = 60;

  modelName = 'risk-volatility';
  modelVersion = 'v1';
  trainingStart = '';
  trainingEnd = '';
  metricsText = '{"mae":0.01,"mse":0.0002,"regime":"LOW_VOL"}';

  msg = signal('');
  modelMsg = signal('');
  forecast = signal<any | null>(null);
  risk = signal<any | null>(null);
  evaluation = signal<any | null>(null);
  models = signal<any[]>([]);

  constructor(private http: HttpClient) {
    this.loadModels();
  }

  private parseReturns(): number[] | null {
    try {
      return JSON.parse(this.returnsText);
    } catch {
      this.msg.set('Invalid returns JSON');
      return null;
    }
  }

  runForecast() {
    this.msg.set('Forecasting returns...');
    this.forecast.set(null);
    const arr = this.parseReturns();
    if (!arr) return;

    this.http.post<any>(`${API_BASE}/api/v1/ai/predict`, { returns: arr, horizon: Number(this.horizon) })
      .subscribe({
        next: (r) => { this.forecast.set(r); this.msg.set('Done.'); },
        error: (e) => this.msg.set(e?.error?.message || 'Request failed (are you logged in?)')
      });
  }

  runRisk() {
    this.msg.set('Forecasting risk...');
    this.risk.set(null);
    const arr = this.parseReturns();
    if (!arr) return;

    this.http.post<any>(`${API_BASE}/api/v1/ai/risk`, { returns: arr, horizon: Number(this.horizon) })
      .subscribe({
        next: (r) => { this.risk.set(r); this.msg.set('Done.'); },
        error: (e) => this.msg.set(e?.error?.message || 'Risk forecast failed')
      });
  }

  runEvaluation() {
    this.msg.set('Evaluating baselines...');
    this.evaluation.set(null);
    const arr = this.parseReturns();
    if (!arr) return;

    const body = { returns: arr, horizon: Number(this.horizon), window: Number(this.evalWindow) };
    this.http.post<any>(`${API_BASE}/api/v1/ai/evaluate`, body)
      .subscribe({
        next: (r) => { this.evaluation.set(r); this.msg.set('Done.'); },
        error: (e) => this.msg.set(e?.error?.message || 'Evaluation failed')
      });
  }

  loadModels() {
    this.http.get<any[]>(`${API_BASE}/api/v1/ai/models`).subscribe({
      next: (r) => this.models.set(r || []),
      error: () => {}
    });
  }

  registerModel() {
    this.modelMsg.set('Registering model...');
    let metrics: any = {};
    if (this.metricsText.trim()) {
      try { metrics = JSON.parse(this.metricsText); } catch { this.modelMsg.set('Invalid metrics JSON'); return; }
    }
    const body: any = {
      modelName: this.modelName,
      version: this.modelVersion,
      trainingStart: this.trainingStart || null,
      trainingEnd: this.trainingEnd || null,
      metrics,
      status: 'DEPLOYED'
    };
    this.http.post(`${API_BASE}/api/v1/ai/models`, body).subscribe({
      next: () => { this.modelMsg.set('Registered.'); this.loadModels(); },
      error: (e) => this.modelMsg.set(e?.error?.message || 'Register failed')
    });
  }
}
