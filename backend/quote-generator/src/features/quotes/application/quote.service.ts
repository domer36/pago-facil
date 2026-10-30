import { calculateQuote } from '../domain/quote-calculator.js';
import type {
  QuoteRequest,
  QuoteResponse,
  QuoteType,
} from '../domain/quote.js';

const ALLOWED_TERMS = [6, 12, 18, 24, 36, 48] as const;
const ALLOWED_TYPES = [
  'credito-simple',
  'arrendamiento',
  'msi',
] as const satisfies readonly QuoteType[];

export class QuoteValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuoteValidationError';
  }
}

export class QuoteService {
  calculate(input: unknown): QuoteResponse {
    return calculateQuote(validateRequest(input));
  }
}

function validateRequest(input: unknown): QuoteRequest {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new QuoteValidationError('La solicitud debe ser un objeto JSON.');
  }

  const request = input as Record<string, unknown>;
  const type = request.type;
  if (!isQuoteType(type)) {
    throw new QuoteValidationError(
      'El tipo debe ser credito-simple, arrendamiento o msi.',
    );
  }

  const totalValue = request.totalValue;
  if (
    typeof totalValue !== 'number' ||
    !Number.isFinite(totalValue) ||
    totalValue <= 0
  ) {
    throw new QuoteValidationError('El valor total debe ser mayor que cero.');
  }

  const downPaymentPercentage = readPercentage(
    request.downPaymentPercentage,
    'El porcentaje de enganche',
  );

  const termMonths = request.termMonths;
  if (typeof termMonths !== 'number' || !isAllowedTerm(termMonths)) {
    throw new QuoteValidationError(
      'El plazo debe ser 6, 12, 18, 24, 36 o 48 meses.',
    );
  }

  if (
    type === 'arrendamiento' &&
    !Object.hasOwn(request, 'residualPercentage')
  ) {
    throw new QuoteValidationError(
      'El porcentaje residual es obligatorio para arrendamiento.',
    );
  }
  if (
    type !== 'arrendamiento' &&
    Object.hasOwn(request, 'residualPercentage')
  ) {
    throw new QuoteValidationError(
      'El porcentaje residual solo aplica para arrendamiento.',
    );
  }

  let residualPercentage: number | undefined;
  if (type === 'arrendamiento') {
    residualPercentage = readPercentage(
      request.residualPercentage,
      'El porcentaje residual',
    );

    if (downPaymentPercentage + residualPercentage > 100) {
      throw new QuoteValidationError(
        'La suma del enganche y el residual no puede superar 100%.',
      );
    }
  }

  const financedAmount =
    totalValue - (totalValue * downPaymentPercentage) / 100;
  if (financedAmount < 50_000) {
    throw new QuoteValidationError(
      'El monto financiado debe ser de al menos $50,000 MXN.',
    );
  }

  return {
    type,
    totalValue,
    downPaymentPercentage,
    termMonths,
    ...(residualPercentage === undefined ? {} : { residualPercentage }),
  };
}

function readPercentage(value: unknown, label: string): number {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > 80
  ) {
    throw new QuoteValidationError(`${label} debe estar entre 0% y 80%.`);
  }
  return value;
}

function isQuoteType(value: unknown): value is QuoteType {
  return (
    typeof value === 'string' &&
    (ALLOWED_TYPES as readonly string[]).includes(value)
  );
}

function isAllowedTerm(value: number): value is (typeof ALLOWED_TERMS)[number] {
  return ALLOWED_TERMS.some((term) => term === value);
}
