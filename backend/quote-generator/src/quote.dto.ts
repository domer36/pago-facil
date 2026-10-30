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
