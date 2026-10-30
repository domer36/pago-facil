import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';

export type QuoteType = 'credito-simple' | 'arrendamiento' | 'msi';

export interface QuoteRequest {
  type: QuoteType;
  totalValue: number;
  downPaymentPercentage: number;
  termMonths: number;
  residualPercentage?: number;
}

export interface PaymentRow {
  paymentNumber: number;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

export interface QuoteResponse {
  type: QuoteType;
  annualRate: number;
  monthlyRate: number;
  totalValue: number;
  downPayment: number;
  financedAmount: number;
  termMonths: number;
  payments: PaymentRow[];
  residualPayment: number | null;
  totalPaid: number;
  totalInterest: number;
}

@Injectable({ providedIn: 'root' })
export class QuoteApiService {
  private readonly http = inject(HttpClient);

  create(request: QuoteRequest): Observable<QuoteResponse> {
    return this.http.post<QuoteResponse>('/quotes', request);
  }
}
