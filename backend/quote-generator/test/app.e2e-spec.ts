import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import type { QuoteRepository } from '../src/features/quotes/application/quote.repository.js';
import { QUOTE_REPOSITORY } from '../src/features/quotes/application/quote.repository.js';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let saveRequests: number;

  beforeEach(async () => {
    process.env.DATABASE_URL ??= 'postgresql://test:test@localhost:5432/test';
    saveRequests = 0;
    const repository: QuoteRepository = {
      save: async (prospectId, input, result) => {
        saveRequests += 1;
        return {
          id: '12b3f1ea-a931-4e8d-90b2-a0da99db254b',
          prospectId,
          input,
          result,
          createdAt: '2026-11-10T00:00:00.000Z',
        };
      },
    };
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(QUOTE_REPOSITORY)
      .useValue(repository)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('calculates a quote without persisting it', async () => {
    await request(app.getHttpServer())
      .post('/quotes')
      .send({
        type: 'msi',
        totalValue: 100_000,
        downPaymentPercentage: 0,
        termMonths: 6,
      })
      .expect(201)
      .expect(({ body }) => {
        expect(body.payments).toHaveLength(6);
        expect(body.totalInterest).toBe(0);
        expect(body.payments.at(-1).remainingBalance).toBe(0);
      });
    expect(saveRequests).toBe(0);
  });

  it('saves the supplied quote result only when explicitly requested', async () => {
    const input = {
      type: 'msi',
      totalValue: 100_000,
      downPaymentPercentage: 0,
      termMonths: 6,
    };
    const result = {
      type: 'msi',
      annualRate: 0,
      monthlyRate: 0,
      totalValue: 100_000,
      downPayment: 0,
      financedAmount: 100_000,
      termMonths: 6,
      payments: Array.from({ length: 6 }, (_, index) => ({
        paymentNumber: index + 1,
        payment: 16_666.67,
        principal: 16_666.67,
        interest: 0,
        remainingBalance: index === 5 ? 0 : 83_333.33 - index * 16_666.67,
      })),
      residualPayment: null,
      totalPaid: 100_000,
      totalInterest: 0,
    };
    const prospectId = 'c3e8b1ce-09fb-4c09-9f31-f32f50ba13d0';

    expect(saveRequests).toBe(0);
    await request(app.getHttpServer())
      .post('/quotes/saved')
      .send({ prospectId, input, result })
      .expect(201)
      .expect(({ body }) => {
        expect(body).toEqual({
          id: '12b3f1ea-a931-4e8d-90b2-a0da99db254b',
          prospectId,
          input,
          result,
          createdAt: '2026-11-10T00:00:00.000Z',
        });
      });

    expect(saveRequests).toBe(1);
  });

  it('rejects invalid quote requests', () => {
    return request(app.getHttpServer())
      .post('/quotes')
      .send({
        type: 'msi',
        totalValue: 49_999,
        downPaymentPercentage: 0,
        termMonths: 6,
      })
      .expect(400)
      .expect(({ body }) => {
        expect(body.message).toContain(
          'El monto financiado debe ser de al menos $50,000 MXN.',
        );
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
