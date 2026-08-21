import { Injectable, computed, effect, inject, signal } from '@angular/core';
import {
  AnalyticsDataset,
  AnalyticsView,
  CurrencyAllocation,
  PortfolioPlan,
  PortfolioScenario,
  ScenarioKind,
} from '../../core/models/blue-ledger.models';
import { SessionStorageService } from '../../core/storage/session-storage.service';

const PLAN_STORAGE_KEY = 'blueledger.portfolio-plan.v1';

const DEFAULT_PLAN: PortfolioPlan = {
  version: 1,
  currentCapital: 1600,
  monthlyContribution: 100,
  horizonMonths: 5,
  baseCurrency: 'USD',
};

export const DEFAULT_ALLOCATION: readonly CurrencyAllocation[] = [
  { code: 'USD', label: 'US Dollar', percentage: 50 },
  { code: 'EUR', label: 'Euro', percentage: 30 },
  { code: 'GBP', label: 'Pound sterling', percentage: 20 },
];

@Injectable({ providedIn: 'root' })
export class PortfolioStore {
  private readonly storage = inject(SessionStorageService);
  private readonly planState = signal<PortfolioPlan>(this.readPlan());

  readonly plan = this.planState.asReadonly();
  readonly projectedValue = computed(() => {
    const plan = this.planState();
    return plan.currentCapital + plan.monthlyContribution * plan.horizonMonths;
  });
  readonly plannedContributions = computed(() => {
    const plan = this.planState();
    return plan.monthlyContribution * plan.horizonMonths;
  });
  readonly currentScenario = computed<PortfolioScenario>(() => ({
    kind: 'current',
    title: 'Current capital',
    amount: this.planState().currentCapital,
    plan: this.planState(),
  }));
  readonly projectedScenario = computed<PortfolioScenario>(() => ({
    kind: 'projected',
    title: 'Projected value',
    amount: this.projectedValue(),
    plan: this.planState(),
  }));
  readonly allocation = DEFAULT_ALLOCATION;

  constructor() {
    effect(() => {
      this.storage.set(PLAN_STORAGE_KEY, this.planState());
    });
  }

  scenario(kind: ScenarioKind): PortfolioScenario {
    return kind === 'projected' ? this.projectedScenario() : this.currentScenario();
  }

  setCurrentCapital(value: number): void {
    this.patch({ currentCapital: clampInteger(value, 100, 50_000) });
  }

  setMonthlyContribution(value: number): void {
    this.patch({ monthlyContribution: clampToStep(value, 0, 2_000, 50) });
  }

  setHorizonMonths(value: number): void {
    this.patch({ horizonMonths: clampInteger(value, 1, 24) });
  }

  analytics(view: AnalyticsView): AnalyticsDataset {
    const plan = this.planState();
    const projected = this.projectedValue();
    const contributions = this.plannedContributions();

    switch (view) {
      case 'funding':
        return {
          label: 'Funding mix',
          total: projected,
          labels: ['Current capital', 'Planned contributions'],
          values: [plan.currentCapital, contributions],
          colors: ['#087bf2', '#73cef5'],
          summaryLabel: 'Planned contributions',
          summaryValue: contributions,
          summaryDetail: `${Math.round((contributions / projected) * 100)}% of projected value`,
        };
      case 'outlook': {
        const labels = [
          'Today',
          ...Array.from({ length: plan.horizonMonths }, (_, index) => `Month ${index + 1}`),
        ];
        const values = [
          plan.currentCapital,
          ...Array.from({ length: plan.horizonMonths }, () => plan.monthlyContribution),
        ];
        return {
          label: 'Contribution outlook',
          total: projected,
          labels,
          values,
          colors: ['#087bf2', '#73cef5', '#9bdcf8', '#5aa8ef', '#4ac9f4', '#b9e8fa'].slice(
            0,
            values.length,
          ),
          summaryLabel: `Month ${plan.horizonMonths} outlook`,
          summaryValue: projected,
          summaryDetail: `${formatMonthCount(plan.horizonMonths)} of planned contributions`,
        };
      }
      case 'allocation':
      default:
        return {
          label: 'Currency allocation',
          total: projected,
          labels: DEFAULT_ALLOCATION.map((item) => item.code),
          values: DEFAULT_ALLOCATION.map((item) => (projected * item.percentage) / 100),
          colors: ['#087bf2', '#4ac9f4', '#98dafa'],
          summaryLabel: 'USD allocation',
          summaryValue: (projected * 50) / 100,
          summaryDetail: '50% of projected value',
        };
    }
  }

  private patch(patch: Partial<Omit<PortfolioPlan, 'version' | 'baseCurrency'>>): void {
    this.planState.update((plan) => ({ ...plan, ...patch }));
  }

  private readPlan(): PortfolioPlan {
    const value = this.storage.get(PLAN_STORAGE_KEY);
    if (!isPortfolioPlan(value)) {
      this.storage.remove(PLAN_STORAGE_KEY);
      return DEFAULT_PLAN;
    }

    return {
      version: 1,
      currentCapital: clampInteger(value.currentCapital, 100, 50_000),
      monthlyContribution: clampToStep(value.monthlyContribution, 0, 2_000, 50),
      horizonMonths: clampInteger(value.horizonMonths, 1, 24),
      baseCurrency: 'USD',
    };
  }
}

function isPortfolioPlan(value: unknown): value is PortfolioPlan {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    candidate['version'] === 1 &&
    candidate['baseCurrency'] === 'USD' &&
    typeof candidate['currentCapital'] === 'number' &&
    typeof candidate['monthlyContribution'] === 'number' &&
    typeof candidate['horizonMonths'] === 'number'
  );
}

function clampInteger(value: number, min: number, max: number): number {
  const safeValue = Number.isFinite(value) ? value : min;
  return Math.min(max, Math.max(min, Math.round(safeValue)));
}

function clampToStep(value: number, min: number, max: number, step: number): number {
  const clamped = clampInteger(value, min, max);
  return Math.round(clamped / step) * step;
}

function formatMonthCount(months: number): string {
  return `${months} ${months === 1 ? 'month' : 'months'}`;
}
