import type { DashboardMetrics } from '../domain/dashboard.js';

export const DASHBOARD_REPOSITORY = Symbol('DASHBOARD_REPOSITORY');

export interface DashboardRepository {
  findMetrics(
    intervalFromUtc: string,
    intervalToUtcExclusive: string,
  ): Promise<DashboardMetrics>;
}
