import { describe, expect, it } from 'vitest';
import { routes } from './app.routes';
import { DashboardPageComponent } from './features/dashboard/presentation/dashboard-page.component';
import { QuotePageComponent } from './features/quote/presentation/quote-page.component';

describe('App routes', () => {
  it('opens the dashboard by default and keeps quote creation on its own route', () => {
    expect(routes.find((route) => route.path === '')).toMatchObject({
      path: '',
      component: DashboardPageComponent,
    });
    expect(routes).toContainEqual(
      expect.objectContaining({ path: 'cotizador', component: QuotePageComponent }),
    );
    expect(routes).toContainEqual(
      expect.objectContaining({ path: 'dashboard', component: DashboardPageComponent }),
    );
  });
});
