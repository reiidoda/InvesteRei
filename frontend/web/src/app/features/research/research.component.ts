import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '../../core/api';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="card">
      <h2 style="margin-top:0;">Research</h2>
      <p class="small">Centralized research notes with AI summaries and scorecards.</p>

      <h3>Create Note</h3>
      <div class="row">
        <div style="flex:1;">
          <label>Source</label>
          <input [(ngModel)]="source" placeholder="internal" />
        </div>
        <div style="flex:2;">
          <label>Headline</label>
          <input [(ngModel)]="headline" placeholder="Earnings surprise lifts outlook" />
        </div>
        <div style="flex:1;">
          <label>Symbols</label>
          <input [(ngModel)]="symbols" placeholder="AAPL,MSFT" />
        </div>
      </div>
      <div style="height:8px;"></div>
      <label>Summary</label>
      <textarea [(ngModel)]="summary" rows="3" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;"></textarea>
      <div style="height:8px;"></div>
      <div class="row">
        <div style="flex:1;">
          <label>Sentiment Score</label>
          <input [(ngModel)]="sentimentScore" type="number" />
        </div>
        <div style="flex:1;">
          <label>Confidence</label>
          <input [(ngModel)]="confidence" type="number" />
        </div>
        <div style="flex:1;">
          <label>Published At (ISO)</label>
          <input [(ngModel)]="publishedAt" placeholder="2024-01-01T00:00:00Z" />
        </div>
        <div style="flex:1; align-self:flex-end;">
          <button (click)="create()">Add Note</button>
        </div>
      </div>
      <div style="height:8px;"></div>
      <div class="small">{{msg()}}</div>

      <div style="height:16px;"></div>
      <h3>AI Refresh</h3>
      <div class="row">
        <div style="flex:1;">
          <label>Lookback Days</label>
          <input [(ngModel)]="lookback" type="number" />
        </div>
        <div style="flex:1;">
          <label>Horizon</label>
          <input [(ngModel)]="horizon" type="number" />
        </div>
        <div style="flex:1; align-self:flex-end;">
          <button class="secondary" (click)="refreshAll()">Refresh All</button>
        </div>
      </div>

      <div style="height:16px;"></div>
      <h3>Notes</h3>
      <div class="row">
        <div style="flex:1;">
          <label>Source Filter</label>
          <input [(ngModel)]="sourceFilter" placeholder="internal" />
        </div>
        <div style="flex:1;">
          <label>Limit</label>
          <input [(ngModel)]="limit" type="number" />
        </div>
        <div style="flex:1; align-self:flex-end;">
          <button class="secondary" (click)="load()">Refresh List</button>
        </div>
      </div>

      <div *ngIf="notes().length" style="margin-top:12px;">
        <div class="row" style="font-weight:600;">
          <div style="flex:2;">Headline</div>
          <div style="flex:1;">Symbols</div>
          <div style="flex:1;">AI Score</div>
          <div style="flex:2;">AI Summary</div>
          <div style="flex:1; text-align:right;">Actions</div>
        </div>
        <div *ngFor="let n of notes()" class="row" style="border-bottom:1px solid #eee; padding:6px 0;">
          <div style="flex:2;">
            <div>{{n.headline || 'Untitled'}}</div>
            <div class="small">{{n.source}} • {{n.publishedAt || n.createdAt}}</div>
          </div>
          <div style="flex:1;" class="small">{{(n.symbols || []).join(', ')}}</div>
          <div style="flex:1;">{{n.aiScore ?? '-'}}</div>
          <div style="flex:2;" class="small">{{n.aiSummary || n.summary || '-'}}</div>
          <div style="flex:1; text-align:right;">
            <button class="secondary" (click)="refreshNote(n.id)">Refresh AI</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ResearchComponent {
  source = 'internal';
  headline = '';
  summary = '';
  symbols = 'AAPL';
  sentimentScore = 0.2;
  confidence = 0.6;
  publishedAt = '';

  lookback = 120;
  horizon = 1;
  sourceFilter = '';
  limit = 50;

  msg = signal('');
  notes = signal<any[]>([]);

  constructor(private http: HttpClient) {
    this.load();
  }

  create() {
    this.msg.set('Saving note...');
    const symbolList = this.symbols
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const body: any = {
      source: this.source,
      headline: this.headline,
      summary: this.summary,
      symbols: symbolList,
      sentimentScore: Number(this.sentimentScore),
      confidence: Number(this.confidence),
      publishedAt: this.publishedAt || null,
    };
    this.http.post(`${API_BASE}/api/v1/research/notes`, body).subscribe({
      next: () => { this.msg.set('Note saved.'); this.load(); },
      error: (e) => this.msg.set(e?.error?.message || 'Save failed')
    });
  }

  load() {
    const params: any = {};
    if (this.sourceFilter) params.source = this.sourceFilter;
    if (this.limit > 0) params.limit = this.limit;
    this.http.get<any[]>(`${API_BASE}/api/v1/research/notes`, { params }).subscribe({
      next: (r) => { this.notes.set(r || []); this.msg.set(''); },
      error: (e) => this.msg.set(e?.error?.message || 'Load failed')
    });
  }

  refreshNote(id: string) {
    this.msg.set('Refreshing AI...');
    const body = { lookback: Number(this.lookback), horizon: Number(this.horizon) };
    this.http.post(`${API_BASE}/api/v1/research/notes/${id}/ai`, body).subscribe({
      next: () => { this.msg.set('AI refreshed.'); this.load(); },
      error: (e) => this.msg.set(e?.error?.message || 'Refresh failed')
    });
  }

  refreshAll() {
    this.msg.set('Refreshing all notes...');
    const body = { lookback: Number(this.lookback), horizon: Number(this.horizon) };
    this.http.post<any[]>(`${API_BASE}/api/v1/research/notes/ai`, body).subscribe({
      next: (r) => { this.notes.set(r || []); this.msg.set('AI refreshed.'); },
      error: (e) => this.msg.set(e?.error?.message || 'Refresh failed')
    });
  }
}
