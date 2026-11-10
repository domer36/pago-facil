import { Inject, Injectable } from '@nestjs/common';
import type { QuoteResponse, QuoteType } from '../domain/quote.js';
import type { SavedQuote } from '../domain/saved-quote.js';
import { parseQuoteRequest, QuoteValidationError } from './quote.service.js';
import { QUOTE_REPOSITORY } from './quote.repository.js';
import type { QuoteRepository } from './quote.repository.js';

interface SaveQuoteRequest {
  prospectId: string;
  input: Record<string, unknown>;
  result: QuoteResponse;
}

export class ProspectNotFoundError extends Error {
  constructor() {
    super('No se encontró un prospecto activo con ese identificador.');
    this.name = 'ProspectNotFoundError';
  }
}

@Injectable()
export class SaveQuoteService {
  constructor(
    @Inject(QUOTE_REPOSITORY)
    private readonly quoteRepository: QuoteRepository,
  ) {}

  async save(request: unknown): Promise<SavedQuote> {
    const parsedRequest = parseSaveQuoteRequest(request);
    const savedQuote = await this.quoteRepository.save(
      parsedRequest.prospectId,
      parsedRequest.input,
      parsedRequest.result,
    );
    if (!savedQuote) {
      throw new ProspectNotFoundError();
    }
    return savedQuote;
  }
}

function parseSaveQuoteRequest(input: unknown): SaveQuoteRequest {
  const request = asRecord(input, 'La solicitud de guardado');
  if (typeof request.prospectId !== 'string' || !isUuid(request.prospectId)) {
    throw new QuoteValidationError(
      'El identificador del prospecto no es válido.',
    );
  }

  const quoteInput = asRecord(request.input, 'Los datos de entrada');
  parseQuoteRequest(quoteInput);

  const result = request.result;
  if (!isQuoteResponse(result)) {
    throw new QuoteValidationError(
      'El resultado de la cotización no tiene un formato válido.',
    );
  }

  return {
    prospectId: request.prospectId,
    input: quoteInput,
    result,
  };
}

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new QuoteValidationError(`${label} debe ser un objeto JSON.`);
  }
  return value as Record<string, unknown>;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function isQuoteResponse(value: unknown): value is QuoteResponse {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isQuoteType(value.type) &&
    isFiniteNumber(value.annualRate) &&
    isFiniteNumber(value.monthlyRate) &&
    isFiniteNumber(value.totalValue) &&
    isFiniteNumber(value.downPayment) &&
    isFiniteNumber(value.financedAmount) &&
    isFiniteNumber(value.termMonths) &&
    Array.isArray(value.payments) &&
    value.payments.every(isPaymentRow) &&
    (value.residualPayment === null || isFiniteNumber(value.residualPayment)) &&
    isFiniteNumber(value.totalPaid) &&
    isFiniteNumber(value.totalInterest)
  );
}

function isPaymentRow(value: unknown): boolean {
  return (
    isRecord(value) &&
    isFiniteNumber(value.paymentNumber) &&
    isFiniteNumber(value.payment) &&
    isFiniteNumber(value.principal) &&
    isFiniteNumber(value.interest) &&
    isFiniteNumber(value.remainingBalance)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isQuoteType(value: unknown): value is QuoteType {
  return (
    value === 'credito-simple' || value === 'arrendamiento' || value === 'msi'
  );
}
