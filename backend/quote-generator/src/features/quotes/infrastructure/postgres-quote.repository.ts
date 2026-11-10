import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';
import type { QuoteResponse } from '../domain/quote.js';
import type { SavedQuote } from '../domain/saved-quote.js';
import type { QuoteRepository } from '../application/quote.repository.js';

interface SavedQuoteRow {
  id: string;
  prospect_id: string;
  input_payload: Record<string, unknown>;
  result_payload: QuoteResponse;
  created_at: Date | string;
}

@Injectable()
export class PostgresQuoteRepository
  implements QuoteRepository, OnModuleDestroy
{
  constructor(@Inject(Pool) private readonly pool: Pool) {}

  async save(
    prospectId: string,
    input: Record<string, unknown>,
    result: QuoteResponse,
  ): Promise<SavedQuote | null> {
    const savedQuote = await this.pool.query<SavedQuoteRow>(
      `WITH active_prospect AS MATERIALIZED (
         SELECT id
         FROM prospects
         WHERE id = $1 AND active = TRUE
         FOR UPDATE
       )
       INSERT INTO quotes (prospect_id, input_payload, result_payload)
       SELECT id, $2::jsonb, $3::jsonb
       FROM active_prospect
       RETURNING id, prospect_id, input_payload, result_payload, created_at`,
      [prospectId, input, result],
    );
    const row = savedQuote.rows[0];
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      prospectId: row.prospect_id,
      input: row.input_payload,
      result: row.result_payload,
      createdAt: toIsoString(row.created_at),
    };
  }

  onModuleDestroy(): Promise<void> {
    return this.pool.end();
  }
}

function toIsoString(value: Date | string): string {
  return new Date(value).toISOString();
}
