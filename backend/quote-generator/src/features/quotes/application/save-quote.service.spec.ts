import { calculateQuote } from '../domain/quote-calculator.js';
import type { QuoteRepository } from './quote.repository.js';
import {
  ProspectNotFoundError,
  SaveQuoteService,
} from './save-quote.service.js';

describe('SaveQuoteService', () => {
  const prospectId = 'c3e8b1ce-09fb-4c09-9f31-f32f50ba13d0';
  const input = {
    type: 'msi',
    totalValue: 100_000,
    downPaymentPercentage: 0,
    termMonths: 6,
  };

  it('persists the supplied input and result without recalculating', async () => {
    const calculatedResult = calculateQuote(input);
    const result = {
      ...calculatedResult,
      totalPaid: calculatedResult.totalPaid + 12.34,
    };
    const save = vi.fn(async (savedProspectId, savedInput, savedResult) => ({
      id: 'quote-id',
      prospectId: savedProspectId,
      input: savedInput,
      result: savedResult,
      createdAt: '2026-11-10T00:00:00.000Z',
    }));
    const repository: QuoteRepository = {
      save,
    };
    const service = new SaveQuoteService(repository);

    const savedQuote = await service.save({ prospectId, input, result });

    expect(save).toHaveBeenCalledWith(prospectId, input, result);
    expect(savedQuote.input).toBe(input);
    expect(savedQuote.result).toBe(result);
    expect(savedQuote.result.totalPaid).toBe(result.totalPaid);
  });

  it('rejects saving for a prospect that is missing or inactive', async () => {
    const save = vi.fn(async () => null);
    const repository: QuoteRepository = {
      save,
    };
    const service = new SaveQuoteService(repository);

    await expect(
      service.save({ prospectId, input, result: calculateQuote(input) }),
    ).rejects.toBeInstanceOf(ProspectNotFoundError);
  });

  it('rejects invalid quote input before calling the repository', async () => {
    const save = vi.fn(async () => null);
    const repository: QuoteRepository = {
      save,
    };
    const service = new SaveQuoteService(repository);

    await expect(
      service.save({
        prospectId,
        input: { ...input, termMonths: 10 },
        result: calculateQuote(input),
      }),
    ).rejects.toThrow('El plazo debe ser 6, 12, 18, 24, 36 o 48 meses.');
    expect(save).not.toHaveBeenCalled();
  });
});
