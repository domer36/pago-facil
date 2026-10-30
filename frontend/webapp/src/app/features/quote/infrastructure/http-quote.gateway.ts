import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import type { Observable } from 'rxjs';
import type { QuoteRequest, QuoteResponse } from '../domain/quote.models';
import type { QuoteGateway } from '../application/quote-gateway.port';

@Injectable({ providedIn: 'root' })
export class HttpQuoteGateway implements QuoteGateway {
  private readonly http = inject(HttpClient);

  create(request: QuoteRequest): Observable<QuoteResponse> {
    return this.http
      .post<QuoteResponse>('/quotes', request)
      .pipe(catchError((error: unknown) => throwError(() => mapQuoteError(error))));
  }
}

function mapQuoteError(error: unknown): Error {
  if (error instanceof HttpErrorResponse) {
    const message: unknown = error.error?.message;
    if (typeof message === 'string') {
      return new Error(message);
    }
    if (Array.isArray(message) && message.every((item) => typeof item === 'string')) {
      return new Error(message.join(' '));
    }
  }

  return new Error('No fue posible generar la cotización. Intenta de nuevo.');
}
