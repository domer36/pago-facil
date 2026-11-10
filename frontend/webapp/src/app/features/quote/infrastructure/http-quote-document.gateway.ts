import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import type { Observable } from 'rxjs';
import type { QuoteResponse } from '../domain/quote.models';
import type { QuoteDocumentGateway } from '../application/quote-document-gateway.port';

@Injectable({ providedIn: 'root' })
export class HttpQuoteDocumentGateway implements QuoteDocumentGateway {
  private readonly http = inject(HttpClient);

  download(quote: QuoteResponse): Observable<Blob> {
    return this.http
      .post('/documents/quote', quote, { responseType: 'blob' })
      .pipe(
        catchError(() =>
          throwError(
            () => new Error('No fue posible descargar el PDF de la cotización. Intenta de nuevo.'),
          ),
        ),
      );
  }
}
