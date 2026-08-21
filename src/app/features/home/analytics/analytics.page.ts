import { ChangeDetectionStrategy, Component, computed, signal, inject } from '@angular/core';
import {
  IonCard,
  IonChip,
  IonContent,
  IonIcon,
  IonLabel,
  IonNote,
  IonSegment,
  IonSegmentButton,
  IonSkeletonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { analyticsOutline, cashOutline, pieChartOutline } from 'ionicons/icons';
import { AnalyticsView } from '../../../core/models/blue-ledger.models';
import { DoughnutChartComponent } from '../../../shared/charts/doughnut-chart.component';
import { AppPageHeaderComponent } from '../../../shared/layout/app-page-header.component';
import { CountUpComponent } from '../../../shared/ui/count-up.component';
import { PortfolioStore } from '../portfolio.store';

@Component({
  selector: 'app-analytics-page',
  imports: [
    AppPageHeaderComponent,
    CountUpComponent,
    DoughnutChartComponent,
    IonCard,
    IonChip,
    IonContent,
    IonIcon,
    IonLabel,
    IonNote,
    IonSegment,
    IonSegmentButton,
    IonSkeletonText,
  ],
  templateUrl: './analytics.page.html',
  styleUrl: './analytics.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsPage {
  readonly portfolio = inject(PortfolioStore);

  readonly view = signal<AnalyticsView>('funding');
  readonly dataset = computed(() => this.portfolio.analytics(this.view()));

  constructor() {
    addIcons({ analyticsOutline, cashOutline, pieChartOutline });
  }

  selectView(value: unknown): void {
    if (value === 'allocation' || value === 'funding' || value === 'outlook') {
      this.view.set(value);
    }
  }

  percentage(value: number): string {
    return `${Math.round((value / this.dataset().total) * 100)}%`;
  }
}
