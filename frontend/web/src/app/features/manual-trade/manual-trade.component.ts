import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '../../core/api';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="card">
      <h2 style="margin-top:0;">Manual Trading Desk</h2>
      <p class="small">Place manual trades with AI review + compliance checks.</p>

      <div class="row" *ngIf="accounts().length">
        <div style="flex:1;">
          <label>Broker Account</label>
          <select [(ngModel)]="accountId" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option *ngFor="let acct of accounts()" [value]="acct.id">
              {{acct.providerName || acct.providerId}} • {{acct.accountNumber || acct.id}}
            </option>
          </select>
        </div>
      </div>

      <div class="row" style="align-items:center; gap:12px;">
        <label style="display:flex; gap:8px; align-items:center;">
          <input type="checkbox" [(ngModel)]="useLegs" />
          Multi-leg order
        </label>
        <button class="secondary" *ngIf="useLegs" (click)="addLeg()">Add leg</button>
      </div>

      <div class="row" *ngIf="!useLegs">
        <div style="flex:1;">
          <label>Symbol</label>
          <input [(ngModel)]="symbol" />
        </div>
        <div style="flex:1;">
          <label>Side</label>
          <select [(ngModel)]="side" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="BUY">Buy</option>
            <option value="SELL">Sell</option>
          </select>
        </div>
        <div style="flex:1;">
          <label>Quantity</label>
          <input [(ngModel)]="quantity" type="number" />
        </div>
      </div>

      <div class="row">
        <div style="flex:1;">
          <label>Order Type</label>
          <select [(ngModel)]="orderType" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="MARKET">Market</option>
            <option value="LIMIT">Limit</option>
            <option value="STOP">Stop</option>
            <option value="STOP_LIMIT">Stop Limit</option>
          </select>
        </div>
        <div style="flex:1;">
          <label>Time In Force</label>
          <select [(ngModel)]="timeInForce" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="DAY">Day</option>
            <option value="GTC">GTC</option>
            <option value="IOC">IOC</option>
            <option value="FOK">FOK</option>
          </select>
        </div>
        <div style="flex:1;" *ngIf="!useLegs">
          <label>Asset Class</label>
          <select [(ngModel)]="assetClass" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="EQUITY">Equity</option>
            <option value="ETF">ETF</option>
            <option value="FX">FX</option>
            <option value="CRYPTO">Crypto</option>
            <option value="OPTIONS">Options</option>
            <option value="FUTURES">Futures</option>
            <option value="FIXED_INCOME">Fixed Income</option>
            <option value="COMMODITIES">Commodities</option>
            <option value="MUTUAL_FUND">Mutual Fund</option>
          </select>
        </div>
      </div>

      <div class="row">
        <div style="flex:1;" *ngIf="!useLegs">
          <label>Limit Price</label>
          <input [(ngModel)]="limitPrice" type="number" />
        </div>
        <div style="flex:1;" *ngIf="!useLegs">
          <label>Stop Price</label>
          <input [(ngModel)]="stopPrice" type="number" />
        </div>
        <div style="flex:1;">
          <label>Currency</label>
          <input [(ngModel)]="currency" />
        </div>
      </div>

      <div *ngIf="useLegs" style="margin-top: 8px;">
        <div class="row" style="align-items:center;">
          <div style="flex:1;"><strong>Order Legs</strong></div>
          <div><button class="secondary" (click)="addLeg()">Add leg</button></div>
        </div>
        <div class="card" style="margin-top:12px;" *ngFor="let leg of legs; let i = index">
          <div class="row">
            <div style="flex:1;">
              <label>Symbol</label>
              <input [(ngModel)]="leg.symbol" />
            </div>
            <div style="flex:1;">
              <label>Instrument ID</label>
              <input [(ngModel)]="leg.instrumentId" />
            </div>
            <div style="flex:1;">
              <label>Side</label>
              <select [(ngModel)]="leg.side" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
                <option value="BUY">Buy</option>
                <option value="SELL">Sell</option>
              </select>
            </div>
          </div>
          <div class="row">
            <div style="flex:1;">
              <label>Quantity</label>
              <input [(ngModel)]="leg.quantity" type="number" />
            </div>
            <div style="flex:1;">
              <label>Asset Class</label>
              <select [(ngModel)]="leg.assetClass" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
                <option value="EQUITY">Equity</option>
                <option value="ETF">ETF</option>
                <option value="FX">FX</option>
                <option value="CRYPTO">Crypto</option>
                <option value="OPTIONS">Options</option>
                <option value="FUTURES">Futures</option>
                <option value="FIXED_INCOME">Fixed Income</option>
                <option value="COMMODITIES">Commodities</option>
                <option value="MUTUAL_FUND">Mutual Fund</option>
              </select>
            </div>
            <div style="flex:1;">
              <label>Contract Multiplier</label>
              <input [(ngModel)]="leg.contractMultiplier" type="number" />
            </div>
          </div>
          <div class="row">
            <div style="flex:1;">
              <label>Limit Price</label>
              <input [(ngModel)]="leg.limitPrice" type="number" />
            </div>
            <div style="flex:1;">
              <label>Stop Price</label>
              <input [(ngModel)]="leg.stopPrice" type="number" />
            </div>
            <div style="flex:1; align-self:flex-end;">
              <button class="secondary" (click)="removeLeg(i)" *ngIf="legs.length > 1">Remove leg</button>
            </div>
          </div>
          <div class="row" *ngIf="leg.assetClass === 'OPTIONS'">
            <div style="flex:1;">
              <label>Option Type</label>
              <select [(ngModel)]="leg.optionType" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
                <option value="CALL">Call</option>
                <option value="PUT">Put</option>
              </select>
            </div>
            <div style="flex:1;">
              <label>Strike</label>
              <input [(ngModel)]="leg.optionStrike" type="number" />
            </div>
            <div style="flex:1;">
              <label>Expiry</label>
              <input [(ngModel)]="leg.optionExpiry" type="date" />
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div style="flex:1;">
          <label>Client Order ID</label>
          <input [(ngModel)]="clientOrderId" placeholder="Optional idempotency key" />
        </div>
        <div style="flex:1;" *ngIf="!useLegs">
          <label>Instrument ID</label>
          <input [(ngModel)]="instrumentId" placeholder="Optional internal/exchange id" />
        </div>
        <div style="flex:1; display:flex; align-items:flex-end;">
          <label style="display:flex; gap:8px; align-items:center;">
            <input type="checkbox" [(ngModel)]="allowFractional" />
            Allow fractional
          </label>
        </div>
      </div>

      <div class="row">
        <div style="flex:1;">
          <label>Routing</label>
          <input [(ngModel)]="routing" placeholder="Smart, DMA, etc." />
        </div>
        <div style="flex:1;" *ngIf="!useLegs">
          <label>Contract Multiplier</label>
          <input [(ngModel)]="contractMultiplier" type="number" placeholder="e.g. 100" />
        </div>
        <div style="flex:1;">
          <label>Notes</label>
          <input [(ngModel)]="notes" placeholder="Optional desk note" />
        </div>
      </div>

      <div class="row" *ngIf="!useLegs && assetClass === 'OPTIONS'">
        <div style="flex:1;">
          <label>Option Type</label>
          <select [(ngModel)]="optionType" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="CALL">Call</option>
            <option value="PUT">Put</option>
          </select>
        </div>
        <div style="flex:1;">
          <label>Strike</label>
          <input [(ngModel)]="optionStrike" type="number" />
        </div>
        <div style="flex:1;">
          <label>Expiry</label>
          <input [(ngModel)]="optionExpiry" type="date" />
        </div>
      </div>

      <div class="row">
        <div style="flex:1;">
          <label>AI Horizon (periods)</label>
          <input [(ngModel)]="aiHorizon" type="number" />
        </div>
        <div style="flex:1;">
          <label>AI Lookback (returns)</label>
          <input [(ngModel)]="lookback" type="number" />
        </div>
        <div style="flex:1; align-self:flex-end;">
          <button class="secondary" (click)="reviewOrder()">Review Order</button>
        </div>
      </div>

      <div style="height: 12px;"></div>
      <div class="row">
        <button (click)="placeOrder()" [disabled]="!accountId">Place Order</button>
        <button class="secondary" (click)="loadAccounts()">Refresh Accounts</button>
      </div>
      <div style="height: 8px;"></div>
      <div class="small">{{msg()}}</div>

      <div *ngIf="review()" style="margin-top: 16px;">
        <h3>AI + Compliance Review</h3>
        <div class="small" *ngIf="review()?.ai?.summary">{{review()?.ai?.summary}}</div>
        <ul *ngIf="review()?.ai?.reasons?.length">
          <li *ngFor="let reason of review()?.ai?.reasons">{{reason}}</li>
        </ul>
        <div class="small" *ngIf="review()?.disclaimer">{{review()?.disclaimer}}</div>

        <div style="height: 10px;"></div>
        <div><strong>Preview</strong></div>
        <pre>{{ review()?.preview | json }}</pre>

        <div *ngIf="review()?.policyChecks?.length">
          <div><strong>Policy Checks</strong></div>
          <pre>{{ review()?.policyChecks | json }}</pre>
        </div>

        <div *ngIf="review()?.cashImpact">
          <div><strong>Cash Impact</strong></div>
          <pre>{{ review()?.cashImpact | json }}</pre>
        </div>

        <div *ngIf="review()?.positionImpact">
          <div><strong>Position Impact</strong></div>
          <pre>{{ review()?.positionImpact | json }}</pre>
        </div>

        <div *ngIf="review()?.warnings?.length">
          <div><strong>Warnings</strong></div>
          <pre>{{ review()?.warnings | json }}</pre>
        </div>
      </div>
    </div>
  `
})
export class ManualTradeComponent implements OnInit {
  accounts = signal<any[]>([]);
  accountId = '';

  symbol = 'AAPL';
  side = 'BUY';
  quantity = 1;
  useLegs = false;
  legs = [this.createLeg()];
  orderType = 'MARKET';
  timeInForce = 'DAY';
  assetClass = 'EQUITY';
  limitPrice: number | null = null;
  stopPrice: number | null = null;
  currency = 'USD';
  clientOrderId = '';
  instrumentId = '';
  allowFractional = true;
  routing = '';
  contractMultiplier: number | null = null;
  optionType = 'CALL';
  optionStrike: number | null = null;
  optionExpiry = '';
  notes = '';

  aiHorizon = 1;
  lookback = 120;

  review = signal<any | null>(null);
  msg = signal('');

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadAccounts();
  }

  createLeg() {
    return {
      symbol: '',
      instrumentId: '',
      side: 'BUY',
      quantity: 1,
      assetClass: 'EQUITY',
      limitPrice: null,
      stopPrice: null,
      contractMultiplier: null,
      optionType: 'CALL',
      optionStrike: null,
      optionExpiry: ''
    };
  }

  addLeg() {
    this.legs = [...this.legs, this.createLeg()];
  }

  removeLeg(index: number) {
    this.legs = this.legs.filter((_, i) => i !== index);
  }

  loadAccounts() {
    this.msg.set('Loading accounts...');
    this.http.get<any[]>(`${API_BASE}/api/v1/brokers/accounts`).subscribe({
      next: (r) => {
        this.accounts.set(r || []);
        if (!this.accountId && r && r.length) {
          this.accountId = r[0].id;
        }
        this.msg.set('');
      },
      error: (e) => this.msg.set(e?.error?.message || 'Failed to load accounts')
    });
  }

  buildOrder() {
    const metadata: Record<string, any> = {};
    if (this.routing.trim()) metadata.routing = this.routing.trim();
    if (this.notes.trim()) metadata.notes = this.notes.trim();
    if (!this.useLegs && (this.assetClass === 'OPTIONS' || this.assetClass === 'FUTURES') && this.contractMultiplier) {
      metadata.contractMultiplier = Number(this.contractMultiplier);
    }
    if (!this.useLegs && this.assetClass === 'OPTIONS') {
      if (this.optionType) metadata.optionType = this.optionType;
      if (this.optionStrike) metadata.optionStrike = Number(this.optionStrike);
      if (this.optionExpiry) metadata.optionExpiry = this.optionExpiry;
    }

    const order: any = {
      orderType: this.orderType,
      timeInForce: this.timeInForce,
      currency: this.currency.trim(),
      allowFractional: this.allowFractional
    };

    if (this.useLegs) {
      const legs = this.legs.map((leg) => {
        const legMeta: Record<string, any> = {};
        if (leg.contractMultiplier) {
          legMeta.contractMultiplier = Number(leg.contractMultiplier);
        }
        const entry: any = {
          symbol: String(leg.symbol || '').trim(),
          instrumentId: String(leg.instrumentId || '').trim(),
          side: leg.side,
          quantity: Number(leg.quantity),
          assetClass: leg.assetClass,
          limitPrice: leg.limitPrice ? Number(leg.limitPrice) : null,
          stopPrice: leg.stopPrice ? Number(leg.stopPrice) : null,
          optionType: leg.optionType,
          strike: leg.optionStrike ? Number(leg.optionStrike) : null,
          expiry: leg.optionExpiry || null
        };
        if (leg.assetClass !== 'OPTIONS') {
          delete entry.optionType;
          delete entry.strike;
          delete entry.expiry;
        }
        if (Object.keys(legMeta).length) entry.metadata = legMeta;
        if (!entry.symbol) delete entry.symbol;
        if (!entry.instrumentId) delete entry.instrumentId;
        if (!entry.optionType) delete entry.optionType;
        if (!entry.strike) delete entry.strike;
        if (!entry.expiry) delete entry.expiry;
        return entry;
      }).filter((leg: any) => leg.symbol || leg.instrumentId);
      order.legs = legs;
      order.symbol = legs[0]?.symbol || '';
      order.assetClass = legs[0]?.assetClass || this.assetClass;
      order.side = this.side;
      order.quantity = legs.reduce((sum: number, leg: any) => sum + (Number(leg.quantity) || 0), 0);
    } else {
      order.symbol = this.symbol.trim();
      order.side = this.side;
      order.quantity = Number(this.quantity);
      order.assetClass = this.assetClass;
      order.limitPrice = this.limitPrice ? Number(this.limitPrice) : null;
      order.stopPrice = this.stopPrice ? Number(this.stopPrice) : null;
    }

    if (this.clientOrderId.trim()) order.clientOrderId = this.clientOrderId.trim();
    if (!this.useLegs && this.instrumentId.trim()) order.instrumentId = this.instrumentId.trim();
    if (Object.keys(metadata).length) order.metadata = metadata;
    return order;
  }

  reviewOrder() {
    if (!this.accountId) {
      this.msg.set('Account required');
      return;
    }
    this.msg.set('Reviewing order...');
    this.review.set(null);
    const body = {
      order: this.buildOrder(),
      aiHorizon: Number(this.aiHorizon),
      lookback: Number(this.lookback),
      includeCompliance: true,
    };
    this.http.post<any>(`${API_BASE}/api/v1/brokers/accounts/${this.accountId}/orders/review`, body).subscribe({
      next: (r) => { this.review.set(r); this.msg.set('Review ready.'); },
      error: (e) => this.msg.set(e?.error?.message || 'Review failed')
    });
  }

  placeOrder() {
    if (!this.accountId) {
      this.msg.set('Account required');
      return;
    }
    this.msg.set('Placing order...');
    const body = this.buildOrder();
    this.http.post<any>(`${API_BASE}/api/v1/brokers/accounts/${this.accountId}/orders`, body).subscribe({
      next: (r) => { this.msg.set('Order submitted.'); this.review.set(r); },
      error: (e) => this.msg.set(e?.error?.message || 'Order failed')
    });
  }
}
