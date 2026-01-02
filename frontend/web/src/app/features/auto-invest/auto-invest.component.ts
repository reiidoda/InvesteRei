import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '../../core/api';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="card">
      <h2 style="margin-top:0;">Auto-Invest (AI + User Confirmation)</h2>
      <p class="small">
        AI proposes trades. You approve to execute. Live mode is scaffolded only.
      </p>

      <h3>Compliance (Scaffold)</h3>
      <div class="row">
        <div style="flex:1;">
          <label>KYC</label>
          <select [(ngModel)]="kycStatus" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="NOT_STARTED">Not Started</option>
            <option value="PENDING">Pending</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
        <div style="flex:1;">
          <label>AML</label>
          <select [(ngModel)]="amlStatus" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="NOT_SCREENED">Not Screened</option>
            <option value="PASSED">Passed</option>
            <option value="REVIEW">Review</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
        <div style="flex:1;">
          <label>Suitability</label>
          <select [(ngModel)]="suitabilityStatus" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="UNKNOWN">Unknown</option>
            <option value="SUITABLE">Suitable</option>
            <option value="RESTRICTED">Restricted</option>
          </select>
        </div>
      </div>
      <div style="height:10px;"></div>
      <div class="row">
        <div style="flex:1;">
          <label>Risk Profile</label>
          <select [(ngModel)]="riskProfile" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="CONSERVATIVE">Conservative</option>
            <option value="MODERATE">Moderate</option>
            <option value="AGGRESSIVE">Aggressive</option>
          </select>
        </div>
        <div style="flex:1;">
          <label>Account Type</label>
          <select [(ngModel)]="accountType" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="INDIVIDUAL">Individual</option>
            <option value="JOINT">Joint</option>
            <option value="CORPORATE">Corporate</option>
            <option value="TRUST">Trust</option>
          </select>
        </div>
        <div style="flex:1;">
          <label>Tax Residency</label>
          <select [(ngModel)]="taxResidency" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="US">US</option>
            <option value="EU">EU</option>
            <option value="UK">UK</option>
            <option value="APAC">APAC</option>
            <option value="LATAM">LATAM</option>
            <option value="GLOBAL">Global</option>
          </select>
        </div>
        <div style="flex:1;">
          <label>Accredited Investor</label>
          <select [(ngModel)]="accredited" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option [ngValue]="false">No</option>
            <option [ngValue]="true">Yes</option>
          </select>
        </div>
      </div>
      <div style="height:10px;"></div>
      <label>Restrictions (comma-separated)</label>
      <input [(ngModel)]="restrictionsText" placeholder="e.g., no_options,no_crypto" />
      <div style="height:10px;"></div>
      <button (click)="saveCompliance()">Save Compliance</button>
      <div style="height:8px;"></div>
      <div class="small">{{complianceMsg()}}</div>

      <div style="height: 18px;"></div>

      <h3>Funding Sources (Scaffold)</h3>
      <p class="small">Link a funding method and simulate a cash deposit. No live money movement.</p>
      <div class="row">
        <div style="flex:1;">
          <label>Method</label>
          <select [(ngModel)]="fundingMethod" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="CARD">Card</option>
            <option value="BANK_ACH">Bank ACH</option>
            <option value="BANK_WIRE">Bank Wire</option>
            <option value="BANK_ACCOUNT">Bank Account</option>
            <option value="PAYPAL">PayPal</option>
            <option value="CRYPTO">Crypto</option>
          </select>
        </div>
        <div style="flex:1;">
          <label>Provider</label>
          <select [(ngModel)]="providerId" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option *ngFor="let p of providers()" [value]="p.id">{{p.displayName}}</option>
          </select>
        </div>
      </div>
      <div style="height: 10px;"></div>
      <div class="row">
        <div style="flex:1;">
          <label>Label</label>
          <input [(ngModel)]="fundingLabel" placeholder="Main Card" />
        </div>
        <div style="flex:1;">
          <label>Last4 / Ref</label>
          <input [(ngModel)]="fundingLast4" placeholder="1234" />
        </div>
        <div style="flex:1;">
          <label>Currency</label>
          <input [(ngModel)]="fundingCurrency" placeholder="USD" />
        </div>
      </div>
      <div style="height: 10px;"></div>
      <div class="row">
        <div style="flex:1;">
          <label>Network (crypto)</label>
          <input [(ngModel)]="fundingNetwork" placeholder="ETH" />
        </div>
        <div style="flex:1;">
          <label>&nbsp;</label>
          <button (click)="linkFunding()">Link Source</button>
        </div>
      </div>
      <div style="height: 8px;"></div>
      <div class="small">{{fundingMsg()}}</div>

      <div *ngIf="sources().length" style="margin-top: 10px;">
        <div><strong>Linked Sources</strong></div>
        <pre>{{ sources() | json }}</pre>
        <div class="row">
          <button class="secondary" (click)="refreshSources()">Refresh</button>
          <button class="secondary" (click)="verifyFirstPending()">Verify First Pending</button>
        </div>
      </div>

      <div style="height: 12px;"></div>
      <div class="row">
        <div style="flex:1;">
          <label>Deposit Source</label>
          <select [(ngModel)]="depositSourceId" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option *ngFor="let s of sources()" [value]="s.id">{{s.label}} ({{s.status}})</option>
          </select>
        </div>
        <div style="flex:1;">
          <label>Deposit Amount</label>
          <input [(ngModel)]="depositAmount" type="number" step="10" />
        </div>
        <div style="flex:1; align-self:flex-end;">
          <button (click)="deposit()">Deposit</button>
        </div>
      </div>
      <div style="height: 8px;"></div>
      <div class="small">{{depositMsg()}}</div>

      <div style="height: 18px;"></div>

      <h3>Broker / Execution (Scaffold)</h3>
      <div class="row">
        <div style="flex:1;">
          <label>Region</label>
          <select [(ngModel)]="execRegion" (change)="refreshBrokerProviders()" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="US">US</option>
            <option value="EU">EU</option>
            <option value="UK">UK</option>
            <option value="APAC">APAC</option>
            <option value="LATAM">LATAM</option>
            <option value="GLOBAL">Global</option>
          </select>
        </div>
        <div style="flex:1;">
          <label>Asset Class</label>
          <select [(ngModel)]="execAssetClass" (change)="refreshBrokerProviders()" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="EQUITY">Equity</option>
            <option value="ETF">ETF</option>
            <option value="FIXED_INCOME">Fixed Income</option>
            <option value="FX">FX</option>
            <option value="CRYPTO">Crypto</option>
          </select>
        </div>
      </div>
      <div style="height:10px;"></div>
      <div class="row">
        <div style="flex:1;">
          <label>Provider</label>
          <select [(ngModel)]="brokerProviderId" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option *ngFor="let p of execProviders()" [value]="p.id">{{p.displayName}}</option>
          </select>
        </div>
        <div style="flex:1; align-self:flex-end;">
          <button (click)="refreshBrokerProviders()">Refresh Providers</button>
        </div>
        <div style="flex:1; align-self:flex-end;">
          <button (click)="linkBroker()">Link Broker Account</button>
        </div>
      </div>
      <div style="height:8px;"></div>
      <div class="small">{{brokerMsg()}}</div>
      <div *ngIf="brokerAccounts().length" style="margin-top: 8px;">
        <div><strong>Broker Accounts</strong></div>
        <pre>{{ brokerAccounts() | json }}</pre>
      </div>

      <div style="height: 18px;"></div>

      <h3>Paper Account</h3>
      <div class="row">
        <div style="flex:1;">
          <label>Cash</label>
          <input [(ngModel)]="cash" type="number" />
        </div>
        <div style="flex:2;">
          <label>Positions (JSON map)</label>
          <textarea [(ngModel)]="positionsText" rows="3" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;"></textarea>
        </div>
      </div>
      <div style="height: 10px;"></div>
      <div class="row">
        <button (click)="seedAccount()">Seed Account</button>
        <button class="secondary" (click)="loadAccount()">Refresh</button>
      </div>
      <div style="height: 8px;"></div>
      <div class="small">{{accountMsg()}}</div>
      <div *ngIf="account()">
        <pre>{{ account() | json }}</pre>
      </div>

      <div style="height: 18px;"></div>

      <h3>Proposal Inputs</h3>
      <div class="row">
        <div style="flex:1;">
          <label>Symbols (comma-separated)</label>
          <input [(ngModel)]="symbolsText" placeholder="AAPL,MSFT,TLT" />
        </div>
        <div style="flex:1;">
          <label>Prices (JSON map)</label>
          <textarea [(ngModel)]="pricesText" rows="2" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;"></textarea>
        </div>
      </div>

      <div style="height: 12px;"></div>
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
          <label>method</label>
          <select [(ngModel)]="method" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="MEAN_VARIANCE_PGD">Mean-Variance (PGD)</option>
            <option value="MIN_VARIANCE">Min Variance</option>
            <option value="RISK_PARITY">Risk Parity</option>
            <option value="KELLY_APPROX">Kelly (Approx)</option>
            <option value="BLACK_LITTERMAN_MEANVAR">Black-Litterman + Mean-Var</option>
          </select>
        </div>
        <div style="flex:1;">
          <label>riskAversion</label>
          <input [(ngModel)]="riskAversion" type="number" />
        </div>
      </div>

      <div style="height: 12px;"></div>
      <div class="row">
        <div style="flex:1;">
          <label>minWeight</label>
          <input [(ngModel)]="minWeight" type="number" step="0.05" />
        </div>
        <div style="flex:1;">
          <label>maxWeight</label>
          <input [(ngModel)]="maxWeight" type="number" step="0.05" />
        </div>
      </div>

      <div style="height: 12px;"></div>
      <div class="row">
        <div style="flex:1;">
          <label>fractionalKelly</label>
          <input [(ngModel)]="fractionalKelly" type="number" step="0.05" />
        </div>
        <div style="flex:1;">
          <label>minTradeValue</label>
          <input [(ngModel)]="minTradeValue" type="number" step="1" />
        </div>
      </div>

      <div style="height: 12px;"></div>
      <div class="row">
        <div style="flex:1;">
          <label>maxTradePctOfEquity</label>
          <input [(ngModel)]="maxTradePctOfEquity" type="number" step="0.05" />
        </div>
        <div style="flex:1;">
          <label>maxTurnover</label>
          <input [(ngModel)]="maxTurnover" type="number" step="0.05" />
        </div>
      </div>

      <div style="height: 12px;"></div>
      <div class="row">
        <div style="flex:1;">
          <label>Execution Mode</label>
          <select [(ngModel)]="executionMode" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="PAPER">Paper</option>
            <option value="LIVE">Live (Scaffold)</option>
          </select>
        </div>
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
      </div>

      <div style="height: 12px;"></div>
      <button (click)="propose()">Generate Proposal</button>
      <div style="height: 10px;"></div>
      <div class="small">{{msg()}}</div>

      <div *ngIf="proposal()" style="margin-top: 14px;">
        <h3>AI Proposal</h3>
        <div class="small">Status: {{proposal()?.status}}</div>
        <div style="height: 8px;"></div>
        <div class="row">
          <div style="flex:1;">
            <div><strong>Expected Return</strong></div>
            <div>{{proposal()?.expectedReturn}}</div>
          </div>
          <div style="flex:1;">
            <div><strong>Variance</strong></div>
            <div>{{proposal()?.variance}}</div>
          </div>
          <div style="flex:1;">
            <div><strong>Confidence</strong></div>
            <div>{{proposal()?.ai?.confidence}}</div>
          </div>
          <div style="flex:1;">
            <div><strong>Platform Fee</strong></div>
            <div>{{proposal()?.feeTotal}} ({{proposal()?.feeBps}} bps)</div>
          </div>
        </div>
        <div style="height: 8px;"></div>
        <div><strong>AI Summary</strong></div>
        <div class="small">{{proposal()?.ai?.summary}}</div>
        <div style="height: 8px;"></div>
        <div><strong>Policy Checks</strong></div>
        <pre>{{proposal()?.policyChecks | json}}</pre>

        <div style="height: 12px;"></div>
        <div class="row">
          <button (click)="decide('APPROVE')">Approve</button>
          <button class="secondary" (click)="decide('WAIT')">Wait</button>
          <button class="secondary" (click)="decide('DECLINE')">Decline</button>
        </div>

        <div *ngIf="executionIntent()" style="margin-top: 10px;">
          <div><strong>Execution Intent</strong></div>
          <pre>{{ executionIntent() | json }}</pre>
          <button class="secondary" (click)="simulateFill()">Simulate Fill</button>
        </div>

        <div style="height: 10px;"></div>
        <pre>{{ proposal() | json }}</pre>
      </div>
    </div>
  `
})
export class AutoInvestComponent {
  cash = 10000;
  positionsText = '{"AAPL":5,"MSFT":3,"TLT":10}';
  symbolsText = 'AAPL,MSFT,TLT';
  pricesText = '{"AAPL":180,"MSFT":330,"TLT":92}';
  muText = '[0.10, 0.07, 0.04]';
  covText = '[[0.20,0.05,0.02],[0.05,0.12,0.01],[0.02,0.01,0.06]]';

  fundingMethod = 'CARD';
  providerId = 'stripe';
  fundingLabel = 'Main Funding';
  fundingLast4 = '1234';
  fundingCurrency = 'USD';
  fundingNetwork = 'ETH';
  depositSourceId = '';
  depositAmount = 1000;

  kycStatus = 'NOT_STARTED';
  amlStatus = 'NOT_SCREENED';
  suitabilityStatus = 'UNKNOWN';
  riskProfile = 'MODERATE';
  accountType = 'INDIVIDUAL';
  taxResidency = 'US';
  accredited = false;
  restrictionsText = '';

  execRegion = 'US';
  execAssetClass = 'EQUITY';
  brokerProviderId = 'interactive_brokers';

  method = 'MEAN_VARIANCE_PGD';
  riskAversion = 6;
  minWeight = 0.0;
  maxWeight = 0.6;
  fractionalKelly = 0.25;
  minTradeValue = 10;
  maxTradePctOfEquity = 0.25;
  maxTurnover = 0.7;
  executionMode = 'PAPER';
  orderType = 'MARKET';
  timeInForce = 'DAY';

  msg = signal('');
  accountMsg = signal('');
  complianceMsg = signal('');
  brokerMsg = signal('');
  proposal = signal<any | null>(null);
  executionIntent = signal<any | null>(null);
  account = signal<any | null>(null);
  providers = signal<any[]>([]);
  execProviders = signal<any[]>([]);
  brokerAccounts = signal<any[]>([]);
  sources = signal<any[]>([]);
  fundingMsg = signal('');
  depositMsg = signal('');

  constructor(private http: HttpClient) {
    this.loadProviders();
    this.refreshSources();
    this.refreshBrokerProviders();
    this.refreshBrokerAccounts();
    this.loadCompliance();
  }

  loadCompliance() {
    this.http.get<any>(`${API_BASE}/api/v1/compliance/profile`).subscribe({
      next: (r) => {
        this.kycStatus = r.kycStatus || this.kycStatus;
        this.amlStatus = r.amlStatus || this.amlStatus;
        this.suitabilityStatus = r.suitabilityStatus || this.suitabilityStatus;
        this.riskProfile = r.riskProfile || this.riskProfile;
        this.accountType = r.accountType || this.accountType;
        this.taxResidency = r.taxResidency || this.taxResidency;
        this.accredited = !!r.accreditedInvestor;
        if (Array.isArray(r.restrictions)) {
          this.restrictionsText = r.restrictions.join(',');
        }
      },
      error: () => {}
    });
  }

  saveCompliance() {
    this.complianceMsg.set('Saving...');
    const body = {
      kycStatus: this.kycStatus,
      amlStatus: this.amlStatus,
      suitabilityStatus: this.suitabilityStatus,
      riskProfile: this.riskProfile,
      accountType: this.accountType,
      taxResidency: this.taxResidency,
      accreditedInvestor: this.accredited,
      restrictions: this.restrictionsText.split(',').map(s => s.trim()).filter(Boolean),
    };
    this.http.post(`${API_BASE}/api/v1/compliance/profile`, body).subscribe({
      next: () => this.complianceMsg.set('Saved.'),
      error: (e) => this.complianceMsg.set(e?.error?.message || 'Save failed')
    });
  }

  loadProviders() {
    this.http.get<any[]>(`${API_BASE}/api/v1/funding/providers`).subscribe({
      next: (r) => { this.providers.set(r); },
      error: () => {}
    });
  }

  refreshSources() {
    this.http.get<any[]>(`${API_BASE}/api/v1/funding/sources`).subscribe({
      next: (r) => { this.sources.set(r); if (!this.depositSourceId && r.length) this.depositSourceId = r[0].id; },
      error: () => {}
    });
  }

  linkFunding() {
    this.fundingMsg.set('Linking...');
    const body = {
      methodType: this.fundingMethod,
      providerId: this.providerId,
      label: this.fundingLabel,
      last4: this.fundingLast4,
      currency: this.fundingCurrency,
      network: this.fundingNetwork,
    };
    this.http.post(`${API_BASE}/api/v1/funding/sources`, body).subscribe({
      next: () => { this.fundingMsg.set('Linked.'); this.refreshSources(); },
      error: (e) => this.fundingMsg.set(e?.error?.message || 'Link failed')
    });
  }

  verifyFirstPending() {
    const pending = this.sources().find(s => s.status === 'PENDING_VERIFICATION');
    if (!pending) { this.fundingMsg.set('No pending sources.'); return; }
    this.fundingMsg.set('Verifying...');
    this.http.post(`${API_BASE}/api/v1/funding/sources/${pending.id}/verify`, {}).subscribe({
      next: () => { this.fundingMsg.set('Verified.'); this.refreshSources(); },
      error: (e) => this.fundingMsg.set(e?.error?.message || 'Verify failed')
    });
  }

  deposit() {
    if (!this.depositSourceId) { this.depositMsg.set('Select a source.'); return; }
    this.depositMsg.set('Depositing...');
    this.http.post(`${API_BASE}/api/v1/funding/deposits`, {
      sourceId: this.depositSourceId,
      amount: Number(this.depositAmount)
    }).subscribe({
      next: () => { this.depositMsg.set('Deposit complete.'); this.loadAccount(); },
      error: (e) => this.depositMsg.set(e?.error?.message || 'Deposit failed')
    });
  }

  refreshBrokerProviders() {
    this.http.get<any[]>(`${API_BASE}/api/v1/execution/providers`, {
      params: { region: this.execRegion, assetClass: this.execAssetClass }
    }).subscribe({
      next: (r) => {
        this.execProviders.set(r);
        if (r.length) this.brokerProviderId = r[0].id;
      },
      error: () => {}
    });
  }

  refreshBrokerAccounts() {
    this.http.get<any[]>(`${API_BASE}/api/v1/execution/accounts`).subscribe({
      next: (r) => this.brokerAccounts.set(r),
      error: () => {}
    });
  }

  linkBroker() {
    this.brokerMsg.set('Linking broker account...');
    const body = {
      providerId: this.brokerProviderId,
      region: this.execRegion,
      assetClasses: [this.execAssetClass]
    };
    this.http.post(`${API_BASE}/api/v1/execution/accounts/link`, body).subscribe({
      next: () => { this.brokerMsg.set('Linked.'); this.refreshBrokerAccounts(); },
      error: (e) => this.brokerMsg.set(e?.error?.message || 'Link failed')
    });
  }

  seedAccount() {
    this.accountMsg.set('Seeding account...');
    let positions: Record<string, number>;
    try { positions = JSON.parse(this.positionsText); }
    catch { this.accountMsg.set('Invalid positions JSON'); return; }

    this.http.post(`${API_BASE}/api/v1/trade/account/seed`, { cash: Number(this.cash), positions })
      .subscribe({
        next: (r) => { this.account.set(r); this.accountMsg.set('Account seeded.'); },
        error: (e) => this.accountMsg.set(e?.error?.message || 'Seed failed')
      });
  }

  loadAccount() {
    this.http.get(`${API_BASE}/api/v1/trade/account`).subscribe({
      next: (r) => { this.account.set(r); this.accountMsg.set(''); },
      error: (e) => this.accountMsg.set(e?.error?.message || 'Load failed')
    });
  }

  propose() {
    this.msg.set('Generating proposal...');
    this.proposal.set(null);
    this.executionIntent.set(null);

    const symbols = this.symbolsText.split(',').map(s => s.trim()).filter(Boolean);
    let mu: number[];
    let cov: number[][];
    let prices: Record<string, number>;
    try { mu = JSON.parse(this.muText); } catch { this.msg.set('Invalid mu JSON'); return; }
    try { cov = JSON.parse(this.covText); } catch { this.msg.set('Invalid cov JSON'); return; }
    try { prices = JSON.parse(this.pricesText); } catch { this.msg.set('Invalid prices JSON'); return; }

    const body = {
      symbols,
      mu,
      cov,
      prices,
      method: this.method,
      riskAversion: Number(this.riskAversion),
      minWeight: Number(this.minWeight),
      maxWeight: Number(this.maxWeight),
      fractionalKelly: Number(this.fractionalKelly),
      minTradeValue: Number(this.minTradeValue),
      maxTradePctOfEquity: Number(this.maxTradePctOfEquity),
      maxTurnover: Number(this.maxTurnover),
      executionMode: this.executionMode,
      region: this.execRegion,
      assetClass: this.execAssetClass,
      providerPreference: this.brokerProviderId,
      orderType: this.orderType,
      timeInForce: this.timeInForce,
    };

    this.http.post(`${API_BASE}/api/v1/trade/proposals`, body).subscribe({
      next: (r) => { this.proposal.set(r); this.msg.set('Proposal ready.'); },
      error: (e) => this.msg.set(e?.error?.message || 'Proposal failed')
    });
  }

  decide(action: 'APPROVE' | 'DECLINE' | 'WAIT') {
    const p = this.proposal();
    if (!p?.id) return;

    this.msg.set(`${action === 'APPROVE' ? 'Executing' : 'Updating'}...`);
    this.http.post(`${API_BASE}/api/v1/trade/proposals/${p.id}/decision`, { action }).subscribe({
      next: (r: any) => {
        this.proposal.set(r);
        this.msg.set('Done.');
        if (r.executionIntentId) {
          this.loadIntent(r.executionIntentId);
        }
        this.loadAccount();
      },
      error: (e) => this.msg.set(e?.error?.message || 'Decision failed')
    });
  }

  loadIntent(id: string) {
    this.http.get(`${API_BASE}/api/v1/execution/intents/${id}`).subscribe({
      next: (r) => this.executionIntent.set(r),
      error: () => {}
    });
  }

  simulateFill() {
    const intent = this.executionIntent();
    if (!intent?.id) return;
    this.http.post(`${API_BASE}/api/v1/execution/intents/${intent.id}/simulate-fill`, {}).subscribe({
      next: (r) => this.executionIntent.set(r),
      error: () => {}
    });
  }
}
