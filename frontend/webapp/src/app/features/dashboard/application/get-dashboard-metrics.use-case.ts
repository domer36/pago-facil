import { Injectable, inject } from '@angular/core';
import { DASHBOARD_GATEWAY } from './dashboard-gateway.port';

@Injectable({ providedIn: 'root' })
export class GetDashboardMetrics {
  private readonly gateway = inject(DASHBOARD_GATEWAY);

  execute(from: string, to: string) {
    return this.gateway.getMetrics(from, to);
  }
}
