import { Pool } from 'pg';
import { PostgresDashboardRepository } from './postgres-dashboard.repository.js';

describe('PostgresDashboardRepository', () => {
  it('returns totals and three type aggregates, plus independent recent lists', async () => {
    const pool = new Pool();
    const query = vi.spyOn(pool, 'query').mockImplementation(async (text: unknown) => {
      const sql = String(text);
      if (sql.includes('COALESCE(SUM')) {
        if (sql.includes('GROUP BY')) {
          return {
            command: 'SELECT',
            rowCount: 3,
            oid: 0,
            fields: [],
            rows: [
              { type: 'credito-simple', count: 2, total_value: 250000, financed_amount: 200000 },
              { type: 'arrendamiento', count: 1, total_value: 150000, financed_amount: 120000 },
              { type: 'msi', count: 1, total_value: 100000, financed_amount: 100000 },
            ],
          };
        }
        return {
          command: 'SELECT',
          rowCount: 1,
          oid: 0,
          fields: [],
          rows: [{ count: 4, total_value: 500000, financed_amount: 420000 }],
        };
      }
      if (sql.includes('LIMIT 5')) {
        return {
          command: 'SELECT',
          rowCount: 1,
          oid: 0,
          fields: [],
          rows: [{ prospect_id: 'p1', full_name: 'Ana Pérez', count: 3 }],
        };
      }
      return {
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
        rows: [{
          id: 'q1',
          created_at: new Date('2026-11-26T18:00:00.000Z'),
          prospect_id: 'p1',
          full_name: 'Ana Pérez',
          type: 'msi',
          total_value: 100000,
        }],
      };
    });
    const repository = new PostgresDashboardRepository(pool);

    try {
      const result = await repository.findMetrics(
        '2026-11-01T06:00:00.000Z',
        '2026-11-27T06:00:00.000Z',
      );
      expect(result.total).toEqual({
        count: 4,
        totalValue: 500000,
        financedAmount: 420000,
      });
      expect(result.byType['credito-simple'].count).toBe(2);
      expect(result.frequentProspects).toHaveLength(1);
      expect(result.recentQuotes[0]).toMatchObject({
        id: 'q1',
        prospectName: 'Ana Pérez',
        type: 'msi',
        totalValue: 100000,
        savedAt: '2026-11-26T18:00:00.000Z',
      });

      for (const call of query.mock.calls) {
        expect(String(call[0])).toContain(
          'INNER JOIN prospects p',
        );
      }
      expect(String(query.mock.calls[0]?.[0])).toContain(
        "q.result_payload->>'type' IN",
      );
      expect(String(query.mock.calls[2]?.[0])).toContain(
        "INTERVAL '30 days'",
      );
      expect(String(query.mock.calls[3]?.[0])).toContain(
        'LIMIT 10',
      );
    } finally {
      await repository.onModuleDestroy();
    }
  });
});
