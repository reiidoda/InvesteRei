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
      <h2 style="margin-top:0;">Screeners</h2>
      <p class="small">Filter securities using fundamentals and proprietary research signals.</p>

      <div class="row">
        <div style="flex:1;">
          <label>Asset Class</label>
          <select [(ngModel)]="assetClass" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="">Any</option>
            <option value="EQUITY">Equity</option>
            <option value="ETF">ETF</option>
            <option value="FIXED_INCOME">Fixed Income</option>
            <option value="MUTUAL_FUND">Mutual Fund</option>
            <option value="OPTIONS">Options</option>
          </select>
        </div>
        <div style="flex:1;">
          <label>Sector</label>
          <input [(ngModel)]="sector" placeholder="Technology" />
        </div>
        <div style="flex:1;">
          <label>Rating</label>
          <select [(ngModel)]="rating" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="">Any</option>
            <option value="OVERWEIGHT">Overweight</option>
            <option value="NEUTRAL">Neutral</option>
            <option value="UNDERWEIGHT">Underweight</option>
          </select>
        </div>
        <div style="flex:1;">
          <label>Focus List</label>
          <select [(ngModel)]="focusList" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="">Any</option>
            <option [ngValue]="true">Yes</option>
            <option [ngValue]="false">No</option>
          </select>
        </div>
      </div>
      <div style="height:8px;"></div>
      <div class="row">
        <div style="flex:1;">
          <label>Min P/E</label>
          <input [(ngModel)]="minPe" type="number" step="0.1" />
        </div>
        <div style="flex:1;">
          <label>Max P/E</label>
          <input [(ngModel)]="maxPe" type="number" step="0.1" />
        </div>
        <div style="flex:1;">
          <label>Min Dividend Yield</label>
          <input [(ngModel)]="minYield" type="number" step="0.001" />
        </div>
        <div style="flex:1;">
          <label>Max Dividend Yield</label>
          <input [(ngModel)]="maxYield" type="number" step="0.001" />
        </div>
        <div style="flex:1;">
          <label>Limit</label>
          <input [(ngModel)]="limit" type="number" />
        </div>
        <div style="flex:1; align-self:flex-end;">
          <button (click)="query()">Run Screen</button>
        </div>
      </div>
      <div style="height:6px;"></div>
      <div class="small">{{msg()}}</div>

      <div *ngIf="results().length" style="margin-top:12px;">
        <div class="row" style="font-weight:600;">
          <div style="flex:1;">Symbol</div>
          <div style="flex:2;">Name</div>
          <div style="flex:1;">Sector</div>
          <div style="flex:1;">P/E</div>
          <div style="flex:1;">Yield</div>
          <div style="flex:1;">Rating</div>
          <div style="flex:1;">Target</div>
          <div style="flex:1;">Focus</div>
        </div>
        <div *ngFor="let r of results()" class="row" style="border-bottom:1px solid #eee; padding:6px 0;">
          <div style="flex:1; font-weight:600;">{{r.symbol}}</div>
          <div style="flex:2;" class="small">{{r.name}}</div>
          <div style="flex:1;" class="small">{{r.sector || '-'}}</div>
          <div style="flex:1;">{{r.peRatio || '-'}}</div>
          <div style="flex:1;">{{r.dividendYield || '-'}}</div>
          <div style="flex:1;">{{r.rating || '-'}}</div>
          <div style="flex:1;">{{r.priceTarget || '-'}}</div>
          <div style="flex:1;">{{r.focusList ? 'Yes' : 'No'}}</div>
        </div>
      </div>
    </div>
  `
})
export class ScreenersComponent {
  assetClass = '';
  sector = '';
  rating = '';
  focusList: any = '';
  minPe: any = '';
  maxPe: any = '';
  minYield: any = '';
  maxYield: any = '';
  limit = 50;

  results = signal<any[]>([]);
  msg = signal('');

  constructor(private http: HttpClient) {
    this.query();
  }

  query() {
    this.msg.set('Running screen...');
    const body: any = {
      assetClass: this.assetClass || null,
      sector: this.sector || null,
      rating: this.rating || null,
      focusList: this.focusList === '' ? null : this.focusList,
      minPeRatio: this.minPe === '' ? null : Number(this.minPe),
      maxPeRatio: this.maxPe === '' ? null : Number(this.maxPe),
      minDividendYield: this.minYield === '' ? null : Number(this.minYield),
      maxDividendYield: this.maxYield === '' ? null : Number(this.maxYield),
      limit: Number(this.limit)
    };
    this.http.post<any>(`${API_BASE}/api/v1/screeners/query`, body).subscribe({
      next: (r) => { this.results.set(r?.results || []); this.msg.set(''); },
      error: (e) => this.msg.set(e?.error?.message || 'Screen failed')
    });
  }
}
