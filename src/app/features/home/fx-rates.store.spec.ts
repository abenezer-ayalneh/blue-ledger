import { describe, expect, it, vi } from 'vitest';
import { createSimulatedRateState } from './fx-rates.store';

describe('simulated FX rates', () => {
  it('uses deterministic bounded drift for a known tick', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);

    const first = createSimulatedRateState(3);
    const repeat = createSimulatedRateState(3);

    expect(first).toEqual(repeat);
    expect(first.quotes.map((quote) => quote.code)).toEqual(['USD', 'EUR', 'GBP']);
    expect(first.quotes.every((quote) => Math.abs(quote.deltaPercent) <= 0.8)).toBe(true);
    expect(first.quotes.every((quote) => quote.history.length === 7)).toBe(true);

    vi.restoreAllMocks();
  });
});
