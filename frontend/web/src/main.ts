import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { authInterceptor } from './app/core/auth.interceptor';
import { LoginComponent } from './app/features/login/login.component';
import { PortfolioLabComponent } from './app/features/portfolio-lab/portfolio-lab.component';
import { RiskLabComponent } from './app/features/risk-lab/risk-lab.component';
import { AutoInvestComponent } from './app/features/auto-invest/auto-invest.component';

const routes: Routes = [
  { path: '', component: PortfolioLabComponent },
  { path: 'auto-invest', component: AutoInvestComponent },
  { path: 'risk', component: RiskLabComponent },
  { path: 'login', component: LoginComponent },
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
});
