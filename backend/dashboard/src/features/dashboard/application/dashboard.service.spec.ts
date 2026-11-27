import {
  addMexicoDays,
  DashboardDateValidationError,
  DashboardService,
  mexicoDateAtMidnightUtc,
  validateDate,
} from './dashboard.service.js';
import type { DashboardRepository } from './dashboard.repository.js';

describe('Dashboard date handling', () => {
  it('validates calendar dates', () => {
    expect(() => validateDate('2026-11-26')).not.toThrow();
    expect(() => validateDate('2026-02-30')).toThrow(
      DashboardDateValidationError,
    );
  });

  it('converts Mexico City calendar boundaries to UTC', () => {
    expect(mexicoDateAtMidnightUtc('2026-07-01')).toBe(
      '2026-07-01T06:00:00.000Z',
    );
    expect(mexicoDateAtMidnightUtc('2026-01-15')).toBe(
      '2026-01-15T06:00:00.000Z',
    );
  });

  it('adds days for an inclusive to-date as an exclusive boundary', () => {
    expect(addMexicoDays('2026-11-26', 1)).toBe('2026-11-27');
  });

  it('sends Mexico calendar boundaries to the repository as exclusive UTC bounds', async () => {
    let receivedFrom = '';
    let receivedTo = '';
    const repository: DashboardRepository = {
      findMetrics: async (from, to) => {
        receivedFrom = from;
        receivedTo = to;
        return {
          interval: { from, to },
          total: { count: 0, totalValue: 0, financedAmount: 0 },
          byType: {
            'credito-simple': { count: 0, totalValue: 0, financedAmount: 0 },
            arrendamiento: { count: 0, totalValue: 0, financedAmount: 0 },
            msi: { count: 0, totalValue: 0, financedAmount: 0 },
          },
          frequentProspects: [],
          recentQuotes: [],
        };
      },
    };

    await new DashboardService(repository).findMetrics('2026-11-01', '2026-11-26');

    expect(receivedFrom).toBe('2026-11-01T06:00:00.000Z');
    expect(receivedTo).toBe('2026-11-27T06:00:00.000Z');
  });

  it('rejects reversed intervals in the dashboard service', async () => {
    const repository: DashboardRepository = {
      findMetrics: async () => {
        throw new Error('must not be called');
      },
    };

    await expect(
      new DashboardService(repository).findMetrics('2026-11-26', '2026-11-01'),
    ).rejects.toBeInstanceOf(DashboardDateValidationError);
  });
});
