import { CurrencyPipe, DatePipe, registerLocaleData } from '@angular/common';
import localeEsMx from '@angular/common/locales/es-MX';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GetDashboardMetrics } from '../application/get-dashboard-metrics.use-case';
import type {
  DashboardAggregate,
  DashboardMetrics,
  FinanceType,
  FrequentProspect,
  RecentQuote,
} from '../domain/dashboard.models';

registerLocaleData(localeEsMx);

@Component({
  imports: [CurrencyPipe, DatePipe, FormsModule, RouterLink],
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css',
})
export class DashboardPageComponent {
  readonly typeLabels: Record<FinanceType, string> = {
    'credito-simple': 'Crédito simple',
    arrendamiento: 'Arrendamiento',
    msi: 'Meses sin intereses',
  };
  readonly typeKeys: FinanceType[] = ['credito-simple', 'arrendamiento', 'msi'];

  readonly metrics = signal<DashboardMetrics | null>(null);
  readonly frequentProspects = signal<FrequentProspect[]>([]);
  readonly recentQuotes = signal<RecentQuote[]>([]);
  readonly metricsLoading = signal(true);
  readonly listingsLoading = signal(true);
  readonly metricsError = signal('');
  readonly listingsError = signal('');
  readonly from = signal('');
  readonly to = signal('');

  readonly types = computed(() =>
    this.typeKeys.map((key) => ({
      key,
      label: this.typeLabels[key],
      aggregate: this.metrics()?.byType[key] ?? emptyAggregate(),
    })),
  );

  private readonly destroyRef = inject(DestroyRef);
  private readonly getMetrics = inject(GetDashboardMetrics);

  constructor() {
    const today = new Date();
    const from = new Date(today);
    from.setDate(from.getDate() - 29);
    this.to.set(formatDateInput(today));
    this.from.set(formatDateInput(from));
    this.load();
  }

  load(): void {
    if (!this.from() || !this.to()) {
      this.metricsError.set('Selecciona las fechas de inicio y fin.');
      this.metricsLoading.set(false);
      return;
    }
    if (this.from() > this.to()) {
      this.metricsError.set('La fecha inicial no puede ser posterior a la fecha final.');
      this.metricsLoading.set(false);
      return;
    }

    this.metricsLoading.set(true);
    this.listingsLoading.set(this.frequentProspects().length === 0 && this.recentQuotes().length === 0);
    this.metricsError.set('');
    this.listingsError.set('');

    this.getMetrics
      .execute(this.from(), this.to())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.metrics.set(result);
          this.frequentProspects.set(result.frequentProspects.slice(0, 5));
          this.recentQuotes.set(result.recentQuotes.slice(0, 10));
          this.metricsLoading.set(false);
          this.listingsLoading.set(false);
        },
        error: (error: unknown) => {
          this.metricsLoading.set(false);
          this.listingsLoading.set(false);
          this.metricsError.set(getDashboardError(error));
          if (this.frequentProspects().length === 0 && this.recentQuotes().length === 0) {
            this.listingsError.set(getDashboardError(error));
          }
        },
      });
  }

  formatCount(value: number): string {
    return new Intl.NumberFormat('es-MX').format(value);
  }

  financeLabel(type: FinanceType): string {
    return this.typeLabels[type];
  }

  aggregateEmpty(aggregate: DashboardAggregate): boolean {
    return aggregate.count === 0 && aggregate.totalValue === 0 && aggregate.financedAmount === 0;
  }
}

function emptyAggregate(): DashboardAggregate {
  return { count: 0, totalValue: 0, financedAmount: 0 };
}

function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDashboardError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const message = error.error?.message;
    if (typeof message === 'string') return message;
  }
  return 'No fue posible consultar el dashboard. Intenta de nuevo.';
}
