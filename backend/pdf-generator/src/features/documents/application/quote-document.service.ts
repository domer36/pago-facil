import { Inject, Injectable } from '@nestjs/common';
import type { DocumentGenerator } from '../domain/document-generator.js';
import type { QuoteDocument } from '../domain/quote-document.js';

export const QUOTE_PDF_GENERATOR = Symbol('QUOTE_PDF_GENERATOR');

const ALLOWED_TERMS = [6, 12, 18, 24, 36, 48] as const;
const ALLOWED_TYPES = ['credito-simple', 'arrendamiento', 'msi'] as const;

export class QuoteDocumentValidationError extends Error {
  constructor() {
    super('La respuesta de cotización recibida no es válida.');
    this.name = 'QuoteDocumentValidationError';
  }
}

@Injectable()
export class QuoteDocumentService {
  constructor(
    @Inject(QUOTE_PDF_GENERATOR)
    private readonly generator: DocumentGenerator<QuoteDocument>,
  ) {}

  generate(input: unknown): Uint8Array {
    if (!isQuoteDocument(input)) {
      throw new QuoteDocumentValidationError();
    }

    return this.generator.generate(input);
  }
}

function isQuoteDocument(input: unknown): input is QuoteDocument {
  if (!isRecord(input)) {
    return false;
  }

  if (
    typeof input.type !== 'string' ||
    !isQuoteDocumentType(input.type) ||
    !isNonNegativeNumber(input.annualRate) ||
    !isNonNegativeNumber(input.monthlyRate) ||
    !isNonNegativeNumber(input.totalValue) ||
    !isNonNegativeNumber(input.downPayment) ||
    !isNonNegativeNumber(input.financedAmount) ||
    typeof input.termMonths !== 'number' ||
    !ALLOWED_TERMS.some((term) => term === input.termMonths) ||
    !isNonNegativeNumber(input.totalPaid) ||
    !isNonNegativeNumber(input.totalInterest) ||
    !isValidResidual(input.type, input.residualPayment) ||
    !Array.isArray(input.payments) ||
    input.payments.length !== input.termMonths
  ) {
    return false;
  }

  return input.payments.every(
    (payment, index) =>
      isRecord(payment) &&
      payment.paymentNumber === index + 1 &&
      isNonNegativeNumber(payment.payment) &&
      isNonNegativeNumber(payment.principal) &&
      isNonNegativeNumber(payment.interest) &&
      isNonNegativeNumber(payment.remainingBalance),
  );
}

function isQuoteDocumentType(value: string): value is QuoteDocument['type'] {
  return ALLOWED_TYPES.some((type) => type === value);
}

function isValidResidual(
  type: unknown,
  residualPayment: unknown,
): residualPayment is number | null {
  if (type === 'arrendamiento') {
    return isNonNegativeNumber(residualPayment);
  }
  return residualPayment === null;
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
