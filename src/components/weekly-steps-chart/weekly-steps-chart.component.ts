import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

interface StepHistory {
  day: string;
  steps: number;
}

@Component({
  selector: 'app-weekly-steps-chart',
  standalone: true,
  templateUrl: './weekly-steps-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyStepsChartComponent {
  history = input.required<StepHistory[]>();

  private maxSteps = computed(() => {
    const steps = this.history().map(h => h.steps);
    return Math.max(...steps, 1); // Avoid division by zero
  });

  protected barStyles = computed(() => {
    const max = this.maxSteps();
    return this.history().map(item => {
      const heightPercent = (item.steps / max) * 100;
      return {
        ...item,
        height: `${Math.max(heightPercent, 5)}%` // min height of 5% for visibility
      };
    });
  });
}