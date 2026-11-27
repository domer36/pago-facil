import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { DASHBOARD_REPOSITORY } from '../src/features/dashboard/application/dashboard.repository.js';
import type { DashboardRepository } from '../src/features/dashboard/application/dashboard.repository.js';

describe('Dashboard metrics HTTP (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    process.env.DATABASE_URL ??= 'postgresql://test:test@localhost:5432/test';
    const repository: DashboardRepository = {
      findMetrics: async (from, to) => ({
        interval: { from, to },
        total: { count: 3, totalValue: 350000, financedAmount: 300000 },
        byType: {
          'credito-simple': { count: 1, totalValue: 150000, financedAmount: 130000 },
          arrendamiento: { count: 1, totalValue: 100000, financedAmount: 80000 },
          msi: { count: 1, totalValue: 100000, financedAmount: 90000 },
        },
        frequentProspects: [
          { prospectId: 'p1', fullName: 'Ana López', count: 3 },
        ],
        recentQuotes: [
          {
            id: 'q1',
            savedAt: '2026-11-26T18:00:00.000Z',
            prospectId: 'p1',
            prospectName: 'Ana López',
            type: 'credito-simple',
            totalValue: 150000,
          },
        ],
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DASHBOARD_REPOSITORY)
      .useValue(repository)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('returns three persisted financing totals for a selected interval', () =>
    request(app.getHttpServer())
      .get('/dashboard/metrics')
      .query({ from: '2026-11-01', to: '2026-11-26' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.total).toEqual({
          count: 3,
          totalValue: 350000,
          financedAmount: 300000,
        });
        expect(body.byType).toEqual({
          'credito-simple': { count: 1, totalValue: 150000, financedAmount: 130000 },
          arrendamiento: { count: 1, totalValue: 100000, financedAmount: 80000 },
          msi: { count: 1, totalValue: 100000, financedAmount: 90000 },
        });
      }));

  it('rejects an invalid interval visibly', () =>
    request(app.getHttpServer())
      .get('/dashboard/metrics')
      .query({ from: '2026-11-26', to: '2026-11-01' })
      .expect(400));

  afterAll(async () => {
    await app.close();
  });
});
