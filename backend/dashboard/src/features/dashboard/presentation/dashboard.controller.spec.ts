import { InternalServerErrorException } from '@nestjs/common';
import type { DashboardRepository } from '../application/dashboard.repository.js';
import { DashboardService } from '../application/dashboard.service.js';
import { DashboardController } from './dashboard.controller.js';

describe('DashboardController', () => {
  it('returns a stable internal error and never zero metrics on query failure', async () => {
    const repository: DashboardRepository = {
      findMetrics: async () => {
        throw new Error('database unavailable');
      },
    };
    const controller = new DashboardController(
      new DashboardService(repository),
    );

    await expect(
      controller.metrics('2026-11-01', '2026-11-26'),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});
