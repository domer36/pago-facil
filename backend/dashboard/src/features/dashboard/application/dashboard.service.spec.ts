import {
  addMexicoDays,
  DashboardDateValidationError,
  mexicoDateAtMidnightUtc,
  validateDate,
} from './dashboard.service.js';

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
});
