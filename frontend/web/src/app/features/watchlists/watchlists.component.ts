import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '../../core/api';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="card">
      <h2 style="margin-top:0;">Watchlists</h2>
      <p class="small">Track symbols across all asset classes and refresh AI risk insights.</p>

      <div class="row">
        <div style="flex:2;">
          <label>Name</label>
          <input [(ngModel)]="name" placeholder="Global Core" />
        </div>
        <div style="flex:3;">
          <label>Description</label>
          <input [(ngModel)]="description" placeholder="High-conviction, multi-asset watchlist" />
        </div>
        <div style="flex:1; align-self:flex-end;">
          <button (click)="create()">Create</button>
        </div>
      </div>
      <div style="height:8px;"></div>
      <div class="small">{{msg()}}</div>

      <div *ngIf="watchlists().length" style="margin-top:12px;">
        <div><strong>Watchlists</strong></div>
        <div *ngFor="let w of watchlists()" style="border:1px solid #eee; border-radius:12px; padding:12px; margin-top:8px;">
          <div class="row">
            <div style="flex:2;"><strong>{{w.name}}</strong></div>
            <div style="flex:3;" class="small">{{w.description}}</div>
            <div style="flex:1; text-align:right;">
              <button class="secondary" (click)="select(w.id)">Items</button>
              <button class="secondary" (click)="remove(w.id)">Delete</button>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="selectedId" style="margin-top:16px;">
        <h3>Items</h3>
        <div class="row">
          <div style="flex:2;">
            <label>Symbol</label>
            <input [(ngModel)]="itemSymbol" placeholder="AAPL" />
          </div>
          <div style="flex:1;">
            <label>Asset Class</label>
            <select [(ngModel)]="itemAssetClass" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
              <option value="EQUITY">Equity</option>
              <option value="ETF">ETF</option>
              <option value="FIXED_INCOME">Fixed Income</option>
              <option value="OPTIONS">Options</option>
              <option value="FUTURES">Futures</option>
              <option value="FX">FX</option>
              <option value="CRYPTO">Crypto</option>
              <option value="COMMODITIES">Commodities</option>
              <option value="MUTUAL_FUND">Mutual Fund</option>
            </select>
          </div>
          <div style="flex:2;">
            <label>Notes</label>
            <input [(ngModel)]="itemNotes" placeholder="Focus on earnings momentum" />
          </div>
          <div style="flex:1; align-self:flex-end;">
            <button (click)="addItem()">Add</button>
          </div>
        </div>
        <div style="height:10px;"></div>
        <div class="row">
          <button class="secondary" (click)="loadItems()">Refresh Items</button>
          <button class="secondary" (click)="refreshInsights()">Refresh AI Insights</button>
        </div>
        <div style="height:8px;"></div>
        <div class="small">{{itemsMsg()}}</div>

        <div *ngIf="items().length" style="margin-top:10px;">
          <div class="row" style="font-weight:600;">
            <div style="flex:1;">Symbol</div>
            <div style="flex:1;">Asset</div>
            <div style="flex:2;">AI Summary</div>
            <div style="flex:1; text-align:right;">Score</div>
          </div>
          <div *ngFor="let item of items()" class="row" style="border-bottom:1px solid #eee; padding:6px 0;">
            <div style="flex:1;">{{item.symbol}}</div>
            <div style="flex:1;">{{item.assetClass}}</div>
            <div style="flex:2;" class="small">{{item.aiSummary || item.notes}}</div>
            <div style="flex:1; text-align:right;">{{item.aiScore | number:'1.0-2'}}</div>
            <div style="flex:0;">
              <button class="secondary" (click)="removeItem(item.id)">Remove</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class WatchlistsComponent {
  name = 'Global Core';
  description = '';
  itemSymbol = 'AAPL';
  itemAssetClass = 'EQUITY';
  itemNotes = '';

  msg = signal('');
  itemsMsg = signal('');
  watchlists = signal<any[]>([]);
  items = signal<any[]>([]);
  selectedId = '';

  constructor(private http: HttpClient) {
    this.loadWatchlists();
  }

  loadWatchlists() {
    this.http.get<any[]>(`${API_BASE}/api/v1/watchlists`).subscribe({
      next: (r) => this.watchlists.set(r || []),
      error: (e) => this.msg.set(e?.error?.message || 'Load failed')
    });
  }

  create() {
    this.msg.set('Creating watchlist...');
    const body = { name: this.name, description: this.description };
    this.http.post(`${API_BASE}/api/v1/watchlists`, body).subscribe({
      next: () => { this.msg.set('Created.'); this.loadWatchlists(); },
      error: (e) => this.msg.set(e?.error?.message || 'Create failed')
    });
  }

  select(id: string) {
    this.selectedId = id;
    this.loadItems();
  }

  remove(id: string) {
    this.http.delete(`${API_BASE}/api/v1/watchlists/${id}`).subscribe({
      next: () => { this.msg.set('Deleted.'); this.loadWatchlists(); this.items.set([]); this.selectedId = ''; },
      error: (e) => this.msg.set(e?.error?.message || 'Delete failed')
    });
  }

  loadItems() {
    if (!this.selectedId) return;
    this.itemsMsg.set('Loading items...');
    this.http.get<any[]>(`${API_BASE}/api/v1/watchlists/${this.selectedId}/items`).subscribe({
      next: (r) => { this.items.set(r || []); this.itemsMsg.set(''); },
      error: (e) => this.itemsMsg.set(e?.error?.message || 'Load failed')
    });
  }

  addItem() {
    if (!this.selectedId) return;
    this.itemsMsg.set('Adding item...');
    const body = {
      symbol: this.itemSymbol,
      assetClass: this.itemAssetClass,
      notes: this.itemNotes,
    };
    this.http.post(`${API_BASE}/api/v1/watchlists/${this.selectedId}/items`, body).subscribe({
      next: () => { this.itemsMsg.set('Added.'); this.loadItems(); },
      error: (e) => this.itemsMsg.set(e?.error?.message || 'Add failed')
    });
  }

  removeItem(itemId: string) {
    if (!this.selectedId) return;
    this.http.delete(`${API_BASE}/api/v1/watchlists/${this.selectedId}/items/${itemId}`).subscribe({
      next: () => { this.itemsMsg.set('Removed.'); this.loadItems(); },
      error: (e) => this.itemsMsg.set(e?.error?.message || 'Remove failed')
    });
  }

  refreshInsights() {
    if (!this.selectedId) return;
    this.itemsMsg.set('Refreshing AI insights...');
    const body = { horizon: 1, lookback: 120 };
    this.http.post<any[]>(`${API_BASE}/api/v1/watchlists/${this.selectedId}/insights`, body).subscribe({
      next: (r) => { this.items.set(r || []); this.itemsMsg.set('AI insights refreshed.'); },
      error: (e) => this.itemsMsg.set(e?.error?.message || 'AI refresh failed')
    });
  }
}
