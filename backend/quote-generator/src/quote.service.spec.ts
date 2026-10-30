import { BadRequestException } from '@nestjs/common';
import { QuoteService } from './quote.service.js';

describe('QuoteService', () => {
  const service = new QuoteService();

  it.each([
    ['credito-simple', 0.35, 14_994.45, 29_933.38],
    ['arrendamiento', 0.27, 11_461.91, 27_542.97],
    ['msi', 0, 12_500, 0],
  ] as const)(
    'calculates the %s rate and monthly schedule',
    (type, rate, expectedPayment, expectedInterest) => {
      const response = service.calculate({
        type,
        totalValue: 200_000,
        downPaymentPercentage: 25,
        termMonths: 12,
        ...(type === 'arrendamiento' ? { residualPercentage: 20 } : {}),
      });

      expect(response.annualRate).toBe(rate);
      expect(response.monthlyRate).toBe(rate / 12);
      expect(response.payments).toHaveLength(12);
      expect(response.payments[0]?.paymentNumber).toBe(1);
      expect(response.payments[0]?.payment).toBe(expectedPayment);
      expect(response.totalInterest).toBe(expectedInterest);
      expect(response.payments.at(-1)?.remainingBalance).toBe(0);
      expect(
        response.payments.every(
          (payment) =>
            Math.round((payment.principal + payment.interest) * 100) / 100 ===
            payment.payment,
        ),
      ).toBe(true);
      expect(response.totalInterest).toBeGreaterThanOrEqual(0);
      expect(response.totalPaid).toBeGreaterThan(response.downPayment);

      if (type === 'arrendamiento') {
        expect(response.residualPayment).toBe(40_000);
        expect(response.totalPaid).toBeGreaterThan(
          response.payments.reduce((sum, payment) => sum + payment.payment, 0),
        );
      } else {
        expect(response.residualPayment).toBeNull();
      }

      if (type === 'msi') {
        expect(response.totalInterest).toBe(0);
        expect(response.payments[0]?.payment).toBe(
          response.payments[1]?.payment,
        );
      }
    },
  );

  it.each([
    [
      {
        type: 'msi',
        totalValue: 200_000,
        downPaymentPercentage: -1,
        termMonths: 12,
      },
    ],
    [
      {
        type: 'msi',
        totalValue: 200_000,
        downPaymentPercentage: 81,
        termMonths: 12,
      },
    ],
    [
      {
        type: 'arrendamiento',
        totalValue: 200_000,
        downPaymentPercentage: 30,
        residualPercentage: 71,
        termMonths: 12,
      },
    ],
    [
      {
        type: 'arrendamiento',
        totalValue: 200_000,
        downPaymentPercentage: 0,
        residualPercentage: 81,
        termMonths: 12,
      },
    ],
    [{ type: 'msi', totalValue: 0, downPaymentPercentage: 0, termMonths: 12 }],
    [
      {
        type: 'msi',
        totalValue: '200000',
        downPaymentPercentage: 0,
        termMonths: 12,
      },
    ],
    [
      {
        type: 'msi',
        totalValue: 200_000,
        downPaymentPercentage: 0,
        termMonths: 10,
      },
    ],
    [
      {
        type: 'msi',
        totalValue: 49_999,
        downPaymentPercentage: 0,
        termMonths: 12,
      },
    ],
    [
      {
        type: 'desconocido',
        totalValue: 200_000,
        downPaymentPercentage: 0,
        termMonths: 12,
      },
    ],
    [
      {
        type: 'arrendamiento',
        totalValue: 200_000,
        downPaymentPercentage: 0,
        termMonths: 12,
      },
    ],
    [
      {
        type: 'msi',
        totalValue: 200_000,
        downPaymentPercentage: 0,
        residualPercentage: 10,
        termMonths: 12,
      },
    ],
  ])('rejects invalid input %#', (input) => {
    expect(() => service.calculate(input)).toThrow(BadRequestException);
  });

  it('returns the values and totals needed by the quote table', () => {
    const response = service.calculate({
      type: 'credito-simple',
      totalValue: 100_000,
      downPaymentPercentage: 0,
      termMonths: 6,
    });

    expect(response).toMatchObject({
      type: 'credito-simple',
      totalValue: 100_000,
      downPayment: 0,
      financedAmount: 100_000,
      termMonths: 6,
      residualPayment: null,
    });
    expect(response.payments[0]).toEqual({
      paymentNumber: 1,
      payment: expect.any(Number),
      principal: expect.any(Number),
      interest: expect.any(Number),
      remainingBalance: expect.any(Number),
    });
    expect(response.payments.at(-1)?.remainingBalance).toBe(0);
    expect(response.totalPaid).toBe(
      response.downPayment +
        response.payments.reduce((sum, payment) => sum + payment.payment, 0),
    );
    expect(response.totalInterest).toBeGreaterThan(0);
  });
});
