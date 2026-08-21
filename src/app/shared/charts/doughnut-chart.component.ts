import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  effect,
  input,
} from '@angular/core';
import { ArcElement, Chart, DoughnutController, Legend, Tooltip } from 'chart.js';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

@Component({
  selector: 'app-doughnut-chart',
  template: '<canvas #canvas [attr.aria-label]="label()" role="img"></canvas>',
  styles:
    ':host { display: block; min-height: 300px; } canvas { max-height: 360px; width: 100% !important; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoughnutChartComponent implements AfterViewInit, OnDestroy {
  readonly label = input.required<string>();
  readonly labels = input.required<readonly string[]>();
  readonly values = input.required<readonly number[]>();
  readonly colors = input.required<readonly string[]>();
  @ViewChild('canvas', { static: true }) private readonly canvas!: ElementRef<HTMLCanvasElement>;
  private chart: Chart<'doughnut'> | null = null;

  constructor() {
    effect(() => {
      if (this.chart) {
        this.chart.data.labels = [...this.labels()];
        this.chart.data.datasets[0]!.data = [...this.values()];
        this.chart.data.datasets[0]!.backgroundColor = [...this.colors()];
        this.chart.update();
      }
    });
  }

  ngAfterViewInit(): void {
    this.chart = new Chart(this.canvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: [...this.labels()],
        datasets: [
          {
            data: [...this.values()],
            backgroundColor: [...this.colors()],
            borderColor: '#ffffff',
            borderWidth: 5,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '64%',
        animation: { animateRotate: true, duration: 820, easing: 'easeOutCubic' },
        plugins: { legend: { display: false }, tooltip: { displayColors: false } },
      },
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}
