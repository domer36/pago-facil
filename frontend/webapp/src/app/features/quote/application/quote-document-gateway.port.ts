import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { QuoteResponse } from '../domain/quote.models';

export interface QuoteDocumentGateway {
  download(quote: QuoteResponse): Observable<Blob>;
}

export const QUOTE_DOCUMENT_GATEWAY = new InjectionToken<QuoteDocumentGateway>(
  'QUOTE_DOCUMENT_GATEWAY',
);
