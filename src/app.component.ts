import { Component, ChangeDetectionStrategy, inject, signal, computed, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { PatientDataService } from './services/patient-data.service';
import { GeminiService } from './services/gemini.service';

import { StatusCardComponent } from './components/status-card/status-card.component';
import { ActivityChartComponent } from './components/activity-chart/activity-chart.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, StatusCardComponent, ActivityChartComponent],
  providers: [DatePipe],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private patientDataService = inject(PatientDataService);
  private geminiService = inject(GeminiService);
  private datePipe = inject(DatePipe);

  patient = this.patientDataService.patientData.asReadonly();
  
  summary = signal<string>('');
  isLoadingSummary = signal<boolean>(true);

  constructor() {
    this.generateSummary();

    // Effect to react to fall detection changes
    effect(() => {
        if (this.patient().fallDetected) {
            console.log('Fall detected! Triggering alert.');
            // In a real app, this would trigger notifications.
            this.generateSummary(); // Regenerate summary on fall
        }
    });
  }

  async generateSummary() {
    this.isLoadingSummary.set(true);
    const result = await this.geminiService.generatePatientSummary(this.patient());
    this.summary.set(result);
    this.isLoadingSummary.set(false);
  }

  protected movementStatus = computed(() => this.patient().isMoving ? 'En movimiento' : 'Estacionario');
  protected capitalizedActivity = computed(() => {
    const activity = this.patient().activityLevel;
    switch (activity) {
      case 'normal': return 'Normal';
      case 'low': return 'Baja';
      case 'none': return 'Nula';
      default:
        return activity.charAt(0).toUpperCase() + activity.slice(1);
    }
  });
  
  protected formattedFallTimestamp = computed(() => {
    const ts = this.patient().fallTimestamp;
    return ts ? this.datePipe.transform(ts, 'mediumTime') : '';
  });

  // SVG paths for icons
  protected readonly ICONS = {
    location: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z',
    motion: 'M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z',
    activity: 'M3.75 12h.007v.007H3.75V12zm.75.75h.007v.007H4.5v-.007zm.75.75h.007v.007H5.25v-.007zm.75.75h.007v.007H6v-.007zm.75.75h.007v.007H6.75v-.007zm.75.75h.007v.007H7.5v-.007zm.75.75h.007v.007H8.25v-.007zm.75.75h.007v.007H9v-.007zm.75.75h.007v.007H9.75v-.007zm.75.75h.007v.007H10.5v-.007zm.75.75h.007v.007H11.25v-.007zm.75.75h.007v.007H12v-.007zm.75.75h.007v.007H12.75v-.007zm.75.75h.007v.007H13.5v-.007zm.75.75h.007v.007H14.25v-.007zm.75.75h.007v.007H15v-.007zm.75.75h.007v.007H15.75v-.007zm.75.75h.007v.007H16.5v-.007zm.75.75h.007v.007H17.25v-.007zm.75.75h.007v.007H18v-.007zm.75.75h.007v.007H18.75v-.007zm.75.75h.007v.007H19.5v-.007zm.75.75h.007v.007H20.25v-.007zM4.5 6.857A2.25 2.25 0 016.75 4.607a2.25 2.25 0 012.25 2.25v.493a2.25 2.25 0 01-2.25 2.25A2.25 2.25 0 014.5 7.35v-.493zM12.75 6.857A2.25 2.25 0 0115 4.607a2.25 2.25 0 012.25 2.25v.493a2.25 2.25 0 01-2.25 2.25a2.25 2.25 0 01-2.25-2.25v-.493z',
    steps: 'M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5'
  };
}