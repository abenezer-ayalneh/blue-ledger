import { ChangeDetectionStrategy, Component, computed, signal, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  IonChip,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSegment,
  IonSegmentButton,
  IonSkeletonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowDownOutline, arrowUpOutline, pulseOutline } from 'ionicons/icons';
import { CurrencyCode, ScenarioKind } from '../../../core/models/blue-ledger.models';
import { AppPageHeaderComponent } from '../../../shared/layout/app-page-header.component';
import { BarChartComponent } from '../../../shared/charts/bar-chart.component';
import { DEFAULT_ALLOCATION, PortfolioStore } from '../portfolio.store';
import { FxRatesStore } from '../fx-rates.store';

@Component({
  selector: 'app-currency-page',
  imports: [
    AppPageHeaderComponent,
    BarChartComponent,
    IonChip,
    IonContent,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonSegment,
    IonSegmentButton,
    IonSkeletonText,
  ],
  providers: [FxRatesStore],
  templateUrl: './currency.page.html',
  styleUrl: './currency.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyPage {
  readonly portfolio = inject(PortfolioStore);
  readonly rates = inject(FxRatesStore);

  readonly scenarioKind: ScenarioKind;
  readonly selectedCode = signal<CurrencyCode>('USD');
  readonly scenario = computed(() => this.portfolio.scenario(this.scenarioKind));
  readonly selectedQuote = computed(() => this.rates.quote(this.selectedCode()));
  readonly chartLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  readonly chartValues = computed(() => this.selectedQuote().history);

  constructor() {
    const route = inject(ActivatedRoute);

    this.scenarioKind =
      route.snapshot.paramMap.get('scenario') === 'projected' ? 'projected' : 'current';
    addIcons({ arrowDownOutline, arrowUpOutline, pulseOutline });
  }

  selectCurrency(value: unknown): void {
    if (value === 'USD' || value === 'EUR' || value === 'GBP') {
      this.selectedCode.set(value);
    }
  }

  allocatedAmount(code: CurrencyCode): number {
    const allocation = DEFAULT_ALLOCATION.find((item) => item.code === code);
    return (this.scenario().amount * (allocation?.percentage ?? 0)) / 100;
  }

  convertedAmount(code: CurrencyCode): number {
    return this.allocatedAmount(code) * this.rates.quote(code).rate;
  }

  formatCurrency(value: number, code: CurrencyCode = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 0,
    }).format(value);
  }

  formatRate(value: number): string {
    return value.toFixed(4);
  }
}
