import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '../../core/api';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="card">
      <h2 style="margin-top:0;">Market Data</h2>
      <p class="small">
        Ingest price bars, pull cached quotes, backfill CSVs, and query historical data.
      </p>

      <h3>Ingest</h3>
      <label>Source</label>
      <input [(ngModel)]="source" placeholder="manual" />

      <div style="height:12px;"></div>
      <label>Prices (JSON array)</label>
      <textarea [(ngModel)]="pricesText" rows="5" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;"></textarea>

      <div style="height:12px;"></div>
      <button (click)="ingest()">Ingest Prices</button>
      <div style="height:8px;"></div>
      <div class="small">{{msg()}}</div>

      <div style="height: 22px;"></div>

      <h3>Market Data Access</h3>
      <p class="small">
        Licenses describe provider coverage. Entitlements control which symbols can be queried when enforcement is on.
      </p>
      <div class="row">
        <div style="flex:1;">
          <label>License Provider</label>
          <input [(ngModel)]="licenseProvider" placeholder="starter_csv" />
        </div>
        <div style="flex:1;">
          <label>Plan</label>
          <input [(ngModel)]="licensePlan" placeholder="internal" />
        </div>
        <div style="flex:1;">
          <label>Status</label>
          <select [(ngModel)]="licenseStatus" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="ACTIVE">ACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
            <option value="EXPIRED">EXPIRED</option>
          </select>
        </div>
      </div>
      <div class="row" style="margin-top:8px;">
        <div style="flex:1;">
          <label>Asset Classes</label>
          <input [(ngModel)]="licenseAssetClasses" placeholder="EQUITY,ETF" />
        </div>
        <div style="flex:1;">
          <label>Exchanges</label>
          <input [(ngModel)]="licenseExchanges" placeholder="NYSE,NASDAQ" />
        </div>
        <div style="flex:1;">
          <label>Regions</label>
          <input [(ngModel)]="licenseRegions" placeholder="US,EU" />
        </div>
      </div>
      <div style="height:8px;"></div>
      <div class="row">
        <button class="secondary" (click)="saveLicense()">Save License</button>
        <button class="secondary" (click)="loadLicenses()">Load Licenses</button>
      </div>
      <div style="height:6px;"></div>
      <div class="small">{{licenseMsg()}}</div>
      <pre *ngIf="licenses()?.length">{{ licenses() | json }}</pre>

      <div style="height: 12px;"></div>

      <div class="row">
        <div style="flex:1;">
          <label>Entitlement Type</label>
          <select [(ngModel)]="entitlementType" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="GLOBAL">GLOBAL</option>
            <option value="SYMBOL">SYMBOL</option>
            <option value="EXCHANGE">EXCHANGE</option>
            <option value="ASSET_CLASS">ASSET_CLASS</option>
            <option value="REGION">REGION</option>
          </select>
        </div>
        <div style="flex:1;">
          <label>Value</label>
          <input [(ngModel)]="entitlementValue" placeholder="AAPL" />
        </div>
        <div style="flex:1;">
          <label>Status</label>
          <select [(ngModel)]="entitlementStatus" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="ACTIVE">ACTIVE</option>
            <option value="REVOKED">REVOKED</option>
          </select>
        </div>
        <div style="flex:1;">
          <label>Source</label>
          <input [(ngModel)]="entitlementSource" placeholder="starter_csv" />
        </div>
      </div>
      <div style="height:8px;"></div>
      <div class="row">
        <button class="secondary" (click)="saveEntitlement()">Save Entitlement</button>
        <button class="secondary" (click)="loadEntitlements()">Load Entitlements</button>
      </div>
      <div style="height:6px;"></div>
      <div class="small">{{entitlementMsg()}}</div>
      <pre *ngIf="entitlements()?.length">{{ entitlements() | json }}</pre>

      <div style="height: 22px;"></div>

      <h3>Latest Quotes (Cached)</h3>
      <p class="small">Redis-backed cache (short TTL) before hitting the provider.</p>
      <div class="row">
        <div style="flex:2;">
          <label>Symbols (comma-separated)</label>
          <input [(ngModel)]="quoteSymbols" placeholder="AAPL,MSFT" />
        </div>
        <div style="flex:1; align-self:flex-end;">
          <button class="secondary" (click)="loadQuotes()">Load Quotes</button>
        </div>
      </div>
      <div style="height:8px;"></div>
      <div class="small">{{quoteMsg()}}</div>

      <div *ngIf="quoteMeta()" style="margin-top: 8px;">
        <div class="small">
          Cache hits: {{quoteMeta()?.cacheHits}} | Fetched: {{quoteMeta()?.fetched}} | Missing: {{quoteMeta()?.missing?.length}}
        </div>
        <div class="small" *ngIf="quoteMeta()?.missing?.length">
          Missing symbols: {{quoteMeta()?.missing?.join(', ')}}
        </div>
      </div>

      <div *ngIf="quotes()?.length" style="margin-top: 10px;">
        <div class="row" style="font-weight:600;">
          <div style="flex:1;">Symbol</div>
          <div style="flex:1;">Price</div>
          <div style="flex:1;">Timestamp</div>
          <div style="flex:1;">Source</div>
          <div style="flex:1;">Cache</div>
        </div>
        <div *ngFor="let q of quotes()" class="row">
          <div style="flex:1;">{{q.symbol}}</div>
          <div style="flex:1;">{{q.price}}</div>
          <div style="flex:1;">{{q.timestamp}}</div>
          <div style="flex:1;">{{q.source}}</div>
          <div style="flex:1;">{{q.cacheHit ? 'HIT' : 'MISS'}}</div>
        </div>
      </div>

      <div style="height: 22px;"></div>

      <h3>Provider History</h3>
      <div class="row">
        <div style="flex:1;">
          <label>Symbol</label>
          <input [(ngModel)]="historySymbol" placeholder="AAPL" />
        </div>
        <div style="flex:1;">
          <label>Start (YYYY-MM-DD)</label>
          <input [(ngModel)]="historyStart" placeholder="2024-01-01" />
        </div>
        <div style="flex:1;">
          <label>End (YYYY-MM-DD)</label>
          <input [(ngModel)]="historyEnd" placeholder="2024-03-31" />
        </div>
        <div style="flex:1;">
          <label>Granularity</label>
          <select [(ngModel)]="historyGranularity" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="MINUTE">Minute</option>
            <option value="HOUR">Hour</option>
            <option value="DAY">Day</option>
          </select>
        </div>
        <div style="flex:1;">
          <label>Limit</label>
          <input [(ngModel)]="historyLimit" type="number" />
        </div>
      </div>
      <div style="height:12px;"></div>
      <button class="secondary" (click)="loadHistory()">Load History</button>
      <div style="height:8px;"></div>
      <div class="small">{{historyMsg()}}</div>

      <div *ngIf="history()" style="margin-top: 10px;">
        <div class="small">
          Points: {{history()?.points}} | Granularity: {{history()?.granularity}}
        </div>
        <pre>{{ history()?.prices | json }}</pre>
      </div>

      <div style="height: 22px;"></div>

      <h3>CSV Backfill</h3>
      <p class="small">Load CSV files into the database for downstream analytics and caching.</p>
      <div class="row">
        <div style="flex:2;">
          <label>Symbols (comma-separated)</label>
          <input [(ngModel)]="backfillSymbols" placeholder="AAPL,MSFT" />
        </div>
        <div style="flex:1;">
          <label>Start (YYYY-MM-DD)</label>
          <input [(ngModel)]="backfillStart" placeholder="2024-01-01" />
        </div>
        <div style="flex:1;">
          <label>End (YYYY-MM-DD)</label>
          <input [(ngModel)]="backfillEnd" placeholder="2024-12-31" />
        </div>
        <div style="flex:1;">
          <label>Granularity</label>
          <select [(ngModel)]="backfillGranularity" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="MINUTE">Minute</option>
            <option value="HOUR">Hour</option>
            <option value="DAY">Day</option>
          </select>
        </div>
        <div style="flex:1;">
          <label>Limit</label>
          <input [(ngModel)]="backfillLimit" type="number" />
        </div>
        <div style="flex:1;">
          <label>Source</label>
          <input [(ngModel)]="backfillSource" placeholder="csv" />
        </div>
        <div style="flex:1; align-self:flex-end;">
          <button class="secondary" (click)="runBackfill()">Run Backfill</button>
        </div>
      </div>
      <div style="height:8px;"></div>
      <div class="small">{{backfillMsg()}}</div>
      <pre *ngIf="backfillResult()">{{ backfillResult() | json }}</pre>

      <div style="height: 22px;"></div>

      <h3>Stored Data</h3>
      <div class="row">
        <div style="flex:1;">
          <label>Symbol</label>
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
        <div style="flex:1;">
          <label>Limit</label>
          <input [(ngModel)]="limit" type="number" />
        </div>
      </div>

      <div style="height:12px;"></div>
      <div class="row">
        <button class="secondary" (click)="loadSymbols()">Load Symbols</button>
        <button class="secondary" (click)="loadPrices()">Load Prices</button>
        <button class="secondary" (click)="loadReturns()">Load Returns</button>
      </div>

      <div *ngIf="symbols().length" style="margin-top: 12px;">
        <div><strong>Symbols</strong></div>
        <pre>{{ symbols() | json }}</pre>
      </div>

      <div *ngIf="prices()" style="margin-top: 12px;">
        <div><strong>Prices</strong></div>
        <pre>{{ prices() | json }}</pre>
      </div>

      <div *ngIf="returns()" style="margin-top: 12px;">
        <div><strong>Returns</strong></div>
        <pre>{{ returns() | json }}</pre>
      </div>
    </div>
  `
})
export class MarketDataComponent {
  source = 'manual';
  pricesText = '[{"symbol":"AAPL","timestamp":"2024-01-01","open":180,"high":182,"low":179,"close":181,"volume":1200000}]';

  quoteSymbols = 'AAPL,MSFT';
  quotes = signal<any[] | null>(null);
  quoteMeta = signal<any | null>(null);
  quoteMsg = signal('');

  historySymbol = 'AAPL';
  historyStart = '';
  historyEnd = '';
  historyGranularity = 'DAY';
  historyLimit = 0;
  history = signal<any | null>(null);
  historyMsg = signal('');

  backfillSymbols = 'AAPL,MSFT';
  backfillStart = '';
  backfillEnd = '';
  backfillGranularity = 'DAY';
  backfillLimit = 0;
  backfillSource = 'csv';
  backfillMsg = signal('');
  backfillResult = signal<any | null>(null);

  licenseProvider = 'starter_csv';
  licensePlan = 'internal';
  licenseStatus = 'ACTIVE';
  licenseAssetClasses = 'EQUITY';
  licenseExchanges = '';
  licenseRegions = 'US';
  licenseMsg = signal('');
  licenses = signal<any[] | null>(null);

  entitlementType = 'SYMBOL';
  entitlementValue = 'AAPL';
  entitlementStatus = 'ACTIVE';
  entitlementSource = 'starter_csv';
  entitlementMsg = signal('');
  entitlements = signal<any[] | null>(null);

  symbol = 'AAPL';
  start = '';
  end = '';
  limit = 0;

  msg = signal('');
  symbols = signal<string[]>([]);
  prices = signal<any[] | null>(null);
  returns = signal<number[] | null>(null);

  constructor(private http: HttpClient) {}

  ingest() {
    this.msg.set('Ingesting...');
    let prices: any[];
    try { prices = JSON.parse(this.pricesText); } catch { this.msg.set('Invalid JSON'); return; }

    this.http.post<any>(`${API_BASE}/api/v1/market-data/prices`, {
      source: this.source,
      prices
    }).subscribe({
      next: (r) => { this.msg.set(r?.message || 'Ingested.'); },
      error: (e) => this.msg.set(e?.error?.message || 'Ingest failed')
    });
  }

  loadQuotes() {
    if (!this.quoteSymbols.trim()) { this.quoteMsg.set('Symbols required'); return; }
    this.quoteMsg.set('Loading quotes...');
    this.quoteMeta.set(null);
    this.quotes.set(null);

    const params: any = { symbols: this.quoteSymbols.trim() };
    this.http.get<any>(`${API_BASE}/api/v1/market-data/quotes/latest`, { params }).subscribe({
      next: (r) => {
        this.quotes.set(r?.quotes || []);
        this.quoteMeta.set(r);
        this.quoteMsg.set('');
      },
      error: (e) => this.quoteMsg.set(e?.error?.message || 'Load failed')
    });
  }

  loadHistory() {
    if (!this.historySymbol.trim()) { this.historyMsg.set('Symbol required'); return; }
    this.historyMsg.set('Loading history...');
    this.history.set(null);

    const params: any = {
      symbol: this.historySymbol.trim(),
      granularity: this.historyGranularity
    };
    if (this.historyStart.trim()) params.start = this.historyStart.trim();
    if (this.historyEnd.trim()) params.end = this.historyEnd.trim();
    if (this.historyLimit && this.historyLimit > 0) params.limit = this.historyLimit;

    this.http.get<any>(`${API_BASE}/api/v1/market-data/history`, { params }).subscribe({
      next: (r) => { this.history.set(r); this.historyMsg.set(''); },
      error: (e) => this.historyMsg.set(e?.error?.message || 'Load failed')
    });
  }

  runBackfill() {
    const symbols = this.backfillSymbols.split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (!symbols.length) {
      this.backfillMsg.set('Symbols required');
      return;
    }
    this.backfillMsg.set('Running backfill...');
    this.backfillResult.set(null);
    const body: any = {
      symbols,
      granularity: this.backfillGranularity,
      limit: Number(this.backfillLimit),
      source: this.backfillSource,
    };
    if (this.backfillStart.trim()) body.start = this.backfillStart.trim();
    if (this.backfillEnd.trim()) body.end = this.backfillEnd.trim();
    this.http.post<any>(`${API_BASE}/api/v1/market-data/backfill`, body).subscribe({
      next: (r) => { this.backfillResult.set(r); this.backfillMsg.set('Backfill complete.'); },
      error: (e) => this.backfillMsg.set(e?.error?.message || 'Backfill failed')
    });
  }

  loadSymbols() {
    this.http.get<string[]>(`${API_BASE}/api/v1/market-data/symbols`).subscribe({
      next: (r) => this.symbols.set(r),
      error: () => {}
    });
  }

  loadPrices() {
    if (!this.symbol.trim()) { this.msg.set('Symbol required'); return; }
    const params: any = { symbol: this.symbol.trim() };
    if (this.start.trim()) params.start = this.start.trim();
    if (this.end.trim()) params.end = this.end.trim();
    if (this.limit && this.limit > 0) params.limit = this.limit;
    this.http.get<any[]>(`${API_BASE}/api/v1/market-data/prices`, { params }).subscribe({
      next: (r) => this.prices.set(r),
      error: (e) => this.msg.set(e?.error?.message || 'Load failed')
    });
  }

  loadReturns() {
    if (!this.symbol.trim()) { this.msg.set('Symbol required'); return; }
    const params: any = { symbol: this.symbol.trim() };
    if (this.start.trim()) params.start = this.start.trim();
    if (this.end.trim()) params.end = this.end.trim();
    if (this.limit && this.limit > 0) params.limit = this.limit;
    this.http.get<number[]>(`${API_BASE}/api/v1/market-data/returns`, { params }).subscribe({
      next: (r) => this.returns.set(r),
      error: (e) => this.msg.set(e?.error?.message || 'Load failed')
    });
  }

  loadLicenses() {
    this.licenseMsg.set('Loading licenses...');
    this.http.get<any[]>(`${API_BASE}/api/v1/market-data/licenses`).subscribe({
      next: (r) => { this.licenses.set(r); this.licenseMsg.set(''); },
      error: (e) => this.licenseMsg.set(e?.error?.message || 'Load failed')
    });
  }

  saveLicense() {
    if (!this.licenseProvider.trim()) {
      this.licenseMsg.set('Provider required');
      return;
    }
    const body = {
      provider: this.licenseProvider.trim(),
      plan: this.licensePlan.trim(),
      status: this.licenseStatus,
      assetClasses: this.parseList(this.licenseAssetClasses),
      exchanges: this.parseList(this.licenseExchanges),
      regions: this.parseList(this.licenseRegions),
    };
    this.licenseMsg.set('Saving license...');
    this.http.post<any>(`${API_BASE}/api/v1/market-data/licenses`, body).subscribe({
      next: () => { this.licenseMsg.set('Saved.'); this.loadLicenses(); },
      error: (e) => this.licenseMsg.set(e?.error?.message || 'Save failed')
    });
  }

  loadEntitlements() {
    this.entitlementMsg.set('Loading entitlements...');
    this.http.get<any[]>(`${API_BASE}/api/v1/market-data/entitlements`).subscribe({
      next: (r) => { this.entitlements.set(r); this.entitlementMsg.set(''); },
      error: (e) => this.entitlementMsg.set(e?.error?.message || 'Load failed')
    });
  }

  saveEntitlement() {
    if (!this.entitlementType.trim()) {
      this.entitlementMsg.set('Type required');
      return;
    }
    if (this.entitlementType !== 'GLOBAL' && !this.entitlementValue.trim()) {
      this.entitlementMsg.set('Value required');
      return;
    }
    const body: any = {
      entitlementType: this.entitlementType,
      status: this.entitlementStatus,
      source: this.entitlementSource.trim(),
    };
    if (this.entitlementType !== 'GLOBAL') {
      body.entitlementValue = this.entitlementValue.trim();
    }
    this.entitlementMsg.set('Saving entitlement...');
    this.http.post<any>(`${API_BASE}/api/v1/market-data/entitlements`, body).subscribe({
      next: () => { this.entitlementMsg.set('Saved.'); this.loadEntitlements(); },
      error: (e) => this.entitlementMsg.set(e?.error?.message || 'Save failed')
    });
  }

  private parseList(raw: string): string[] {
    return raw.split(',')
      .map((value) => value.trim())
      .filter((value) => value.length > 0);
  }
}
