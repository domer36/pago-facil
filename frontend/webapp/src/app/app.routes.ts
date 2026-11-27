import { Routes } from '@angular/router';
import { QuotePageComponent } from './features/quote/presentation/quote-page.component';
import { DashboardPageComponent } from './features/dashboard/presentation/dashboard-page.component';

export const routes: Routes = [
  { path: '', component: QuotePageComponent, title: 'Pago Fácil | Cotizador' },
  { path: 'dashboard', component: DashboardPageComponent, title: 'Pago Fácil | Dashboard' },
  { path: '**', redirectTo: '' },
];
