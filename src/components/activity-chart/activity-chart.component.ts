import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { ActivityLevel } from '../../patient.model';

@Component({
  selector: 'app-activity-chart',
  standalone: true,
  templateUrl: './activity-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityChartComponent {
  history = input.required<ActivityLevel[]>();

  protected barStyles = computed(() => {
    return this.history().map(level => {
      switch(level) {
        case 'normal': return { height: '80%', color: 'bg-green-400' };
        case 'low': return { height: '40%', color: 'bg-yellow-400' };
        case 'none': return { height: '10%', color: 'bg-slate-300' };
        default: return { height: '10%', color: 'bg-slate-300' };
      }
    });
  });

  protected translatedActivity(level: ActivityLevel): string {
    switch (level) {
      case 'normal': return 'Normal';
      case 'low': return 'Baja';
      case 'none': return 'Nula';
      default: return level;
    }
  }
}