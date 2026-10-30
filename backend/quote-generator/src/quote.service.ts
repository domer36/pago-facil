import { BadRequestException, Injectable } from '@nestjs/common';
import type {
  PaymentRow,
  QuoteRequest,
  QuoteResponse,
  QuoteType,
} from './quote.dto.js';

const ALLOWED_TERMS = [6, 12, 18, 24, 36, 48] as const;
const ALLOWED_TYPES = [
  'credito-simple',
  'arrendamiento',
  'msi',
] as const satisfies readonly QuoteType[];
const ANNUAL_RATES: Record<QuoteType, number> = {
  'credito-simple': 0.35,
  arrendamiento: 0.27,
  msi: 0,
};

@Injectable()
export class QuoteService {
  calculate(input: unknown): QuoteResponse {
    const request = this.validateRequest(input);
    const annualRate = ANNUAL_RATES[request.type];
    const monthlyRate = annualRate / 12;
    const downPayment =
      (request.totalValue * request.downPaymentPercentage) / 100;
    const financedAmount = request.totalValue - downPayment;
    const residualPayment =
      request.type === 'arrendamiento'
        ? (request.totalValue * (request.residualPercentage ?? 0)) / 100
        : 0;
    const residualPresentValue =
      residualPayment / (1 + monthlyRate) ** request.termMonths;
    const amortizedAmount = financedAmount - residualPresentValue;
    const scheduledPayment =
      monthlyRate === 0
        ? amortizedAmount / request.termMonths
        : (amortizedAmount * monthlyRate) /
          (1 - (1 + monthlyRate) ** -request.termMonths);

    let balance = financedAmount;
    let totalInterest = 0;
    const payments: PaymentRow[] = [];

    for (let period = 1; period <= request.termMonths; period += 1) {
      const interest = balance * monthlyRate;
      const isLastPayment = period === request.termMonths;
      const principal = isLastPayment
        ? balance - residualPayment
        : scheduledPayment - interest;
      const payment = principal + interest;
      balance -= principal;
      totalInterest += interest;

      const futureResidualValue =
        residualPayment / (1 + monthlyRate) ** (request.termMonths - period);
      // Keep the balloon residual separate from the amortized balance.
      const remainingBalance = Math.max(0, balance - futureResidualValue);
      const displayedPayment = roundCurrency(payment);
      const displayedInterest = roundCurrency(interest);

      payments.push({
        paymentNumber: period,
        payment: displayedPayment,
        principal: roundCurrency(displayedPayment - displayedInterest),
        interest: displayedInterest,
        remainingBalance: isLastPayment ? 0 : roundCurrency(remainingBalance),
      });
    }

    const displayedDownPayment = roundCurrency(downPayment);
    const displayedResidual = roundCurrency(residualPayment);
    const totalPaid =
      displayedDownPayment +
      payments.reduce((sum, payment) => sum + payment.payment, 0) +
      displayedResidual;
    const displayedInterest = roundCurrency(totalInterest);

    return {
      type: request.type,
      annualRate,
      monthlyRate,
      totalValue: roundCurrency(request.totalValue),
      downPayment: displayedDownPayment,
      financedAmount: roundCurrency(financedAmount),
      termMonths: request.termMonths,
      payments,
      residualPayment:
        request.type === 'arrendamiento' ? displayedResidual : null,
      totalPaid: roundCurrency(totalPaid),
      totalInterest: roundCurrency(displayedInterest),
    };
  }

  private validateRequest(input: unknown): QuoteRequest {
    if (typeof input !== 'object' || input === null || Array.isArray(input)) {
      throw new BadRequestException('La solicitud debe ser un objeto JSON.');
    }

    const request = input as Record<string, unknown>;
    const type = request.type;
    if (!isQuoteType(type)) {
      throw new BadRequestException(
        'El tipo debe ser credito-simple, arrendamiento o msi.',
      );
    }

    const totalValue = request.totalValue;
    if (
      typeof totalValue !== 'number' ||
      !Number.isFinite(totalValue) ||
      totalValue <= 0
    ) {
      throw new BadRequestException('El valor total debe ser mayor que cero.');
    }

    const downPaymentPercentage = this.readPercentage(
      request.downPaymentPercentage,
      'El porcentaje de enganche',
    );

    const termMonths = request.termMonths;
    if (typeof termMonths !== 'number' || !isAllowedTerm(termMonths)) {
      throw new BadRequestException(
        'El plazo debe ser 6, 12, 18, 24, 36 o 48 meses.',
      );
    }

    if (
      type === 'arrendamiento' &&
      !Object.hasOwn(request, 'residualPercentage')
    ) {
      throw new BadRequestException(
        'El porcentaje residual es obligatorio para arrendamiento.',
      );
    }
    if (
      type !== 'arrendamiento' &&
      Object.hasOwn(request, 'residualPercentage')
    ) {
      throw new BadRequestException(
        'El porcentaje residual solo aplica para arrendamiento.',
      );
    }

    let residualPercentage: number | undefined;
    if (type === 'arrendamiento') {
      residualPercentage = this.readPercentage(
        request.residualPercentage,
        'El porcentaje residual',
      );

      if (downPaymentPercentage + residualPercentage > 100) {
        throw new BadRequestException(
          'La suma del enganche y el residual no puede superar 100%.',
        );
      }
    }

    const financedAmount =
      totalValue - (totalValue * downPaymentPercentage) / 100;
    if (financedAmount < 50_000) {
      throw new BadRequestException(
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

  private readPercentage(value: unknown, label: string): number {
    if (
      typeof value !== 'number' ||
      !Number.isFinite(value) ||
      value < 0 ||
      value > 80
    ) {
      throw new BadRequestException(`${label} debe estar entre 0% y 80%.`);
    }
    return value;
  }
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

function roundCurrency(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}
