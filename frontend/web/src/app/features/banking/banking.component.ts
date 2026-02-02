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
      <h2 style="margin-top:0;">Banking (Instant Transfers)</h2>
      <p class="small">
        Internal banking balance with real-time transfers to and from investing.
      </p>

      <div class="row" style="align-items:center;">
        <div style="flex:2;">
          <div class="small">Banking Balance</div>
          <div style="font-size:22px; font-weight:700;">{{account()?.cash | number:'1.2-2'}} {{account()?.currency}}</div>
        </div>
        <div style="flex:1; text-align:right;">
          <button class="secondary" (click)="loadAccount()">Refresh</button>
        </div>
      </div>

      <div style="height:12px;"></div>
      <h3>Instant Transfer</h3>
      <div class="row">
        <div style="flex:1;">
          <label>Direction</label>
          <select [(ngModel)]="direction" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="TO_INVESTING">To Investing</option>
            <option value="FROM_INVESTING">From Investing</option>
          </select>
        </div>
        <div style="flex:1;">
          <label>Amount</label>
          <input [(ngModel)]="amount" type="number" step="1" />
        </div>
        <div style="flex:2;">
          <label>Note</label>
          <input [(ngModel)]="note" placeholder="Optional memo" />
        </div>
        <div style="flex:1; align-self:flex-end;">
          <button (click)="transfer()">Transfer</button>
        </div>
      </div>
      <div style="height:6px;"></div>
      <div class="small">{{msg()}}</div>

      <div style="height:16px;"></div>
      <h3>Recent Transfers</h3>
      <div class="row">
        <div style="flex:1;">
          <label>Limit</label>
          <input [(ngModel)]="limit" type="number" />
        </div>
        <div style="flex:1; align-self:flex-end;">
          <button class="secondary" (click)="loadTransfers()">Refresh</button>
        </div>
      </div>

      <div *ngIf="transfers().length" style="margin-top:10px;">
        <div class="row" style="font-weight:600;">
          <div style="flex:2;">Direction</div>
          <div style="flex:1;">Amount</div>
          <div style="flex:1;">Status</div>
          <div style="flex:2;">Time</div>
        </div>
        <div *ngFor="let t of transfers()" class="row" style="border-bottom:1px solid #eee; padding:6px 0;">
          <div style="flex:2;">{{t.direction}}</div>
          <div style="flex:1;">{{t.amount | number:'1.2-2'}} {{t.currency}}</div>
          <div style="flex:1;">{{t.status}}</div>
          <div style="flex:2;" class="small">{{t.createdAt}}</div>
        </div>
      </div>
    </div>
  `
})
export class BankingComponent {
  account = signal<any | null>(null);
  transfers = signal<any[]>([]);
  msg = signal('');

  direction = 'TO_INVESTING';
  amount = 500;
  note = '';
  limit = 25;

  constructor(private http: HttpClient) {
    this.loadAccount();
    this.loadTransfers();
  }

  loadAccount() {
    this.http.get<any>(`${API_BASE}/api/v1/banking/account`).subscribe({
      next: (r) => this.account.set(r),
      error: (e) => this.msg.set(e?.error?.message || 'Failed to load account')
    });
  }

  loadTransfers() {
    const params: any = { limit: this.limit };
    this.http.get<any[]>(`${API_BASE}/api/v1/banking/transfers`, { params }).subscribe({
      next: (r) => this.transfers.set(r || []),
      error: (e) => this.msg.set(e?.error?.message || 'Failed to load transfers')
    });
  }

  transfer() {
    this.msg.set('Submitting transfer...');
    const body = {
      direction: this.direction,
      amount: Number(this.amount),
      note: this.note || null
    };
    this.http.post(`${API_BASE}/api/v1/banking/transfer`, body).subscribe({
      next: () => {
        this.msg.set('Transfer completed.');
        this.loadAccount();
        this.loadTransfers();
      },
      error: (e) => this.msg.set(e?.error?.message || 'Transfer failed')
    });
  }
}
