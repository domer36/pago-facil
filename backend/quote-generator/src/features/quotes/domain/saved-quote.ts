import type { QuoteResponse } from './quote.js';

export interface SavedQuote {
  id: string;
  prospectId: string;
  input: Record<string, unknown>;
  result: QuoteResponse;
  createdAt: string;
}
