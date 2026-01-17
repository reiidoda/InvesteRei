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

      <h3>Auto-Invest Orchestrator</h3>
      <p class="small">
        Create schedules, compute target weights from market data, and generate proposals when drift triggers.
      </p>
      <div class="row">
        <div style="flex:2;">
          <label>Plan Name</label>
          <input [(ngModel)]="planName" placeholder="Core Growth Plan" />
        </div>
        <div style="flex:1;">
          <label>Schedule</label>
          <select [(ngModel)]="planSchedule" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="DRIFT">Drift Trigger</option>
          </select>
        </div>
        <div style="flex:1;">
          <label>Schedule Time (UTC)</label>
          <input [(ngModel)]="planScheduleTime" placeholder="09:30" />
        </div>
        <div style="flex:1;">
          <label>Day of Week</label>
          <select [(ngModel)]="planScheduleDay" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="MONDAY">Mon</option>
            <option value="TUESDAY">Tue</option>
            <option value="WEDNESDAY">Wed</option>
            <option value="THURSDAY">Thu</option>
            <option value="FRIDAY">Fri</option>
          </select>
        </div>
      </div>
      <div style="height:10px;"></div>
      <div class="row">
        <div style="flex:2;">
          <label>Symbols (comma-separated)</label>
          <input [(ngModel)]="planSymbolsText" placeholder="AAPL,MSFT,TLT" />
        </div>
        <div style="flex:1;">
          <label>Drift Threshold</label>
          <input [(ngModel)]="planDriftThreshold" type="number" step="0.01" />
        </div>
        <div style="flex:1;">
          <label>Returns Lookback</label>
          <input [(ngModel)]="planLookback" type="number" />
        </div>
        <div style="flex:1;">
          <label>Use Market Data</label>
          <select [(ngModel)]="planUseMarketData" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option [ngValue]="true">Yes</option>
            <option [ngValue]="false">No</option>
          </select>
        </div>
        <div style="flex:1;">
          <label>Use AI Forecast</label>
          <select [(ngModel)]="planUseAiForecast" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option [ngValue]="false">No</option>
            <option [ngValue]="true">Yes</option>
          </select>
        </div>
      </div>
      <div style="height:10px;"></div>
      <div class="row">
        <div style="flex:1;">
          <label>Risk Aversion</label>
          <input [(ngModel)]="planRiskAversion" type="number" />
        </div>
        <div style="flex:1;">
          <label>Min Weight</label>
          <input [(ngModel)]="planMinWeight" type="number" step="0.01" />
        </div>
        <div style="flex:1;">
          <label>Max Weight</label>
          <input [(ngModel)]="planMaxWeight" type="number" step="0.01" />
        </div>
        <div style="flex:1;">
          <label>Max Turnover</label>
          <input [(ngModel)]="planMaxTurnover" type="number" step="0.01" />
        </div>
        <div style="flex:1;">
          <label>Min Trade Value</label>
          <input [(ngModel)]="planMinTradeValue" type="number" step="1" />
        </div>
      </div>
      <div style="height:10px;"></div>
      <div class="row">
        <div style="flex:1;">
          <label>Execution Mode</label>
          <select [(ngModel)]="planExecutionMode" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="PAPER">Paper</option>
            <option value="LIVE">Live</option>
          </select>
        </div>
        <div style="flex:1;">
          <label>Region</label>
          <select [(ngModel)]="planRegion" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
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
          <select [(ngModel)]="planAssetClass" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="EQUITY">Equity</option>
            <option value="ETF">ETF</option>
            <option value="FIXED_INCOME">Fixed Income</option>
            <option value="FX">FX</option>
            <option value="CRYPTO">Crypto</option>
          </select>
        </div>
        <div style="flex:1;">
          <label>Order Type</label>
          <select [(ngModel)]="planOrderType" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="MARKET">Market</option>
            <option value="LIMIT">Limit</option>
          </select>
        </div>
        <div style="flex:1;">
          <label>Time In Force</label>
          <select [(ngModel)]="planTimeInForce" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="DAY">Day</option>
            <option value="GTC">GTC</option>
          </select>
        </div>
      </div>
      <div style="height:10px;"></div>
      <div class="row">
        <button (click)="createPlan()">Create Plan</button>
        <button class="secondary" (click)="loadPlans()">Refresh Plans</button>
      </div>
      <div style="height:8px;"></div>
      <div class="small">{{autoInvestMsg()}}</div>

      <div *ngIf="plans().length" style="margin-top: 10px;">
        <div><strong>Plans</strong></div>
        <div *ngFor="let p of plans()" style="border:1px solid #eee; border-radius:12px; padding:12px; margin-top:8px;">
          <div class="row">
            <div style="flex:2;"><strong>{{p.name}}</strong> <span class="small">({{p.status}})</span></div>
            <div style="flex:1;">{{p.schedule}} @ {{p.scheduleTimeUtc || 'anytime'}}</div>
            <div style="flex:1;">Drift: {{p.driftThreshold}}</div>
          </div>
          <div class="small">Symbols: {{p.symbols?.join(', ')}}</div>
          <div class="small">Last Run: {{p.lastRunAt || 'never'}}</div>
          <div class="row" style="margin-top:6px;">
            <button class="secondary" (click)="selectPlan(p.id)">Runs</button>
            <button class="secondary" (click)="runPlan(p.id)">Run Now</button>
            <button class="secondary" *ngIf="p.status === 'ACTIVE'" (click)="setPlanStatus(p.id, 'PAUSED')">Pause</button>
            <button class="secondary" *ngIf="p.status === 'PAUSED'" (click)="setPlanStatus(p.id, 'ACTIVE')">Resume</button>
          </div>
        </div>
      </div>

      <div *ngIf="selectedPlanId" style="margin-top: 12px;">
        <div><strong>Runs ({{selectedPlanId}})</strong></div>
        <div class="row" style="margin-top:6px;">
          <button class="secondary" (click)="loadRuns(selectedPlanId)">Refresh Runs</button>
        </div>
        <pre *ngIf="autoRuns().length" style="margin-top:8px;">{{ autoRuns() | json }}</pre>
      </div>

      <div style="height: 18px;"></div>

      <h3>Notifications</h3>
      <div class="row">
        <button class="secondary" (click)="loadNotifications()">Refresh</button>
      </div>
      <div style="height:6px;"></div>
      <div *ngIf="notifications().length">
        <div *ngFor="let n of notifications()" class="row" style="border-bottom:1px solid #eee; padding:6px 0;">
          <div style="flex:3;">
            <div><strong>{{n.title}}</strong> <span class="small">({{n.status}})</span></div>
            <div class="small">{{n.body}}</div>
          </div>
          <div style="flex:1; text-align:right;">
            <button class="secondary" (click)="markNotificationRead(n.id)" [disabled]="n.status === 'READ'">Mark Read</button>
          </div>
        </div>
      </div>

      <div style="height: 18px;"></div>

      <h3>Notification Settings</h3>
      <p class="small">Manage delivery preferences, destinations, and delivery history.</p>

      <h4>Preferences</h4>
      <div class="row">
        <div style="flex:1;">
          <label>Channel</label>
          <select [(ngModel)]="prefChannel" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="IN_APP">In-App</option>
            <option value="EMAIL">Email</option>
            <option value="PUSH">Push</option>
            <option value="SMS">SMS</option>
            <option value="WEBHOOK">Webhook</option>
          </select>
        </div>
        <div style="flex:1;">
          <label>Enabled</label>
          <select [(ngModel)]="prefEnabled" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option [ngValue]="true">Enabled</option>
            <option [ngValue]="false">Disabled</option>
          </select>
        </div>
        <div style="flex:2;">
          <label>Types (comma)</label>
          <input [(ngModel)]="prefTypesText" placeholder="AUTO_INVEST_PROPOSAL,ALERT_TRIGGERED" />
        </div>
        <div style="flex:1;">
          <label>Quiet Start</label>
          <input [(ngModel)]="prefQuietStart" type="number" placeholder="22" />
        </div>
        <div style="flex:1;">
          <label>Quiet End</label>
          <input [(ngModel)]="prefQuietEnd" type="number" placeholder="7" />
        </div>
        <div style="flex:1;">
          <label>Timezone</label>
          <input [(ngModel)]="prefTimezone" placeholder="UTC" />
        </div>
        <div style="flex:1; align-self:flex-end;">
          <button class="secondary" (click)="savePreference()">Save Preference</button>
        </div>
        <div style="flex:1; align-self:flex-end;">
          <button class="secondary" (click)="loadPreferences()">Refresh</button>
        </div>
      </div>
      <div style="height:6px;"></div>
      <div class="small">{{prefMsg()}}</div>
      <pre *ngIf="preferences().length">{{ preferences() | json }}</pre>

      <div style="height: 12px;"></div>
      <h4>Destinations</h4>
      <div class="row">
        <div style="flex:1;">
          <label>Channel</label>
          <select [(ngModel)]="destChannel" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="EMAIL">Email</option>
            <option value="PUSH">Push</option>
            <option value="SMS">SMS</option>
            <option value="WEBHOOK">Webhook</option>
          </select>
        </div>
        <div style="flex:2;">
          <label>Destination</label>
          <input [(ngModel)]="destValue" placeholder="alerts@example.com" />
        </div>
        <div style="flex:1;">
          <label>Label</label>
          <input [(ngModel)]="destLabel" placeholder="Primary" />
        </div>
        <div style="flex:1; align-self:flex-end;">
          <button class="secondary" (click)="createDestination()">Add Destination</button>
        </div>
        <div style="flex:1; align-self:flex-end;">
          <button class="secondary" (click)="loadDestinations()">Refresh</button>
        </div>
      </div>
      <div style="height:6px;"></div>
      <div class="small">{{destMsg()}}</div>
      <div *ngIf="destinations().length" style="margin-top:6px;">
        <div *ngFor="let d of destinations()" class="row" style="border-bottom:1px solid #eee; padding:6px 0;">
          <div style="flex:3;">
            <div><strong>{{d.channel}}</strong> <span class="small">({{d.status}})</span></div>
            <div class="small">{{d.destination}} {{d.label ? '(' + d.label + ')' : ''}}</div>
          </div>
          <div style="flex:1; text-align:right;">
            <button class="secondary" (click)="verifyDestination(d.id)">Verify</button>
            <button class="secondary" (click)="disableDestination(d.id)">Disable</button>
          </div>
        </div>
      </div>

      <div style="height: 12px;"></div>
      <h4>Delivery History</h4>
      <div class="row">
        <div style="flex:1;">
          <label>Status Filter</label>
          <input [(ngModel)]="deliveryStatus" placeholder="SENT" />
        </div>
        <div style="flex:1; align-self:flex-end;">
          <button class="secondary" (click)="loadDeliveries()">Refresh</button>
        </div>
      </div>
      <div style="height:6px;"></div>
      <div class="small">{{deliveryMsg()}}</div>
      <pre *ngIf="deliveries().length">{{ deliveries() | json }}</pre>

      <div style="height: 18px;"></div>

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

      <h3>Withdrawals (Scaffold)</h3>
      <div class="row">
        <div style="flex:1;">
          <label>Withdraw Source</label>
          <select [(ngModel)]="withdrawSourceId" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option *ngFor="let s of sources()" [value]="s.id">{{s.label}} ({{s.status}})</option>
          </select>
        </div>
        <div style="flex:1;">
          <label>Withdraw Amount</label>
          <input [(ngModel)]="withdrawAmount" type="number" step="10" />
        </div>
        <div style="flex:1; align-self:flex-end;">
          <button (click)="withdraw()">Withdraw</button>
        </div>
      </div>
      <div style="height: 8px;"></div>
      <div class="small">{{withdrawMsg()}}</div>
      <div *ngIf="withdrawals().length" style="margin-top: 8px;">
        <div><strong>Withdrawals</strong></div>
        <pre>{{ withdrawals() | json }}</pre>
        <button class="secondary" (click)="refreshWithdrawals()">Refresh</button>
      </div>

      <div style="height: 18px;"></div>

      <h3>Broker Transfers (Scaffold)</h3>
      <div class="row">
        <div style="flex:1;">
          <label>Transfer Source</label>
          <select [(ngModel)]="transferSourceId" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option *ngFor="let s of sources()" [value]="s.id">{{s.label}} ({{s.status}})</option>
          </select>
        </div>
        <div style="flex:1;">
          <label>Broker Account</label>
          <select [(ngModel)]="transferBrokerAccountId" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option *ngFor="let a of brokerAccounts()" [value]="a.id">{{a.providerName}} ({{a.region}})</option>
          </select>
        </div>
        <div style="flex:1;">
          <label>Direction</label>
          <select [(ngModel)]="transferDirection" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;">
            <option value="TO_BROKER">To Broker</option>
            <option value="FROM_BROKER">From Broker</option>
          </select>
        </div>
      </div>
      <div class="row" style="margin-top:8px;">
        <div style="flex:1;">
          <label>Amount</label>
          <input [(ngModel)]="transferAmount" type="number" step="10" />
        </div>
        <div style="flex:1;">
          <label>Currency</label>
          <input [(ngModel)]="transferCurrency" placeholder="USD" />
        </div>
        <div style="flex:1; align-self:flex-end;">
          <button (click)="transfer()">Transfer</button>
        </div>
      </div>
      <div style="height: 8px;"></div>
      <div class="small">{{transferMsg()}}</div>
      <div *ngIf="transfers().length" style="margin-top: 8px;">
        <div><strong>Transfers</strong></div>
        <pre>{{ transfers() | json }}</pre>
        <button class="secondary" (click)="refreshTransfers()">Refresh</button>
      </div>

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
          <label>returns (JSON array, optional for AI)</label>
          <textarea [(ngModel)]="returnsText" rows="3" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:10px;"></textarea>
        </div>
        <div style="flex:1;">
          <label>AI Horizon</label>
          <input [(ngModel)]="aiHorizon" type="number" min="1" max="30" />
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
        <div *ngIf="proposal()?.ai?.expectedReturn !== undefined" style="margin-top: 8px;">
          <div class="row">
            <div style="flex:1;">
              <div><strong>AI Expected Return</strong></div>
              <div>{{proposal()?.ai?.expectedReturn}}</div>
            </div>
            <div style="flex:1;">
              <div><strong>AI Volatility</strong></div>
              <div>{{proposal()?.ai?.volatility}}</div>
            </div>
            <div style="flex:1;">
              <div><strong>AI P(up)</strong></div>
              <div>{{proposal()?.ai?.pUp}}</div>
            </div>
            <div style="flex:1;">
              <div><strong>AI Horizon</strong></div>
              <div>{{proposal()?.ai?.horizon}}</div>
            </div>
          </div>
          <div class="small" *ngIf="proposal()?.ai?.disclaimer">{{proposal()?.ai?.disclaimer}}</div>
        </div>
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

      <div style="height: 18px;"></div>
      <h3>Audit Log</h3>
      <p class="small">Immutable events for approvals, executions, funding, and compliance.</p>
      <div class="row">
        <button class="secondary" (click)="loadAudit()">Refresh Audit</button>
      </div>
      <div style="height: 8px;"></div>
      <div class="small">{{auditMsg()}}</div>
      <pre *ngIf="auditEvents().length">{{ auditEvents() | json }}</pre>
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
  returnsText = '';
  aiHorizon = 1;

  planName = 'Core Growth Plan';
  planSymbolsText = 'AAPL,MSFT,TLT';
  planSchedule = 'DAILY';
  planScheduleTime = '09:30';
  planScheduleDay = 'MONDAY';
  planDriftThreshold = 0.05;
  planLookback = 90;
  planUseMarketData = true;
  planUseAiForecast = false;
  planRiskAversion = 6;
  planMinWeight = 0.0;
  planMaxWeight = 0.6;
  planMaxTurnover = 0.7;
  planMinTradeValue = 10;
  planExecutionMode = 'PAPER';
  planRegion = 'US';
  planAssetClass = 'EQUITY';
  planOrderType = 'MARKET';
  planTimeInForce = 'DAY';
  selectedPlanId = '';

  prefChannel = 'EMAIL';
  prefEnabled = true;
  prefTypesText = 'AUTO_INVEST_PROPOSAL,ALERT_TRIGGERED';
  prefQuietStart: number | null = null;
  prefQuietEnd: number | null = null;
  prefTimezone = 'UTC';

  destChannel = 'EMAIL';
  destValue = '';
  destLabel = '';

  deliveryStatus = '';

  fundingMethod = 'CARD';
  providerId = 'stripe';
  fundingLabel = 'Main Funding';
  fundingLast4 = '1234';
  fundingCurrency = 'USD';
  fundingNetwork = 'ETH';
  depositSourceId = '';
  depositAmount = 1000;
  withdrawSourceId = '';
  withdrawAmount = 500;
  transferSourceId = '';
  transferBrokerAccountId = '';
  transferDirection = 'TO_BROKER';
  transferAmount = 1000;
  transferCurrency = 'USD';

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
  plans = signal<any[]>([]);
  autoRuns = signal<any[]>([]);
  notifications = signal<any[]>([]);
  preferences = signal<any[]>([]);
  destinations = signal<any[]>([]);
  deliveries = signal<any[]>([]);
  autoInvestMsg = signal('');
  providers = signal<any[]>([]);
  execProviders = signal<any[]>([]);
  brokerAccounts = signal<any[]>([]);
  sources = signal<any[]>([]);
  fundingMsg = signal('');
  depositMsg = signal('');
  withdrawMsg = signal('');
  transferMsg = signal('');
  withdrawals = signal<any[]>([]);
  transfers = signal<any[]>([]);
  auditEvents = signal<any[]>([]);
  auditMsg = signal('');
  prefMsg = signal('');
  destMsg = signal('');
  deliveryMsg = signal('');

  constructor(private http: HttpClient) {
    this.loadProviders();
    this.refreshSources();
    this.refreshWithdrawals();
    this.refreshTransfers();
    this.refreshBrokerProviders();
    this.refreshBrokerAccounts();
    this.loadCompliance();
    this.loadAudit();
    this.loadPlans();
    this.loadNotifications();
    this.loadPreferences();
    this.loadDestinations();
    this.loadDeliveries();
  }

  loadPlans() {
    this.http.get<any[]>(`${API_BASE}/api/v1/auto-invest/plans`).subscribe({
      next: (r) => this.plans.set(r || []),
      error: (e) => this.autoInvestMsg.set(e?.error?.message || 'Load plans failed')
    });
  }

  createPlan() {
    this.autoInvestMsg.set('Creating plan...');
    const symbols = this.planSymbolsText.split(',').map(s => s.trim()).filter(Boolean);
    const body = {
      name: this.planName,
      symbols,
      schedule: this.planSchedule,
      scheduleTimeUtc: this.planScheduleTime,
      scheduleDayOfWeek: this.planScheduleDay,
      driftThreshold: Number(this.planDriftThreshold),
      returnsLookback: Number(this.planLookback),
      useMarketData: this.planUseMarketData,
      useAiForecast: this.planUseAiForecast,
      riskAversion: Number(this.planRiskAversion),
      minWeight: Number(this.planMinWeight),
      maxWeight: Number(this.planMaxWeight),
      maxTurnover: Number(this.planMaxTurnover),
      minTradeValue: Number(this.planMinTradeValue),
      executionMode: this.planExecutionMode,
      region: this.planRegion,
      assetClass: this.planAssetClass,
      orderType: this.planOrderType,
      timeInForce: this.planTimeInForce
    };
    this.http.post(`${API_BASE}/api/v1/auto-invest/plans`, body).subscribe({
      next: () => { this.autoInvestMsg.set('Plan created.'); this.loadPlans(); },
      error: (e) => this.autoInvestMsg.set(e?.error?.message || 'Create failed')
    });
  }

  setPlanStatus(id: string, status: 'ACTIVE' | 'PAUSED') {
    this.autoInvestMsg.set('Updating plan...');
    this.http.post(`${API_BASE}/api/v1/auto-invest/plans/${id}/status`, { status }).subscribe({
      next: () => { this.autoInvestMsg.set('Updated.'); this.loadPlans(); },
      error: (e) => this.autoInvestMsg.set(e?.error?.message || 'Update failed')
    });
  }

  runPlan(id: string) {
    this.autoInvestMsg.set('Triggering run...');
    this.http.post<any>(`${API_BASE}/api/v1/auto-invest/plans/${id}/run`, {}).subscribe({
      next: (r) => {
        this.autoInvestMsg.set('Run triggered.');
        if (id === this.selectedPlanId) {
          this.autoRuns.set([r, ...this.autoRuns()]);
        }
        this.loadNotifications();
      },
      error: (e) => this.autoInvestMsg.set(e?.error?.message || 'Run failed')
    });
  }

  selectPlan(id: string) {
    this.selectedPlanId = id;
    this.loadRuns(id);
  }

  loadRuns(id: string) {
    this.http.get<any[]>(`${API_BASE}/api/v1/auto-invest/plans/${id}/runs`).subscribe({
      next: (r) => this.autoRuns.set(r || []),
      error: (e) => this.autoInvestMsg.set(e?.error?.message || 'Load runs failed')
    });
  }

  loadNotifications() {
    this.http.get<any[]>(`${API_BASE}/api/v1/notifications`, { params: { limit: 30 } }).subscribe({
      next: (r) => this.notifications.set(r || []),
      error: () => {}
    });
  }

  markNotificationRead(id: string) {
    this.http.post(`${API_BASE}/api/v1/notifications/${id}/read`, {}).subscribe({
      next: () => this.loadNotifications(),
      error: () => {}
    });
  }

  loadPreferences() {
    this.http.get<any[]>(`${API_BASE}/api/v1/notifications/preferences`).subscribe({
      next: (r) => this.preferences.set(r || []),
      error: (e) => this.prefMsg.set(e?.error?.message || 'Load preferences failed')
    });
  }

  savePreference() {
    this.prefMsg.set('Saving preference...');
    const types = this.prefTypesText.split(',').map(s => s.trim()).filter(Boolean);
    const body: any = {
      channel: this.prefChannel,
      enabled: this.prefEnabled,
      types
    };
    if (this.prefQuietStart !== null && this.prefQuietStart !== undefined && this.prefQuietStart !== '') {
      body.quietStartHour = Number(this.prefQuietStart);
    }
    if (this.prefQuietEnd !== null && this.prefQuietEnd !== undefined && this.prefQuietEnd !== '') {
      body.quietEndHour = Number(this.prefQuietEnd);
    }
    if (this.prefTimezone && this.prefTimezone.trim()) {
      body.timezone = this.prefTimezone.trim();
    }
    this.http.post<any>(`${API_BASE}/api/v1/notifications/preferences`, body).subscribe({
      next: () => { this.prefMsg.set('Saved.'); this.loadPreferences(); },
      error: (e) => this.prefMsg.set(e?.error?.message || 'Save failed')
    });
  }

  loadDestinations() {
    this.http.get<any[]>(`${API_BASE}/api/v1/notifications/destinations`).subscribe({
      next: (r) => this.destinations.set(r || []),
      error: (e) => this.destMsg.set(e?.error?.message || 'Load destinations failed')
    });
  }

  createDestination() {
    this.destMsg.set('Saving destination...');
    const body = {
      channel: this.destChannel,
      destination: this.destValue,
      label: this.destLabel
    };
    this.http.post<any>(`${API_BASE}/api/v1/notifications/destinations`, body).subscribe({
      next: () => { this.destMsg.set('Saved.'); this.loadDestinations(); },
      error: (e) => this.destMsg.set(e?.error?.message || 'Save failed')
    });
  }

  verifyDestination(id: string) {
    this.http.post<any>(`${API_BASE}/api/v1/notifications/destinations/${id}/verify`, {}).subscribe({
      next: () => this.loadDestinations(),
      error: () => {}
    });
  }

  disableDestination(id: string) {
    this.http.post<any>(`${API_BASE}/api/v1/notifications/destinations/${id}/disable`, {}).subscribe({
      next: () => this.loadDestinations(),
      error: () => {}
    });
  }

  loadDeliveries() {
    const params: any = { limit: 50 };
    if (this.deliveryStatus && this.deliveryStatus.trim()) {
      params.status = this.deliveryStatus.trim();
    }
    this.http.get<any[]>(`${API_BASE}/api/v1/notifications/deliveries`, { params }).subscribe({
      next: (r) => this.deliveries.set(r || []),
      error: (e) => this.deliveryMsg.set(e?.error?.message || 'Load deliveries failed')
    });
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
      next: (r) => {
        this.sources.set(r);
        if (!this.depositSourceId && r.length) this.depositSourceId = r[0].id;
        if (!this.withdrawSourceId && r.length) this.withdrawSourceId = r[0].id;
        if (!this.transferSourceId && r.length) this.transferSourceId = r[0].id;
      },
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

  withdraw() {
    if (!this.withdrawSourceId) { this.withdrawMsg.set('Select a source.'); return; }
    this.withdrawMsg.set('Withdrawing...');
    this.http.post(`${API_BASE}/api/v1/funding/withdrawals`, {
      sourceId: this.withdrawSourceId,
      amount: Number(this.withdrawAmount)
    }).subscribe({
      next: () => { this.withdrawMsg.set('Withdrawal requested.'); this.refreshWithdrawals(); this.loadAccount(); },
      error: (e) => this.withdrawMsg.set(e?.error?.message || 'Withdrawal failed')
    });
  }

  transfer() {
    if (!this.transferSourceId) { this.transferMsg.set('Select a source.'); return; }
    if (!this.transferBrokerAccountId) { this.transferMsg.set('Select a broker account.'); return; }
    this.transferMsg.set('Transferring...');
    this.http.post(`${API_BASE}/api/v1/funding/transfers`, {
      sourceId: this.transferSourceId,
      brokerAccountId: this.transferBrokerAccountId,
      direction: this.transferDirection,
      amount: Number(this.transferAmount),
      currency: this.transferCurrency
    }).subscribe({
      next: () => { this.transferMsg.set('Transfer requested.'); this.refreshTransfers(); this.loadAccount(); },
      error: (e) => this.transferMsg.set(e?.error?.message || 'Transfer failed')
    });
  }

  refreshWithdrawals() {
    this.http.get<any[]>(`${API_BASE}/api/v1/funding/withdrawals`).subscribe({
      next: (r) => this.withdrawals.set(r || []),
      error: () => {}
    });
  }

  refreshTransfers() {
    this.http.get<any[]>(`${API_BASE}/api/v1/funding/transfers`).subscribe({
      next: (r) => this.transfers.set(r || []),
      error: () => {}
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
      next: (r) => {
        this.brokerAccounts.set(r);
        if (!this.transferBrokerAccountId && r.length) this.transferBrokerAccountId = r[0].id;
      },
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

  loadAudit() {
    this.auditMsg.set('Loading audit log...');
    this.http.get<any[]>(`${API_BASE}/api/v1/audit/events`, { params: { limit: 50 } }).subscribe({
      next: (r) => { this.auditEvents.set(r || []); this.auditMsg.set(''); },
      error: (e) => this.auditMsg.set(e?.error?.message || 'Audit log unavailable')
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
    let returns: number[] | undefined;
    try { mu = JSON.parse(this.muText); } catch { this.msg.set('Invalid mu JSON'); return; }
    try { cov = JSON.parse(this.covText); } catch { this.msg.set('Invalid cov JSON'); return; }
    try { prices = JSON.parse(this.pricesText); } catch { this.msg.set('Invalid prices JSON'); return; }
    if (this.returnsText.trim()) {
      try { returns = JSON.parse(this.returnsText); } catch { this.msg.set('Invalid returns JSON'); return; }
    }

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
      returns,
      aiHorizon: Number(this.aiHorizon),
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
