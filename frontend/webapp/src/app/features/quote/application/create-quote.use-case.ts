import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { QuoteRequest, QuoteResponse } from '../domain/quote.models';
import { QUOTE_GATEWAY } from './quote-gateway.port';

@Injectable({ providedIn: 'root' })
export class CreateQuote {
  private readonly quoteGateway = inject(QUOTE_GATEWAY);

  execute(request: QuoteRequest): Observable<QuoteResponse> {
    return this.quoteGateway.create(request);
  }
}
