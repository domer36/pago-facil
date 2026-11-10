import type { DocumentGenerator } from '../domain/document-generator.js';
import type { QuoteDocument } from '../domain/quote-document.js';
import {
  QuoteDocumentService,
  QuoteDocumentValidationError,
} from './quote-document.service.js';

const quote: QuoteDocument = {
  type: 'credito-simple',
  annualRate: 0.35,
  monthlyRate: 0.35 / 12,
  totalValue: 100_000.01,
  downPayment: 10_000.01,
  financedAmount: 90_000,
  termMonths: 6,
  payments: Array.from({ length: 6 }, (_, index) => ({
    paymentNumber: index + 1,
    payment: 15_000.01,
    principal: 14_000.01,
    interest: 1_000,
    remainingBalance: index === 5 ? 0 : 90_000 - (index + 1) * 14_000.01,
  })),
  residualPayment: null,
  totalPaid: 101_000.07,
  totalInterest: 11_000.06,
};

describe('QuoteDocumentService', () => {
  it('accepts a quote response and passes its financial values through unchanged', () => {
    const document = Buffer.from('%PDF-1.4');
    const generate = vi.fn(() => document);
    const service = new QuoteDocumentService({ generate });

    expect(service.generate(quote)).toBe(document);
    expect(generate).toHaveBeenCalledOnce();
    expect(generate).toHaveBeenCalledWith(quote);
    expect(generate.mock.calls[0][0]).toBe(quote);
  });

  it('rejects incomplete or malformed quote responses', () => {
    const generate = vi.fn(() => Buffer.from('%PDF-1.4'));
    const generator: DocumentGenerator<QuoteDocument> = {
      generate,
    };
    const service = new QuoteDocumentService(generator);

    expect(() =>
      service.generate({ ...quote, totalPaid: '101000.07' }),
    ).toThrow(QuoteDocumentValidationError);
    expect(generate).not.toHaveBeenCalled();
  });

  it('allows generators for other document input types', () => {
    const futureGenerator: DocumentGenerator<{ title: string }> = {
      generate: ({ title }) => Buffer.from(title),
    };

    expect(futureGenerator.generate({ title: 'Estado de cuenta' })).toEqual(
      Buffer.from('Estado de cuenta'),
    );
  });
});
