import { Pool } from 'pg';
import { calculateQuote } from '../domain/quote-calculator.js';
import { PostgresQuoteRepository } from './postgres-quote.repository.js';

describe('PostgresQuoteRepository', () => {
  it('inserts and returns the original quote payload for an active prospect', async () => {
    const prospectId = 'c3e8b1ce-09fb-4c09-9f31-f32f50ba13d0';
    const input = {
      type: 'msi',
      totalValue: 100_000,
      downPaymentPercentage: 0,
      termMonths: 6,
    };
    const result = calculateQuote(input);
    const pool = new Pool();
    const query = vi.spyOn(pool, 'query').mockResolvedValue({
      command: 'INSERT',
      rowCount: 1,
      oid: 0,
      fields: [],
      rows: [
        {
          id: '12b3f1ea-a931-4e8d-90b2-a0da99db254b',
          prospect_id: prospectId,
          input_payload: input,
          result_payload: result,
          created_at: new Date('2026-11-10T00:00:00.000Z'),
        },
      ],
    });
    const repository = new PostgresQuoteRepository(pool);

    try {
      const savedQuote = await repository.save(prospectId, input, result);

      expect(savedQuote).toEqual({
        id: '12b3f1ea-a931-4e8d-90b2-a0da99db254b',
        prospectId,
        input,
        result,
        createdAt: '2026-11-10T00:00:00.000Z',
      });
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO quotes'),
        [prospectId, input, result],
      );
      expect(query.mock.calls[0]?.[0]).toContain(
        'WHERE id = $1 AND active = TRUE',
      );
      expect(query.mock.calls[0]?.[0]).toContain('FOR UPDATE');
    } finally {
      await repository.onModuleDestroy();
    }
  });
});
