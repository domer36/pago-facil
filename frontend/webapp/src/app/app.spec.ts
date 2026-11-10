import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { QuoteResponse } from './features/quote/domain/quote.models';
import { QUOTE_GATEWAY } from './features/quote/application/quote-gateway.port';
import { QUOTE_DOCUMENT_GATEWAY } from './features/quote/application/quote-document-gateway.port';
import { HttpQuoteGateway } from './features/quote/infrastructure/http-quote.gateway';
import { HttpQuoteDocumentGateway } from './features/quote/infrastructure/http-quote-document.gateway';
import { QuotePageComponent } from './features/quote/presentation/quote-page.component';

describe('QuotePageComponent', () => {
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuotePageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: QUOTE_GATEWAY, useClass: HttpQuoteGateway },
        { provide: QUOTE_DOCUMENT_GATEWAY, useClass: HttpQuoteDocumentGateway },
      ],
    }).compileComponents();
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('offers the three financing types, exact terms, and residual only for leases', () => {
    const fixture = TestBed.createComponent(QuotePageComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('.download-button')).toBeNull();
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

  it('posts the quote to the PDF service and starts a direct browser download', () => {
    const fixture = TestBed.createComponent(QuotePageComponent);
    const quote = createQuote('credito-simple', null);
    fixture.componentInstance.quote.set(quote);
    fixture.detectChanges();

    vi.stubGlobal('URL', {
      createObjectURL: vi.fn().mockReturnValue('blob:cotizacion'),
      revokeObjectURL: vi.fn(),
    });
    const clickedLinks: HTMLAnchorElement[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      clickedLinks.push(this);
    });
    (fixture.nativeElement as HTMLElement)
      .querySelector('.download-button')!
      .dispatchEvent(new Event('click', { bubbles: true }));

    const request = httpTesting.expectOne('/documents/quote');
    expect(request.request.method).toBe('POST');
    expect(request.request.responseType).toBe('blob');
    expect(request.request.body).toEqual(quote);
    request.flush(new Blob(['PDF'], { type: 'application/pdf' }));
    fixture.detectChanges();

    expect(clickedLinks).toHaveLength(1);
    expect(clickedLinks[0].download).toBe('cotizacion.pdf');
    expect(clickedLinks[0].href).toBe('blob:cotizacion');
    expect(fixture.nativeElement.querySelector('.download-error')).toBeNull();
  });

  it('keeps the quote visible and allows retry after a PDF download failure', () => {
    const fixture = TestBed.createComponent(QuotePageComponent);
    const quote = createQuote('credito-simple', null);
    fixture.componentInstance.quote.set(quote);
    fixture.detectChanges();

    const button = (fixture.nativeElement as HTMLElement).querySelector(
      '.download-button',
    ) as HTMLButtonElement;
    button.click();
    httpTesting
      .expectOne('/documents/quote')
      .flush(new Blob(['{"message":"Error interno"}'], { type: 'application/json' }), {
        status: 500,
        statusText: 'Server Error',
      });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.results-card')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'No fue posible descargar el PDF de la cotización. Intenta de nuevo.',
    );
    expect(button.disabled).toBe(false);

    vi.stubGlobal('URL', {
      createObjectURL: vi.fn().mockReturnValue('blob:cotizacion'),
      revokeObjectURL: vi.fn(),
    });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    button.click();
    httpTesting.expectOne('/documents/quote').flush(new Blob(['PDF'], { type: 'application/pdf' }));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.results-card')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.download-error')).toBeNull();
  });

  it('posts the lease request and presents the table, totals, and separate MXN residual', () => {
    const fixture = TestBed.createComponent(QuotePageComponent);
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
    const fixture = TestBed.createComponent(QuotePageComponent);
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
