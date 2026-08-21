import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { SessionStorageService } from '../../core/storage/session-storage.service';
import { PortfolioStore } from './portfolio.store';

interface StorageDouble {
  readonly get: ReturnType<typeof vi.fn>;
  readonly set: ReturnType<typeof vi.fn>;
  readonly remove: ReturnType<typeof vi.fn>;
}

function createStore(initialValue: unknown | null = null): {
  store: PortfolioStore;
  storage: StorageDouble;
} {
  const storage: StorageDouble = {
    get: vi.fn(() => initialValue),
    set: vi.fn(),
    remove: vi.fn(),
  };

  TestBed.configureTestingModule({
    providers: [PortfolioStore, { provide: SessionStorageService, useValue: storage }],
  });

  return { store: TestBed.inject(PortfolioStore), storage };
}

describe('PortfolioStore', () => {
  it('derives projected value without implying market return', () => {
    const { store } = createStore();

    store.setCurrentCapital(1_600);
    store.setMonthlyContribution(100);
    store.setHorizonMonths(5);

    expect(store.projectedValue()).toBe(2_100);
    expect(store.plannedContributions()).toBe(500);
  });

  it('clamps planner values to their safe ranges and steps', () => {
    const { store } = createStore();

    store.setCurrentCapital(999_999);
    store.setMonthlyContribution(76);
    store.setHorizonMonths(0);

    expect(store.plan()).toMatchObject({
      currentCapital: 50_000,
      monthlyContribution: 100,
      horizonMonths: 1,
    });
  });

  it('rejects malformed stored plans and returns to defaults', () => {
    const { store, storage } = createStore({ version: 1, currentCapital: 'not-a-number' });

    expect(store.plan()).toMatchObject({
      currentCapital: 1_600,
      monthlyContribution: 100,
      horizonMonths: 5,
    });
    expect(storage.remove).toHaveBeenCalledWith('blueledger.portfolio-plan.v1');
  });
});
