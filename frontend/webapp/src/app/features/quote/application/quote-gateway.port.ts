import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { QuoteRequest, QuoteResponse } from '../domain/quote.models';

export interface QuoteGateway {
  create(request: QuoteRequest): Observable<QuoteResponse>;
}

export const QUOTE_GATEWAY = new InjectionToken<QuoteGateway>('QUOTE_GATEWAY');
