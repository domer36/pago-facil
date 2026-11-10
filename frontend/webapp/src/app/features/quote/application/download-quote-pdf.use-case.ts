import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { QuoteResponse } from '../domain/quote.models';
import { QUOTE_DOCUMENT_GATEWAY } from './quote-document-gateway.port';

@Injectable({ providedIn: 'root' })
export class DownloadQuotePdf {
  private readonly quoteDocumentGateway = inject(QUOTE_DOCUMENT_GATEWAY);

  execute(quote: QuoteResponse): Observable<Blob> {
    return this.quoteDocumentGateway.download(quote);
  }
}
