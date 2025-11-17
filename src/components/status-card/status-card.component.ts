import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-status-card',
  standalone: true,
  templateUrl: './status-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusCardComponent {
  label = input.required<string>();
  value = input.required<string | number>();
  iconPath = input.required<string>(); // SVG path data
  colorClass = input<string>('text-gray-500'); // e.g., 'text-blue-500'
  bgColorClass = input<string>('bg-gray-100'); // e.g., 'bg-blue-100'
  subtitle = input<string>();
}