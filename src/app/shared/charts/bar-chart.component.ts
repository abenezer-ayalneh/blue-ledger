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
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

@Component({
  selector: 'app-bar-chart',
  template: '<canvas #canvas [attr.aria-label]="label()" role="img"></canvas>',
  styles:
    ':host { display: block; min-height: 220px; } canvas { max-height: 260px; width: 100% !important; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarChartComponent implements AfterViewInit, OnDestroy {
  readonly label = input.required<string>();
  readonly labels = input.required<readonly string[]>();
  readonly values = input.required<readonly number[]>();
  @ViewChild('canvas', { static: true }) private readonly canvas!: ElementRef<HTMLCanvasElement>;
  private chart: Chart<'bar'> | null = null;

  constructor() {
    effect(() => {
      const labels = this.labels();
      const values = this.values();
      if (this.chart) {
        this.chart.data.labels = [...labels];
        this.chart.data.datasets[0]!.data = [...values];
        this.chart.update();
      }
    });
  }

  ngAfterViewInit(): void {
    this.chart = new Chart(this.canvas.nativeElement, {
      type: 'bar',
      data: {
        labels: [...this.labels()],
        datasets: [
          {
            data: [...this.values()],
            backgroundColor: '#087bf2',
            borderRadius: 10,
            borderSkipped: false,
            maxBarThickness: 42,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 720, easing: 'easeOutCubic' },
        plugins: { legend: { display: false }, tooltip: { displayColors: false } },
        scales: {
          x: { grid: { display: false }, border: { display: false }, ticks: { color: '#607392' } },
          y: { display: false, grid: { display: false }, border: { display: false } },
        },
      },
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}
