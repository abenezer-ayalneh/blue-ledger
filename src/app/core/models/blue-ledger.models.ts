export type CurrencyCode = 'USD' | 'EUR' | 'GBP';

export type ScenarioKind = 'current' | 'projected';

export type AnalyticsView = 'allocation' | 'funding' | 'outlook';

export interface AuthCredentials {
  readonly username: string;
  readonly password: string;
}

export interface AuthTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
}

export interface AuthenticatedInvestor {
  readonly id: number;
  readonly username: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly image: string;
}

export type AuthStatus = 'checking' | 'anonymous' | 'authenticating' | 'authenticated' | 'error';

export interface PortfolioPlan {
  readonly version: 1;
  readonly currentCapital: number;
  readonly monthlyContribution: number;
  readonly horizonMonths: number;
  readonly baseCurrency: 'USD';
}

export interface PortfolioScenario {
  readonly kind: ScenarioKind;
  readonly title: string;
  readonly amount: number;
  readonly plan: PortfolioPlan;
}

export interface CurrencyAllocation {
  readonly code: CurrencyCode;
  readonly label: string;
  readonly percentage: number;
}

export interface FxQuote {
  readonly code: CurrencyCode;
  readonly rate: number;
  readonly deltaPercent: number;
  readonly history: readonly number[];
  readonly updatedAt: number;
}

export interface AnalyticsDataset {
  readonly label: string;
  readonly total: number;
  readonly labels: readonly string[];
  readonly values: readonly number[];
  readonly colors: readonly string[];
  readonly summaryLabel: string;
  readonly summaryValue: number;
  readonly summaryDetail: string;
}
