import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  effect,
  input,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-count-up',
  template: '{{ display() }}',
  styles: ':host { font-variant-numeric: tabular-nums; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountUpComponent implements OnDestroy {
  readonly value = input.required<number>();
  readonly currency = input(true);

  private readonly renderedValue = signal(0);
  private frameId: number | null = null;
  private previousValue = 0;

  readonly display = computed(() => {
    const value = this.renderedValue();
    return this.currency()
      ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        }).format(value)
      : new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
  });

  constructor() {
    effect(() => {
      this.animateTo(this.value());
    });
  }

  ngOnDestroy(): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  private animateTo(target: number): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
    }

    const reducedMotion =
      globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (reducedMotion) {
      this.renderedValue.set(target);
      this.previousValue = target;
      return;
    }

    const start = this.previousValue;
    const duration = 520;
    const startedAt = performance.now();
    const frame = (now: number): void => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = start + (target - start) * eased;
      this.renderedValue.set(value);
      if (progress < 1) {
        this.frameId = requestAnimationFrame(frame);
      } else {
        this.previousValue = target;
        this.frameId = null;
      }
    };

    this.frameId = requestAnimationFrame(frame);
  }
}
