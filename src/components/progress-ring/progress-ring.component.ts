import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

@Component({
  selector: 'app-progress-ring',
  standalone: true,
  templateUrl: './progress-ring.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressRingComponent {
  progress = input.required<number>(); // 0-100
  strokeWidth = input<number>(12);
  radius = input<number>(80);
  color = input<string>('stroke-amber-500');

  protected normalizedRadius = computed(() => this.radius() - this.strokeWidth() * 2);
  protected circumference = computed(() => this.normalizedRadius() * 2 * Math.PI);
  
  protected strokeDashoffset = computed(() => {
    return this.circumference() - (this.progress() / 100) * this.circumference();
  });
}