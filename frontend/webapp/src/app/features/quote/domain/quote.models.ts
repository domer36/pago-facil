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

export interface Prospect {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SaveQuoteRequest {
  prospectId: string;
  input: QuoteRequest;
  result: QuoteResponse;
}

export interface SavedQuote {
  id: string;
  prospectId: string;
  inputPayload: QuoteRequest;
  resultPayload: QuoteResponse;
  createdAt: string;
}
