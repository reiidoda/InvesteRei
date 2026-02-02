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
      <h2 style="margin-top:0;">Portfolio Builder</h2>
      <p class="small">Analyze diversification by sector and asset class.</p>

      <label>Holdings (one per line: SYMBOL,QUANTITY,PRICE)</label>
      <textarea [(ngModel)]="holdingsText" rows="6" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;"></textarea>
      <div style="height:8px;"></div>
      <button (click)="analyze()">Analyze</button>
      <div style="height:6px;"></div>
      <div class="small">{{msg()}}</div>

      <div *ngIf="result()" style="margin-top:14px;">
        <div class="row">
          <div style="flex:1;"><strong>Total Value</strong> {{result()?.totalValue | number:'1.2-2'}}</div>
          <div style="flex:1;"><strong>Diversification Score</strong> {{result()?.diversificationScore | number:'1.0-0'}}</div>
          <div style="flex:1;"><strong>HHI</strong> {{result()?.concentrationHhi | number:'1.3-3'}}</div>
        </div>

        <div style="height:10px;"></div>
        <h4>Sector Allocation</h4>
        <div *ngFor="let s of sectorKeys()" class="row" style="padding:4px 0;">
          <div style="flex:2;">{{s}}</div>
          <div style="flex:1;">{{result()?.sectorWeights[s] | percent:'1.1-1'}}</div>
        </div>

        <div style="height:10px;"></div>
        <h4>Asset Class Allocation</h4>
        <div *ngFor="let a of assetKeys()" class="row" style="padding:4px 0;">
          <div style="flex:2;">{{a}}</div>
          <div style="flex:1;">{{result()?.assetClassWeights[a] | percent:'1.1-1'}}</div>
        </div>

        <div style="height:10px;"></div>
        <h4>Positions</h4>
        <div class="row" style="font-weight:600;">
          <div style="flex:1;">Symbol</div>
          <div style="flex:1;">Weight</div>
          <div style="flex:1;">Value</div>
          <div style="flex:1;">Sector</div>
          <div style="flex:1;">Asset Class</div>
        </div>
        <div *ngFor="let p of result()?.positions" class="row" style="border-bottom:1px solid #eee; padding:6px 0;">
          <div style="flex:1; font-weight:600;">{{p.symbol}}</div>
          <div style="flex:1;">{{p.weight | percent:'1.1-1'}}</div>
          <div style="flex:1;">{{p.value | number:'1.2-2'}}</div>
          <div style="flex:1;">{{p.sector}}</div>
          <div style="flex:1;">{{p.assetClass}}</div>
        </div>

        <div style="height:10px;"></div>
        <h4>Notes</h4>
        <div *ngIf="result()?.notes?.length" class="small">
          <div *ngFor="let note of result()?.notes">- {{note}}</div>
        </div>
      </div>
    </div>
  `
})
export class PortfolioBuilderComponent {
  holdingsText = 'AAPL,10,180\nMSFT,5,320\nJPM,20,160';
  result = signal<any | null>(null);
  msg = signal('');

  constructor(private http: HttpClient) {}

  sectorKeys() {
    return Object.keys(this.result()?.sectorWeights || {});
  }

  assetKeys() {
    return Object.keys(this.result()?.assetClassWeights || {});
  }

  analyze() {
    const holdings = this.holdingsText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        const [symbol, qty, price] = line.split(',').map((p) => p.trim());
        return {
          symbol,
          quantity: Number(qty),
          price: Number(price)
        };
      });

    this.msg.set('Analyzing...');
    this.http.post<any>(`${API_BASE}/api/v1/portfolio/builder/analyze`, { holdings }).subscribe({
      next: (r) => { this.result.set(r); this.msg.set(''); },
      error: (e) => this.msg.set(e?.error?.message || 'Analysis failed')
    });
  }
}
