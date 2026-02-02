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
      <h2 style="margin-top:0;">Wealth Plan</h2>
      <p class="small">Goal-based planning with probability-of-success simulations.</p>

      <h3>Create Plan</h3>
      <div class="row">
        <div style="flex:1;">
          <label>Goal Type</label>
          <select [(ngModel)]="planType" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="RETIREMENT">Retirement</option>
            <option value="GENERAL_INVESTING">General Investing</option>
            <option value="MAJOR_PURCHASE">Major Purchase</option>
          </select>
        </div>
        <div style="flex:2;">
          <label>Name</label>
          <input [(ngModel)]="name" placeholder="Retirement Plan" />
        </div>
        <div style="flex:1;">
          <label>Starting Balance</label>
          <input [(ngModel)]="startingBalance" type="number" />
        </div>
        <div style="flex:1;">
          <label>Target Balance</label>
          <input [(ngModel)]="targetBalance" type="number" />
        </div>
      </div>
      <div style="height:8px;"></div>
      <div class="row">
        <div style="flex:1;">
          <label>Monthly Contribution</label>
          <input [(ngModel)]="monthlyContribution" type="number" />
        </div>
        <div style="flex:1;">
          <label>Horizon (years)</label>
          <input [(ngModel)]="horizonYears" type="number" />
        </div>
        <div style="flex:1;">
          <label>Expected Return</label>
          <input [(ngModel)]="expectedReturn" type="number" step="0.01" />
        </div>
        <div style="flex:1;">
          <label>Volatility</label>
          <input [(ngModel)]="volatility" type="number" step="0.01" />
        </div>
        <div style="flex:1;">
          <label>Simulations</label>
          <input [(ngModel)]="simulationCount" type="number" />
        </div>
      </div>
      <div style="height:8px;"></div>
      <button (click)="create()">Create Plan</button>
      <button class="secondary" (click)="loadPlans()">Refresh</button>
      <div style="height:6px;"></div>
      <div class="small">{{msg()}}</div>

      <div *ngIf="plans().length" style="margin-top:14px;">
        <h3>Plans</h3>
        <div *ngFor="let p of plans()" style="border:1px solid #eee; border-radius:12px; padding:12px; margin-top:8px;">
          <div class="row">
            <div style="flex:2;"><strong>{{p.name}}</strong> <span class="small">({{p.planType}})</span></div>
            <div style="flex:1;">Target: {{p.targetBalance | number:'1.0-0'}}</div>
            <div style="flex:1;">Horizon: {{p.horizonYears}}y</div>
          </div>
          <div class="small">Success: {{p.successProbability | percent:'1.1-1'}} • Median: {{p.medianOutcome | number:'1.0-0'}}</div>
          <div class="small">P10: {{p.p10Outcome | number:'1.0-0'}} • P90: {{p.p90Outcome | number:'1.0-0'}}</div>
          <div class="small">Last Simulated: {{p.lastSimulatedAt || 'never'}}</div>
          <div class="row" style="margin-top:6px;">
            <button class="secondary" (click)="simulate(p.id)">Simulate</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class WealthPlanComponent {
  planType = 'RETIREMENT';
  name = 'Retirement Plan';
  startingBalance = 25000;
  targetBalance = 500000;
  monthlyContribution = 800;
  horizonYears = 20;
  expectedReturn = 0.06;
  volatility = 0.12;
  simulationCount = 1000;

  plans = signal<any[]>([]);
  msg = signal('');

  constructor(private http: HttpClient) {
    this.loadPlans();
  }

  create() {
    const body = {
      planType: this.planType,
      name: this.name,
      startingBalance: Number(this.startingBalance),
      targetBalance: Number(this.targetBalance),
      monthlyContribution: Number(this.monthlyContribution),
      horizonYears: Number(this.horizonYears),
      expectedReturn: Number(this.expectedReturn),
      volatility: Number(this.volatility),
      simulationCount: Number(this.simulationCount)
    };
    this.msg.set('Creating plan...');
    this.http.post(`${API_BASE}/api/v1/wealth/plan`, body).subscribe({
      next: () => { this.msg.set('Plan created.'); this.loadPlans(); },
      error: (e) => this.msg.set(e?.error?.message || 'Create failed')
    });
  }

  loadPlans() {
    this.http.get<any[]>(`${API_BASE}/api/v1/wealth/plan`).subscribe({
      next: (r) => { this.plans.set(r || []); this.msg.set(''); },
      error: (e) => this.msg.set(e?.error?.message || 'Load failed')
    });
  }

  simulate(id: string) {
    const body = {
      simulationCount: Number(this.simulationCount),
      expectedReturn: Number(this.expectedReturn),
      volatility: Number(this.volatility)
    };
    this.msg.set('Simulating...');
    this.http.post(`${API_BASE}/api/v1/wealth/plan/${id}/simulate`, body).subscribe({
      next: () => { this.msg.set('Simulation complete.'); this.loadPlans(); },
      error: (e) => this.msg.set(e?.error?.message || 'Simulation failed')
    });
  }
}
