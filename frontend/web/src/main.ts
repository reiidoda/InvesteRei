import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { authInterceptor } from './app/core/auth.interceptor';
import { LoginComponent } from './app/features/login/login.component';
import { PortfolioLabComponent } from './app/features/portfolio-lab/portfolio-lab.component';
import { RiskLabComponent } from './app/features/risk-lab/risk-lab.component';
import { AutoInvestComponent } from './app/features/auto-invest/auto-invest.component';
import { AiForecastComponent } from './app/features/ai-forecast/ai-forecast.component';
import { SimulationLabComponent } from './app/features/simulation-lab/simulation-lab.component';
import { MarketDataComponent } from './app/features/market-data/market-data.component';
import { WatchlistsComponent } from './app/features/watchlists/watchlists.component';
import { AlertsComponent } from './app/features/alerts/alerts.component';
import { StatementsComponent } from './app/features/statements/statements.component';
import { ResearchComponent } from './app/features/research/research.component';
import { ManualTradeComponent } from './app/features/manual-trade/manual-trade.component';

const routes: Routes = [
  { path: '', component: PortfolioLabComponent },
  { path: 'auto-invest', component: AutoInvestComponent },
  { path: 'risk', component: RiskLabComponent },
  { path: 'ai', component: AiForecastComponent },
  { path: 'simulation', component: SimulationLabComponent },
  { path: 'market-data', component: MarketDataComponent },
  { path: 'manual-trade', component: ManualTradeComponent },
  { path: 'watchlists', component: WatchlistsComponent },
  { path: 'alerts', component: AlertsComponent },
  { path: 'statements', component: StatementsComponent },
  { path: 'research', component: ResearchComponent },
  { path: 'login', component: LoginComponent },
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
});
