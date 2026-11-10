import type { QuoteDocument } from '../domain/quote-document.js';
import { QuotePdfGenerator } from './quote-pdf.generator.js';

const TYPES = [
  ['credito-simple', 'Crédito simple', 0.35],
  ['arrendamiento', 'Arrendamiento', 0.27],
  ['msi', 'Meses sin intereses (MSI)', 0],
] as const;

describe('QuotePdfGenerator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-15T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each(TYPES)(
    'generates a Spanish A4 document with the complete amortization for %s',
    (type, label, annualRate) => {
      const pdf = generatePdf(createQuote(type, annualRate));

      expect(pdf).toContain('%PDF-1.4');
      expect(pdf).toContain('/MediaBox [0 0 595.28 841.89]');
      expect(pdf).toContain('Cotización de financiamiento');
      expect(pdf).toContain('Fecha de generación: 15 de marzo de 2026');
      expect(pdf).toContain(
        `Tipo: ${label.replaceAll('(', '\\(').replaceAll(')', '\\)')}`,
      );
      expect(pdf).toContain('Valor total: $ 120,000.05 MXN');
      expect(pdf).toContain('Pago inicial: $ 10,000.01 MXN');
      expect(pdf).toContain('Monto financiado: $ 110,000.04 MXN');
      expect(pdf).toContain('Plazo: 48 meses');
      expect(pdf).toContain(`Tasa anual: ${formatRate(annualRate)}%`);
      expect(pdf).toContain(
        `Total pagado: $ ${type === 'arrendamiento' ? '154,400.04' : '134,400.05'} MXN`,
      );
      expect(pdf).toContain('Total de intereses: $ 14,400.00 MXN');
      expect(pdf).toContain('/Count 2');

      for (let paymentNumber = 1; paymentNumber <= 48; paymentNumber += 1) {
        expect(pdf).toContain(`(${paymentNumber}) Tj`);
      }

      expect(pdf).toContain('($ 2,300.00 MXN) Tj');
      expect(pdf).toContain('($ 16,300.04 MXN) Tj');
    },
  );

  it('prints the lease residual separately from the periodic amortization', () => {
    const pdf = generatePdf(createQuote('arrendamiento', 0.27));
    const residualIndex = pdf.indexOf(
      '(Pago residual final, liquidado por separado: $ 19,999.99 MXN)',
    );
    const tableIndex = pdf.indexOf('(Mensualidad) Tj');
    const amortization = pdf.slice(tableIndex);

    expect(residualIndex).toBeGreaterThan(-1);
    expect(tableIndex).toBeGreaterThan(residualIndex);
    expect(amortization).toContain('($ 16,300.04 MXN) Tj');
    expect(amortization).not.toContain('$ 19,999.99 MXN');
  });
});

function generatePdf(quote: QuoteDocument): string {
  return Buffer.from(new QuotePdfGenerator().generate(quote)).toString('latin1');
}

function createQuote(
  type: QuoteDocument['type'],
  annualRate: number,
): QuoteDocument {
  let principalPaid = 0;
  const payments = Array.from({ length: 48 }, (_, index) => {
    const principal = index === 47 ? 16_000.04 : 2_000;
    const interest = 300;
    principalPaid += principal;

    return {
      paymentNumber: index + 1,
      payment: principal + interest,
      principal,
      interest,
      remainingBalance: index === 47 ? 0 : 110_000.04 - principalPaid,
    };
  });

  return {
    type,
    annualRate,
    monthlyRate: annualRate / 12,
    totalValue: 120_000.05,
    downPayment: 10_000.01,
    financedAmount: 110_000.04,
    termMonths: 48,
    payments,
    residualPayment: type === 'arrendamiento' ? 19_999.99 : null,
    totalPaid: type === 'arrendamiento' ? 154_400.04 : 134_400.05,
    totalInterest: 14_400,
  };
}

function formatRate(rate: number): string {
  return new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rate * 100);
}
