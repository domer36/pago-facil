import type { QuoteResponse } from '../domain/quote.js';
import type { SavedQuote } from '../domain/saved-quote.js';

export const QUOTE_REPOSITORY = Symbol('QUOTE_REPOSITORY');

export interface QuoteRepository {
  save(
    prospectId: string,
    input: Record<string, unknown>,
    result: QuoteResponse,
  ): Promise<SavedQuote | null>;
}
