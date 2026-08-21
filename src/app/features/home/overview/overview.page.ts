import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonContent,
  IonIcon,
  IonInput,
  IonNote,
  IonRange,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowForwardOutline,
  calendarOutline,
  cashOutline,
  trendingUpOutline,
} from 'ionicons/icons';
import { AppPageHeaderComponent } from '../../../shared/layout/app-page-header.component';
import { CountUpComponent } from '../../../shared/ui/count-up.component';
import { PortfolioStore } from '../portfolio.store';

@Component({
  selector: 'app-overview-page',
  imports: [
    AppPageHeaderComponent,
    CountUpComponent,
    IonButton,
    IonCard,
    IonContent,
    IonIcon,
    IonInput,
    IonNote,
    IonRange,
    RouterLink,
  ],
  templateUrl: './overview.page.html',
  styleUrl: './overview.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewPage {
  readonly portfolio = inject(PortfolioStore);

  readonly capitalDraft = signal('1600');
  readonly capitalError = signal<string | null>(null);

  constructor() {
    this.capitalDraft.set(this.portfolio.plan().currentCapital.toString());
    addIcons({ arrowForwardOutline, calendarOutline, cashOutline, trendingUpOutline });
  }

  onCapitalInput(event: Event): void {
    this.capitalDraft.set(readIonValue(event));
    this.capitalError.set(null);
  }

  commitCapital(): void {
    const parsed = Number(this.capitalDraft().replaceAll(',', ''));
    if (!Number.isFinite(parsed) || parsed < 100 || parsed > 50_000) {
      this.capitalError.set('Use a whole-dollar starting capital between $100 and $50,000.');
      return;
    }

    this.portfolio.setCurrentCapital(parsed);
    this.capitalDraft.set(this.portfolio.plan().currentCapital.toString());
  }

  onContributionChange(event: Event): void {
    const value = readIonNumber(event);
    if (value !== null) {
      this.portfolio.setMonthlyContribution(value);
    }
  }

  onContributionKeydown(event: KeyboardEvent): void {
    const nextValue = rangeKeyboardValue(
      event.key,
      this.portfolio.plan().monthlyContribution,
      0,
      2_000,
      50,
    );
    if (nextValue === null) {
      return;
    }

    event.preventDefault();
    this.portfolio.setMonthlyContribution(nextValue);
  }

  onHorizonChange(event: Event): void {
    const value = readIonNumber(event);
    if (value !== null) {
      this.portfolio.setHorizonMonths(value);
    }
  }

  onHorizonKeydown(event: KeyboardEvent): void {
    const nextValue = rangeKeyboardValue(event.key, this.portfolio.plan().horizonMonths, 1, 24, 1);
    if (nextValue === null) {
      return;
    }

    event.preventDefault();
    this.portfolio.setHorizonMonths(nextValue);
  }
}

function readIonValue(event: Event): string {
  const detail = event as CustomEvent<{ readonly value?: string | null }>;
  return detail.detail.value ?? '';
}

function readIonNumber(event: Event): number | null {
  const detail = event as CustomEvent<{
    readonly value?: number | { readonly lower: number; readonly upper: number };
  }>;
  return typeof detail.detail.value === 'number' ? detail.detail.value : null;
}

function rangeKeyboardValue(
  key: string,
  currentValue: number,
  minimum: number,
  maximum: number,
  step: number,
): number | null {
  switch (key) {
    case 'ArrowUp':
    case 'ArrowRight':
      return Math.min(maximum, currentValue + step);
    case 'ArrowDown':
    case 'ArrowLeft':
      return Math.max(minimum, currentValue - step);
    case 'Home':
      return minimum;
    case 'End':
      return maximum;
    default:
      return null;
  }
}
