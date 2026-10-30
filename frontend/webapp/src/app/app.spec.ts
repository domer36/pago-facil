import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { QuoteResponse } from './quote-api.service';
import { App } from './app';

describe('App', () => {
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('offers the three financing types, exact terms, and residual only for leases', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelectorAll('select[formControlName="type"] option')).toHaveLength(3);
    expect(host.querySelector('input[formControlName="residualPercentage"]')).toBeNull();
    expect(
      Array.from(host.querySelectorAll('select[formControlName="termMonths"] option')).map(
        (option) => option.textContent?.trim().replace(' meses', ''),
      ),
    ).toEqual(['6', '12', '18', '24', '36', '48']);

    fixture.componentInstance.form.controls.type.setValue('arrendamiento');
    fixture.detectChanges();
    expect(host.querySelector('input[formControlName="residualPercentage"]')).not.toBeNull();

    fixture.componentInstance.form.controls.type.setValue('msi');
    fixture.detectChanges();
    expect(host.querySelector('input[formControlName="residualPercentage"]')).toBeNull();
  });

  it('posts the lease request and presents the table, totals, and separate MXN residual', () => {
    const fixture = TestBed.createComponent(App);
    const component = fixture.componentInstance;
    component.form.setValue({
      type: 'arrendamiento',
      totalValue: 150_000,
      downPaymentPercentage: 10,
      termMonths: 6,
      residualPercentage: 15,
    });
    fixture.detectChanges();

    (fixture.nativeElement as HTMLElement)
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    const request = httpTesting.expectOne('/quotes');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      type: 'arrendamiento',
      totalValue: 150_000,
      downPaymentPercentage: 10,
      termMonths: 6,
      residualPercentage: 15,
    });
    request.flush(createQuote('arrendamiento', 22_500));
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelectorAll('tbody tr')).toHaveLength(6);
    expect(
      Array.from(host.querySelectorAll('thead th')).map((cell) => cell.textContent?.trim()),
    ).toEqual(['Mensualidad', 'Pago periódico', 'Capital', 'Interés', 'Saldo pendiente']);
    expect(host.querySelector('.summary-grid')?.textContent).toContain('Total pagado');
    expect(host.querySelector('.summary-grid')?.textContent).toContain('Total de intereses');

    const residual = host.querySelector('.residual-summary')?.textContent ?? '';
    expect(residual).toContain('Pago residual al final del plazo');
    expect(residual).toContain('MXN');
    expect(residual).toMatch(/\d+\.\d{2}/);
    expect(host.querySelector('tbody')?.textContent).toContain('MXN');
    expect(host.querySelector('tbody')?.textContent).toMatch(/\d+\.\d{2}/);
  });

  it('shows backend validation errors and removes any previous quote', () => {
    const fixture = TestBed.createComponent(App);
    const component = fixture.componentInstance;
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    component.form.patchValue({ totalValue: 150_000 });
    fixture.detectChanges();

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    httpTesting.expectOne('/quotes').flush(createQuote('credito-simple', null));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.results-card')).not.toBeNull();

    component.form.controls.totalValue.setValue(1_000);
    component.submit();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.results-card')).toBeNull();

    httpTesting.expectOne('/quotes').flush(
      {
        statusCode: 400,
        message: 'El monto financiado debe ser de al menos $50,000 MXN.',
        error: 'Bad Request',
      },
      { status: 400, statusText: 'Bad Request' },
    );
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'El monto financiado debe ser de al menos $50,000 MXN.',
    );
    expect(fixture.nativeElement.querySelector('.results-card')).toBeNull();
  });
});

function createQuote(type: QuoteResponse['type'], residualPayment: number | null): QuoteResponse {
  return {
    type,
    annualRate: type === 'arrendamiento' ? 0.27 : 0.35,
    monthlyRate: type === 'arrendamiento' ? 0.27 / 12 : 0.35 / 12,
    totalValue: 150_000,
    downPayment: 15_000,
    financedAmount: 135_000,
    termMonths: 6,
    payments: Array.from({ length: 6 }, (_, index) => ({
      paymentNumber: index + 1,
      payment: 23_000,
      principal: 20_000,
      interest: 3_000,
      remainingBalance: index === 5 ? 0 : 135_000 - 20_000 * (index + 1),
    })),
    residualPayment,
    totalPaid: 153_000,
    totalInterest: 18_000,
  };
}
