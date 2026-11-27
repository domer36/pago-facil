import { Inject, Injectable } from '@nestjs/common';
import type {
  DashboardRepository,
} from './dashboard.repository.js';
import { DASHBOARD_REPOSITORY } from './dashboard.repository.js';

export class DashboardDateValidationError extends Error {}

@Injectable()
export class DashboardService {
  constructor(
    @Inject(DASHBOARD_REPOSITORY)
    private readonly repository: DashboardRepository,
  ) {}

  async findMetrics(from?: string, to?: string) {
    let fromDate = from;
    let toDate = to;

    if (!fromDate || !toDate) {
      const today = mexicoDateNow();
      toDate ??= today;
      fromDate ??= addMexicoDays(today, -29);
    }

    validateDate(fromDate);
    validateDate(toDate);
    if (fromDate > toDate) {
      throw new DashboardDateValidationError(
        'La fecha inicial no puede ser posterior a la fecha final.',
      );
    }

    const intervalFromUtc = mexicoDateAtMidnightUtc(fromDate);
    const intervalToUtcExclusive = mexicoDateAtMidnightUtc(
      addMexicoDays(toDate, 1),
    );

    return this.repository.findMetrics(
      intervalFromUtc,
      intervalToUtcExclusive,
    );
  }
}

export function validateDate(value: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new DashboardDateValidationError(
      'Las fechas deben tener el formato YYYY-MM-DD.',
    );
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new DashboardDateValidationError(
      'La fecha proporcionada no es válida.',
    );
  }
}

export function addMexicoDays(value: string, days: number): string {
  const date = new Date(`${value}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function mexicoDateNow(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;
  return `${value('year')}-${value('month')}-${value('day')}`;
}

export function mexicoDateAtMidnightUtc(value: string): string {
  validateDate(value);
  const timeZone = 'America/Mexico_City';
  const local = new Date(`${value}T00:00:00.000Z`);
  let candidate = local.getTime();

  for (let index = 0; index < 3; index += 1) {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date(candidate));
    const part = (type: Intl.DateTimeFormatPartTypes) =>
      Number(parts.find((item) => item.type === type)?.value);
    const representedAsUtc = Date.UTC(
      part('year'),
      part('month') - 1,
      part('day'),
      part('hour'),
      part('minute'),
      part('second'),
    );
    const offset = representedAsUtc - candidate;
    const adjusted = local.getTime() - offset;
    if (adjusted === candidate) break;
    candidate = adjusted;
  }

  return new Date(candidate).toISOString();
}
