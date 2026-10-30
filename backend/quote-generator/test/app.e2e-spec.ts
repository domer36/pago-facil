import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('creates a quote with a monthly schedule', () => {
    return request(app.getHttpServer())
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
