import { DOCUMENT } from '@angular/common';
import { Injectable, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  EMPTY,
  distinctUntilChanged,
  fromEvent,
  map,
  scan,
  startWith,
  switchMap,
  timer,
} from 'rxjs';
import { CurrencyCode, FxQuote } from '../../core/models/blue-ledger.models';

export interface SimulatedRateState {
  readonly tick: number;
  readonly quotes: readonly FxQuote[];
}

const BASE_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
};

@Injectable()
export class FxRatesStore {
  private readonly document = inject(DOCUMENT);

  private readonly rateState = toSignal(
    fromEvent(this.document, 'visibilitychange').pipe(
      startWith(null),
      map(() => this.document.visibilityState !== 'hidden'),
      distinctUntilChanged(),
      switchMap((visible) =>
        visible
          ? timer(0, 4_000).pipe(
              scan((tick) => tick + 1, -1),
              map((tick) => createSimulatedRateState(tick)),
            )
          : EMPTY,
      ),
    ),
    { initialValue: createSimulatedRateState(0) },
  );

  readonly quotes = computed(() => this.rateState().quotes);
  readonly lastUpdated = computed(() => this.rateState().quotes[0]?.updatedAt ?? Date.now());

  quote(code: CurrencyCode): FxQuote {
    return (
      this.rateState().quotes.find((quote) => quote.code === code) ??
      createSimulatedRateState(0).quotes[0]!
    );
  }
}

export function createSimulatedRateState(tick: number): SimulatedRateState {
  const updatedAt = Date.now();
  const quotes = (Object.keys(BASE_RATES) as CurrencyCode[]).map((code, index) => {
    const drift = seededDrift(tick, index);
    const rate = BASE_RATES[code] * (1 + drift);
    const history = Array.from({ length: 7 }, (_, historyIndex) => {
      const historyDrift = seededDrift(tick - 6 + historyIndex, index);
      return Number((BASE_RATES[code] * (1 + historyDrift)).toFixed(4));
    });
    return {
      code,
      rate: Number(rate.toFixed(4)),
      deltaPercent: Number((drift * 100).toFixed(2)),
      history,
      updatedAt,
    } satisfies FxQuote;
  });

  return { tick, quotes };
}

function seededDrift(tick: number, index: number): number {
  return (
    Math.sin((tick + 1) * 1.71 + index * 2.43) * 0.006 + Math.cos((tick + 2) * 0.63 + index) * 0.002
  );
}
