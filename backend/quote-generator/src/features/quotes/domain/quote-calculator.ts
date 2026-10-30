import type {
  PaymentRow,
  QuoteRequest,
  QuoteResponse,
  QuoteType,
} from './quote.js';

const ANNUAL_RATES: Record<QuoteType, number> = {
  'credito-simple': 0.35,
  arrendamiento: 0.27,
  msi: 0,
};

export function calculateQuote(request: QuoteRequest): QuoteResponse {
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

function roundCurrency(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}
