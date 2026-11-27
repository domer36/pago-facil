import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import type { DashboardMetrics } from '../domain/dashboard.models';

export interface DashboardGateway {
  getMetrics(from: string, to: string): Observable<DashboardMetrics>;
}

export const DASHBOARD_GATEWAY = new InjectionToken<DashboardGateway>('DASHBOARD_GATEWAY');
