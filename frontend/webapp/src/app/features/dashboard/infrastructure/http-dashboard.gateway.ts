import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { DashboardGateway } from '../application/dashboard-gateway.port';
import type { DashboardMetrics } from '../domain/dashboard.models';

@Injectable()
export class HttpDashboardGateway implements DashboardGateway {
  private readonly http = inject(HttpClient);

  getMetrics(from: string, to: string) {
    return this.http.get<DashboardMetrics>('/dashboard/metrics', {
      params: { from, to },
    });
  }
}
