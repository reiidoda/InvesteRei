import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '../../core/api';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="card">
      <h2 style="margin-top:0;">Statements & Ledger</h2>
      <p class="small">Ledger ingestion, statement summaries, tax lots, and corporate actions.</p>

      <h3>Ledger Entry</h3>
      <div class="row">
        <div style="flex:1;">
          <label>Account ID</label>
          <input [(ngModel)]="accountId" placeholder="acct-001" />
        </div>
        <div style="flex:1;">
          <label>Type</label>
          <select [(ngModel)]="entryType" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="DEPOSIT">Deposit</option>
            <option value="WITHDRAWAL">Withdrawal</option>
            <option value="BUY">Buy</option>
            <option value="SELL">Sell</option>
            <option value="DIVIDEND">Dividend</option>
            <option value="FEE">Fee</option>
            <option value="INTEREST">Interest</option>
            <option value="TRANSFER">Transfer</option>
            <option value="FX">FX</option>
            <option value="ADJUSTMENT">Adjustment</option>
          </select>
        </div>
        <div style="flex:1;">
          <label>Symbol</label>
          <input [(ngModel)]="symbol" placeholder="AAPL" />
        </div>
        <div style="flex:1;">
          <label>Quantity</label>
          <input [(ngModel)]="quantity" type="number" />
        </div>
        <div style="flex:1;">
          <label>Price</label>
          <input [(ngModel)]="price" type="number" />
        </div>
        <div style="flex:1;">
          <label>Amount</label>
          <input [(ngModel)]="amount" type="number" />
        </div>
        <div style="flex:1;">
          <label>Currency</label>
          <input [(ngModel)]="currency" placeholder="USD" />
        </div>
      </div>
      <div style="height:8px;"></div>
      <div class="row">
        <button (click)="addLedgerEntry()">Add Entry</button>
        <button class="secondary" (click)="loadLedger()">Refresh Ledger</button>
      </div>
      <div style="height:8px;"></div>
      <div class="small">{{ledgerMsg()}}</div>

      <div *ngIf="ledger().length" style="margin-top:10px;">
        <div class="row" style="font-weight:600;">
          <div style="flex:1;">Type</div>
          <div style="flex:1;">Symbol</div>
          <div style="flex:1;">Amount</div>
          <div style="flex:1;">Currency</div>
          <div style="flex:2;">Trade Date</div>
        </div>
        <div *ngFor="let e of ledger()" class="row" style="border-bottom:1px solid #eee; padding:6px 0;">
          <div style="flex:1;">{{e.entryType}}</div>
          <div style="flex:1;">{{e.symbol || '-'}}</div>
          <div style="flex:1;">{{e.amount}}</div>
          <div style="flex:1;">{{e.currency}}</div>
          <div style="flex:2;" class="small">{{e.tradeDate}}</div>
        </div>
      </div>

      <div style="height:18px;"></div>
      <h3>Statement Summary</h3>
      <div class="row">
        <div style="flex:1;">
          <label>Period Start (ISO)</label>
          <input [(ngModel)]="periodStart" placeholder="2024-01-01T00:00:00Z" />
        </div>
        <div style="flex:1;">
          <label>Period End (ISO)</label>
          <input [(ngModel)]="periodEnd" placeholder="2024-12-31T23:59:59Z" />
        </div>
        <div style="flex:1;">
          <label>Starting Balance</label>
          <input [(ngModel)]="startingBalance" type="number" />
        </div>
        <div style="flex:1;">
          <label>Base Currency</label>
          <input [(ngModel)]="baseCurrency" placeholder="USD" />
        </div>
      </div>
      <div style="height:8px;"></div>
      <div class="row">
        <button class="secondary" (click)="loadSummary()">Load Summary</button>
        <button (click)="generateStatement()">Generate Statement</button>
      </div>
      <div style="height:8px;"></div>
      <div class="small">{{statementMsg()}}</div>
      <pre *ngIf="summary()">{{ summary() | json }}</pre>
      <pre *ngIf="statement()">{{ statement() | json }}</pre>

      <div style="height:18px;"></div>
      <h3>Tax Lots</h3>
      <div class="row">
        <div style="flex:1;">
          <label>Symbol</label>
          <input [(ngModel)]="taxSymbol" placeholder="AAPL" />
        </div>
        <div style="flex:1;">
          <label>Quantity</label>
          <input [(ngModel)]="taxQty" type="number" />
        </div>
        <div style="flex:1;">
          <label>Cost Basis</label>
          <input [(ngModel)]="taxBasis" type="number" />
        </div>
        <div style="flex:1;">
          <label>Status</label>
          <select [(ngModel)]="taxStatus" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="OPEN">Open</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>
      <div style="height:8px;"></div>
      <div class="row">
        <button (click)="addTaxLot()">Add/Update Lot</button>
        <button class="secondary" (click)="loadTaxLots()">Refresh Lots</button>
      </div>
      <div style="height:8px;"></div>
      <div class="small">{{taxMsg()}}</div>
      <pre *ngIf="taxLots().length">{{ taxLots() | json }}</pre>

      <div style="height:18px;"></div>
      <h3>Corporate Actions</h3>
      <div class="row">
        <div style="flex:1;">
          <label>Action</label>
          <select [(ngModel)]="actionType" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="SPLIT">Split</option>
            <option value="MERGER">Merger</option>
            <option value="DIVIDEND">Dividend</option>
            <option value="SPINOFF">Spinoff</option>
            <option value="SYMBOL_CHANGE">Symbol Change</option>
          </select>
        </div>
        <div style="flex:1;">
          <label>Symbol</label>
          <input [(ngModel)]="actionSymbol" placeholder="AAPL" />
        </div>
        <div style="flex:1;">
          <label>Ratio</label>
          <input [(ngModel)]="actionRatio" type="number" />
        </div>
        <div style="flex:1;">
          <label>Cash Amount</label>
          <input [(ngModel)]="actionCash" type="number" />
        </div>
        <div style="flex:1;">
          <label>Effective Date (YYYY-MM-DD)</label>
          <input [(ngModel)]="actionDate" placeholder="2024-05-01" />
        </div>
      </div>
      <div style="height:8px;"></div>
      <div class="row">
        <button (click)="addCorporateAction()">Add Action</button>
        <button class="secondary" (click)="loadCorporateActions()">Refresh Actions</button>
      </div>
      <div style="height:8px;"></div>
      <div class="small">{{actionMsg()}}</div>
      <pre *ngIf="actions().length">{{ actions() | json }}</pre>

      <div style="height:18px;"></div>
      <h3>Statement Import</h3>
      <p class="small">Paste a broker CSV export to ingest ledger entries.</p>
      <div class="row">
        <div style="flex:1;">
          <label>Source</label>
          <input [(ngModel)]="importSource" placeholder="broker_csv" />
        </div>
        <div style="flex:1;">
          <label>Delimiter</label>
          <input [(ngModel)]="importDelimiter" placeholder="," />
        </div>
        <div style="flex:1;">
          <label>Default Currency</label>
          <input [(ngModel)]="importCurrency" placeholder="USD" />
        </div>
        <div style="flex:1;">
          <label>Has Header</label>
          <select [(ngModel)]="importHasHeader" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option [ngValue]="true">Yes</option>
            <option [ngValue]="false">No</option>
          </select>
        </div>
      </div>
      <div style="height:8px;"></div>
      <label>CSV Text</label>
      <textarea [(ngModel)]="importCsv" rows="6" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;"></textarea>
      <div style="height:8px;"></div>
      <div class="row">
        <div style="flex:1;">
          <label>Apply Positions</label>
          <select [(ngModel)]="importApplyPositions" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option [ngValue]="false">No</option>
            <option [ngValue]="true">Yes</option>
          </select>
        </div>
        <div style="flex:1;">
          <label>Rebuild Tax Lots</label>
          <select [(ngModel)]="importRebuildTaxLots" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option [ngValue]="false">No</option>
            <option [ngValue]="true">Yes</option>
          </select>
        </div>
        <div style="flex:1;">
          <label>Lot Method</label>
          <select [(ngModel)]="importLotMethod" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="FIFO">FIFO</option>
          </select>
        </div>
        <div style="flex:1; align-self:flex-end;">
          <button class="secondary" (click)="runImport()">Import CSV</button>
        </div>
      </div>
      <div style="height:8px;"></div>
      <div class="small">{{importMsg()}}</div>
      <pre *ngIf="importResult()">{{ importResult() | json }}</pre>

      <div style="height:18px;"></div>
      <h3>Reconciliation</h3>
      <p class="small">Match ledger activity to stored positions and (optionally) rebuild tax lots.</p>
      <div class="row">
        <div style="flex:1;">
          <label>Apply Positions</label>
          <select [(ngModel)]="reconcileApplyPositions" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option [ngValue]="false">No</option>
            <option [ngValue]="true">Yes</option>
          </select>
        </div>
        <div style="flex:1;">
          <label>Rebuild Tax Lots</label>
          <select [(ngModel)]="reconcileRebuildTaxLots" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option [ngValue]="false">No</option>
            <option [ngValue]="true">Yes</option>
          </select>
        </div>
        <div style="flex:1;">
          <label>Lot Method</label>
          <select [(ngModel)]="reconcileLotMethod" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="FIFO">FIFO</option>
          </select>
        </div>
        <div style="flex:1; align-self:flex-end;">
          <button class="secondary" (click)="runReconcile()">Run Reconcile</button>
        </div>
      </div>
      <div style="height:8px;"></div>
      <div class="small">{{reconcileMsg()}}</div>
      <pre *ngIf="reconcileResult()">{{ reconcileResult() | json }}</pre>
    </div>
  `
})
export class StatementsComponent {
  accountId = 'acct-001';
  entryType = 'DEPOSIT';
  symbol = 'AAPL';
  quantity = 10;
  price = 180;
  amount = 0;
  currency = 'USD';

  periodStart = '';
  periodEnd = '';
  startingBalance = 0;
  baseCurrency = 'USD';

  taxSymbol = 'AAPL';
  taxQty = 10;
  taxBasis = 1800;
  taxStatus = 'OPEN';

  actionType = 'SPLIT';
  actionSymbol = 'AAPL';
  actionRatio = 2;
  actionCash = 0;
  actionDate = '';

  ledgerMsg = signal('');
  statementMsg = signal('');
  taxMsg = signal('');
  actionMsg = signal('');
  importMsg = signal('');
  reconcileMsg = signal('');
  ledger = signal<any[]>([]);
  summary = signal<any | null>(null);
  statement = signal<any | null>(null);
  taxLots = signal<any[]>([]);
  actions = signal<any[]>([]);
  importResult = signal<any | null>(null);
  reconcileResult = signal<any | null>(null);

  reconcileApplyPositions = false;
  reconcileRebuildTaxLots = false;
  reconcileLotMethod = 'FIFO';

  importSource = 'broker_csv';
  importDelimiter = ',';
  importCurrency = 'USD';
  importHasHeader = true;
  importCsv = 'date,action,symbol,quantity,price,amount,currency\\n2024-01-05,BUY,AAPL,10,185.80,1858.00,USD';
  importApplyPositions = false;
  importRebuildTaxLots = false;
  importLotMethod = 'FIFO';

  constructor(private http: HttpClient) {}

  addLedgerEntry() {
    this.ledgerMsg.set('Adding entry...');
    const body = [{
      accountId: this.accountId,
      entryType: this.entryType,
      symbol: this.symbol,
      quantity: Number(this.quantity),
      price: Number(this.price),
      amount: Number(this.amount),
      currency: this.currency,
    }];
    this.http.post<any[]>(`${API_BASE}/api/v1/statements/ledger`, body).subscribe({
      next: () => { this.ledgerMsg.set('Entry added.'); this.loadLedger(); },
      error: (e) => this.ledgerMsg.set(e?.error?.message || 'Add failed')
    });
  }

  loadLedger() {
    this.ledgerMsg.set('Loading ledger...');
    this.http.get<any[]>(`${API_BASE}/api/v1/statements/ledger`, { params: { accountId: this.accountId } }).subscribe({
      next: (r) => { this.ledger.set(r || []); this.ledgerMsg.set(''); },
      error: (e) => this.ledgerMsg.set(e?.error?.message || 'Load failed')
    });
  }

  loadSummary() {
    this.statementMsg.set('Loading summary...');
    const params: any = { accountId: this.accountId };
    if (this.periodStart) params.start = this.periodStart;
    if (this.periodEnd) params.end = this.periodEnd;
    this.http.get<any>(`${API_BASE}/api/v1/statements/summary`, { params }).subscribe({
      next: (r) => { this.summary.set(r); this.statementMsg.set(''); },
      error: (e) => this.statementMsg.set(e?.error?.message || 'Summary failed')
    });
  }

  generateStatement() {
    this.statementMsg.set('Generating statement...');
    const body: any = {
      accountId: this.accountId,
      periodStart: this.periodStart || null,
      periodEnd: this.periodEnd || null,
      baseCurrency: this.baseCurrency,
      startingBalance: Number(this.startingBalance),
    };
    this.http.post<any>(`${API_BASE}/api/v1/statements`, body).subscribe({
      next: (r) => { this.statement.set(r); this.statementMsg.set('Statement created.'); },
      error: (e) => this.statementMsg.set(e?.error?.message || 'Statement failed')
    });
  }

  addTaxLot() {
    this.taxMsg.set('Saving tax lot...');
    const body: any = {
      accountId: this.accountId,
      symbol: this.taxSymbol,
      quantity: Number(this.taxQty),
      costBasis: Number(this.taxBasis),
      status: this.taxStatus,
    };
    this.http.post<any>(`${API_BASE}/api/v1/statements/tax-lots`, body).subscribe({
      next: () => { this.taxMsg.set('Saved.'); this.loadTaxLots(); },
      error: (e) => this.taxMsg.set(e?.error?.message || 'Tax lot failed')
    });
  }

  loadTaxLots() {
    this.taxMsg.set('Loading tax lots...');
    this.http.get<any[]>(`${API_BASE}/api/v1/statements/tax-lots`, { params: { accountId: this.accountId } }).subscribe({
      next: (r) => { this.taxLots.set(r || []); this.taxMsg.set(''); },
      error: (e) => this.taxMsg.set(e?.error?.message || 'Load failed')
    });
  }

  addCorporateAction() {
    this.actionMsg.set('Adding corporate action...');
    const body: any = {
      accountId: this.accountId,
      actionType: this.actionType,
      symbol: this.actionSymbol,
      ratio: Number(this.actionRatio),
      cashAmount: Number(this.actionCash),
      effectiveDate: this.actionDate || null,
    };
    this.http.post<any>(`${API_BASE}/api/v1/statements/corporate-actions`, body).subscribe({
      next: () => { this.actionMsg.set('Added.'); this.loadCorporateActions(); },
      error: (e) => this.actionMsg.set(e?.error?.message || 'Add failed')
    });
  }

  loadCorporateActions() {
    this.actionMsg.set('Loading actions...');
    this.http.get<any[]>(`${API_BASE}/api/v1/statements/corporate-actions`, { params: { symbol: this.actionSymbol } }).subscribe({
      next: (r) => { this.actions.set(r || []); this.actionMsg.set(''); },
      error: (e) => this.actionMsg.set(e?.error?.message || 'Load failed')
    });
  }

  runImport() {
    this.importMsg.set('Importing...');
    this.importResult.set(null);
    const body: any = {
      accountId: this.accountId,
      source: this.importSource,
      csv: this.importCsv,
      delimiter: this.importDelimiter,
      hasHeader: this.importHasHeader,
      defaultCurrency: this.importCurrency,
      applyPositions: this.importApplyPositions,
      rebuildTaxLots: this.importRebuildTaxLots,
      lotMethod: this.importLotMethod,
    };
    this.http.post<any>(`${API_BASE}/api/v1/statements/import`, body).subscribe({
      next: (r) => { this.importResult.set(r); this.importMsg.set('Import complete.'); },
      error: (e) => this.importMsg.set(e?.error?.message || 'Import failed')
    });
  }

  runReconcile() {
    this.reconcileMsg.set('Running reconciliation...');
    this.reconcileResult.set(null);
    const body: any = {
      accountId: this.accountId,
      applyPositions: this.reconcileApplyPositions,
      rebuildTaxLots: this.reconcileRebuildTaxLots,
      lotMethod: this.reconcileLotMethod,
    };
    this.http.post<any>(`${API_BASE}/api/v1/statements/reconcile`, body).subscribe({
      next: (r) => { this.reconcileResult.set(r); this.reconcileMsg.set('Done.'); },
      error: (e) => this.reconcileMsg.set(e?.error?.message || 'Reconcile failed')
    });
  }
}
