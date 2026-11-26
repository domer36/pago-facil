export type FinanceType =
  | 'credito-simple'
  | 'arrendamiento'
  | 'msi';

export interface Aggregate {
  count: number;
  totalValue: number;
  financedAmount: number;
}

export interface FrequentProspect {
  prospectId: string;
  fullName: string;
  count: number;
}

export interface RecentQuote {
  id: string;
  savedAt: string;
  prospectId: string;
  prospectName: string;
  type: FinanceType;
  totalValue: number;
}

export interface DashboardMetrics {
  interval: {
    from: string;
    to: string;
  };
  total: Aggregate;
  byType: Record<FinanceType, Aggregate>;
  frequentProspects: FrequentProspect[];
  recentQuotes: RecentQuote[];
}
