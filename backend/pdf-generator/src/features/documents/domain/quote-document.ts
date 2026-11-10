export type QuoteDocumentType = 'credito-simple' | 'arrendamiento' | 'msi';

export interface QuoteDocumentPayment {
  paymentNumber: number;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

export interface QuoteDocument {
  type: QuoteDocumentType;
  annualRate: number;
  monthlyRate: number;
  totalValue: number;
  downPayment: number;
  financedAmount: number;
  termMonths: number;
  payments: QuoteDocumentPayment[];
  residualPayment: number | null;
  totalPaid: number;
  totalInterest: number;
}
