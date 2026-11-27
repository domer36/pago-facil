import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';
import type {
  Aggregate,
  DashboardMetrics,
  FinanceType,
} from '../domain/dashboard.js';
import type { DashboardRepository } from '../application/dashboard.repository.js';

interface AggregateRow {
  count: string | number;
  total_value: string | number;
  financed_amount: string | number;
}

interface TypeAggregateRow extends AggregateRow {
  type: FinanceType;
}

interface FrequentRow {
  prospect_id: string;
  full_name: string;
  count: string | number;
}

interface RecentRow {
  id: string;
  created_at: Date | string;
  prospect_id: string;
  full_name: string;
  type: FinanceType;
  total_value: string | number;
}

@Injectable()
export class PostgresDashboardRepository
  implements DashboardRepository, OnModuleDestroy
{
  constructor(@Inject(Pool) private readonly pool: Pool) {}

  async findMetrics(
    intervalFromUtc: string,
    intervalToUtcExclusive: string,
  ): Promise<DashboardMetrics> {
    const from = new Date(intervalFromUtc);
    const to = new Date(intervalToUtcExclusive);

    const [totalResult, typeResult, frequentResult, recentResult] =
      await Promise.all([
        this.pool.query<AggregateRow>(
          `SELECT
             COUNT(*)::int AS count,
             COALESCE(SUM((q.result_payload->>'totalValue')::numeric), 0)::float8 AS total_value,
             COALESCE(SUM((q.result_payload->>'financedAmount')::numeric), 0)::float8 AS financed_amount
           FROM quotes q
           INNER JOIN prospects p
             ON p.id = q.prospect_id
            AND p.active = TRUE
            AND p.deleted_at IS NULL
           WHERE q.created_at >= $1
              AND q.created_at < $2
              AND q.result_payload->>'type' IN ('credito-simple', 'arrendamiento', 'msi')`,
          [from, to],
        ),
        this.pool.query<TypeAggregateRow>(
          `SELECT
             q.result_payload->>'type' AS type,
             COUNT(*)::int AS count,
             COALESCE(SUM((q.result_payload->>'totalValue')::numeric), 0)::float8 AS total_value,
             COALESCE(SUM((q.result_payload->>'financedAmount')::numeric), 0)::float8 AS financed_amount
           FROM quotes q
           INNER JOIN prospects p
             ON p.id = q.prospect_id
            AND p.active = TRUE
            AND p.deleted_at IS NULL
           WHERE q.created_at >= $1
             AND q.created_at < $2
              AND q.result_payload->>'type' IN ('credito-simple', 'arrendamiento', 'msi')
           GROUP BY q.result_payload->>'type'`,
          [from, to],
        ),
        this.pool.query<FrequentRow>(
          `SELECT
             p.id AS prospect_id,
             p.full_name,
             COUNT(q.id)::int AS count
           FROM quotes q
           INNER JOIN prospects p
             ON p.id = q.prospect_id
            AND p.active = TRUE
            AND p.deleted_at IS NULL
           WHERE q.created_at >= NOW() - INTERVAL '30 days'
           GROUP BY p.id, p.full_name
           ORDER BY count DESC, p.full_name ASC
           LIMIT 5`,
        ),
        this.pool.query<RecentRow>(
          `SELECT
             q.id,
             q.created_at,
             p.id AS prospect_id,
             p.full_name,
             q.result_payload->>'type' AS type,
             (q.result_payload->>'totalValue')::float8 AS total_value
           FROM quotes q
           INNER JOIN prospects p
             ON p.id = q.prospect_id
            AND p.active = TRUE
            AND p.deleted_at IS NULL
           ORDER BY q.created_at DESC
           LIMIT 10`,
        ),
      ]);

    const empty: Aggregate = {
      count: 0,
      totalValue: 0,
      financedAmount: 0,
    };
    const byType: Record<FinanceType, Aggregate> = {
      'credito-simple': { ...empty },
      arrendamiento: { ...empty },
      msi: { ...empty },
    };

    for (const row of typeResult.rows) {
      if (row.type in byType) {
        byType[row.type] = toAggregate(row);
      }
    }

    const totalRow = totalResult.rows[0];
    return {
      interval: {
        from: intervalFromUtc,
        to: intervalToUtcExclusive,
      },
      total: totalRow ? toAggregate(totalRow) : { ...empty },
      byType,
      frequentProspects: frequentResult.rows.map((row) => ({
        prospectId: row.prospect_id,
        fullName: row.full_name,
        count: Number(row.count),
      })),
      recentQuotes: recentResult.rows.map((row) => ({
        id: row.id,
        savedAt: toIsoString(row.created_at),
        prospectId: row.prospect_id,
        prospectName: row.full_name,
        type: row.type,
        totalValue: Number(row.total_value),
      })),
    };
  }

  onModuleDestroy(): Promise<void> {
    return this.pool.end();
  }
}

function toAggregate(row: AggregateRow): Aggregate {
  return {
    count: Number(row.count),
    totalValue: Number(row.total_value),
    financedAmount: Number(row.financed_amount),
  };
}

function toIsoString(value: Date | string): string {
  return new Date(value).toISOString();
}
