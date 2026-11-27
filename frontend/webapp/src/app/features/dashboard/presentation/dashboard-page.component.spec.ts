import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DASHBOARD_GATEWAY } from '../application/dashboard-gateway.port';
import { HttpDashboardGateway } from '../infrastructure/http-dashboard.gateway';
import { DashboardPageComponent } from './dashboard-page.component';

describe('DashboardPageComponent', () => {
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: DASHBOARD_GATEWAY, useClass: HttpDashboardGateway },
      ],
    }).compileComponents();
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('requests the most recent 30-day interval and presents totals and independent lists', () => {
    const fixture = TestBed.createComponent(DashboardPageComponent);
    fixture.detectChanges();

    const createQuoteLink = (fixture.nativeElement as HTMLElement).querySelector(
      '.create-quote-link',
    ) as HTMLAnchorElement;
    expect(createQuoteLink.textContent?.trim()).toBe('Crear cotización');
    expect(createQuoteLink.getAttribute('href')).toBe('/cotizador');

    const request = httpTesting.expectOne(
      (req) =>
        req.url === '/dashboard/metrics' &&
        req.params.get('from') === fixture.componentInstance.from() &&
        req.params.get('to') === fixture.componentInstance.to(),
    );
    request.flush(createMetrics());
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Solicitudes totales');
    expect(host.textContent).toContain('MXN');
    expect(host.textContent).toContain('Prospectos frecuentes');
    expect(host.textContent).toContain('Ana López');
    expect(host.textContent).toContain('Cotización reciente');
  });

  it('updates metrics and graphs when the date interval changes', () => {
    const fixture = TestBed.createComponent(DashboardPageComponent);
    fixture.detectChanges();
    httpTesting.expectOne((req) => req.url === '/dashboard/metrics').flush(createMetrics());
    fixture.detectChanges();

    fixture.componentInstance.from.set('2026-01-01');
    fixture.componentInstance.to.set('2026-01-31');
    fixture.componentInstance.load();

    const request = httpTesting.expectOne(
      (req) =>
        req.url === '/dashboard/metrics' &&
        req.params.get('from') === '2026-01-01' &&
        req.params.get('to') === '2026-01-31',
    );
    request.flush(createMetrics());
    fixture.detectChanges();

    expect(fixture.componentInstance.metrics()?.interval.from).toBe('2026-01-01');
  });

  it('shows an error as an error and never renders failed metrics as zero', () => {
    const fixture = TestBed.createComponent(DashboardPageComponent);
    fixture.detectChanges();

    httpTesting.expectOne((req) => req.url === '/dashboard/metrics').flush(
      { message: 'No fue posible consultar las métricas del dashboard.' },
      { status: 500, statusText: 'Server Error' },
    );
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('[role="alert"]')?.textContent).toContain(
      'No fue posible cargar las métricas',
    );
    expect(host.textContent).not.toContain('Solicitudes totales');
  });

  it('shows empty, loading, and MXN states without changing the quote flow', () => {
    const fixture = TestBed.createComponent(DashboardPageComponent);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).not.toContain('Solicitudes totales');

    httpTesting.expectOne((req) => req.url === '/dashboard/metrics').flush({
      ...createMetrics(),
      total: { count: 0, totalValue: 0, financedAmount: 0 },
      byType: {
        'credito-simple': { count: 0, totalValue: 0, financedAmount: 0 },
        arrendamiento: { count: 0, totalValue: 0, financedAmount: 0 },
        msi: { count: 0, totalValue: 0, financedAmount: 0 },
      },
    });
    fixture.detectChanges();

    expect(host.textContent).toContain('No hay solicitudes para el intervalo seleccionado.');
    expect(host.textContent).toMatch(/MXN\s*0\.00/);
  });

  it('renders at most five frequent prospects and ten recent quotes', () => {
    const fixture = TestBed.createComponent(DashboardPageComponent);
    fixture.detectChanges();
    const result = createMetrics();
    result.frequentProspects = Array.from({ length: 8 }, (_, index) => ({
      prospectId: `p${index}`,
      fullName: `Prospecto ${index}`,
      count: 8 - index,
    }));
    result.recentQuotes = Array.from({ length: 12 }, (_, index) => ({
      id: `q${index}`,
      savedAt: `2026-01-${String(index + 1).padStart(2, '0')}T12:00:00.000Z`,
      prospectId: `p${index}`,
      prospectName: `Prospecto reciente ${index}`,
      type: 'msi',
      totalValue: 100000,
    }));

    httpTesting.expectOne((req) => req.url === '/dashboard/metrics').flush(result);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelectorAll('.prospect-list li').length).toBeLessThanOrEqual(5);
    expect(host.querySelectorAll('.recent-list article').length).toBeLessThanOrEqual(10);
  });
});

function createMetrics() {
  return {
    interval: { from: '2026-01-01', to: '2026-01-31' },
    total: { count: 3, totalValue: 350000, financedAmount: 300000 },
    byType: {
      'credito-simple': { count: 1, totalValue: 150000, financedAmount: 130000 },
      arrendamiento: { count: 1, totalValue: 100000, financedAmount: 80000 },
      msi: { count: 1, totalValue: 100000, financedAmount: 90000 },
    },
    frequentProspects: [{ prospectId: 'p1', fullName: 'Ana López', count: 3 }],
    recentQuotes: [
      {
        id: 'q1',
        savedAt: '2026-01-31T12:00:00.000Z',
        prospectId: 'p1',
        prospectName: 'Cotización reciente',
        type: 'credito-simple',
        totalValue: 150000,
      },
    ],
  };
}
