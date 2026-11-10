import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types.js';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';

describe('DocumentsController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('accepts a quote response and returns a PDF document', async () => {
    const response = await request(app.getHttpServer())
      .post('/documents/quote')
      .send({
        type: 'credito-simple',
        annualRate: 0.35,
        monthlyRate: 0.35 / 12,
        totalValue: 100_000.01,
        downPayment: 10_000.01,
        financedAmount: 90_000,
        termMonths: 6,
        payments: Array.from({ length: 6 }, (_, index) => ({
          paymentNumber: index + 1,
          payment: 15_000.01,
          principal: 14_000.01,
          interest: 1_000,
          remainingBalance: index === 5 ? 0 : 90_000 - (index + 1) * 14_000.01,
        })),
        residualPayment: null,
        totalPaid: 101_000.07,
        totalInterest: 11_000.06,
      })
      .expect(201);

    expect(response.headers['content-type']).toContain('application/pdf');
    expect(response.headers['content-disposition']).toContain(
      'attachment; filename="cotizacion.pdf"',
    );
    expect(Buffer.isBuffer(response.body)).toBe(true);
    expect(response.body.toString('ascii')).toContain('%PDF-1.4');
    expect(response.body.toString('ascii')).toContain('100000.01');
    expect(response.body.toString('ascii')).toContain('101000.07');
  });

  it('rejects invalid quote responses', async () => {
    await request(app.getHttpServer())
      .post('/documents/quote')
      .send({ type: 'credito-simple' })
      .expect(400);
  });
});
