import { Component, ChangeDetectionStrategy, inject, signal, computed, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { PatientDataService } from './services/patient-data.service';
import { GeminiService } from './services/gemini.service';

import { PatientListComponent } from './components/patient-list/patient-list.component';
import { StatusCardComponent } from './components/status-card/status-card.component';
import { FloorPlanComponent } from './components/floor-plan/floor-plan.component';
import { ProgressRingComponent } from './components/progress-ring/progress-ring.component';
import { WeeklyStepsChartComponent } from './components/weekly-steps-chart/weekly-steps-chart.component';
import { Patient } from './patient.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, PatientListComponent, StatusCardComponent, FloorPlanComponent, ProgressRingComponent, WeeklyStepsChartComponent],
  providers: [DatePipe],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private patientDataService = inject(PatientDataService);
  private geminiService = inject(GeminiService);
  private datePipe = inject(DatePipe);

  homes = this.patientDataService.homesList;
  selectedHomeId = this.patientDataService.selectedHomeId;
  patients = this.patientDataService.patientsInSelectedHome;
  selectedPatient = this.patientDataService.selectedPatient;
  
  summary = signal<string>('');
  isLoadingSummary = signal<boolean>(false);
  isTyping = signal<boolean>(false);
  private typingInterval: any;

  constructor() {
    effect(() => {
        const patient = this.selectedPatient();
        if (patient) {
            this.generateSummary(patient);
            if (patient.fallDetected) {
                console.log(`Fall detected for ${patient.name}! Triggering alert.`);
            }
        } else {
            this.summary.set('');
        }
    }, { allowSignalWrites: true });
  }

  async generateSummary(patient: Patient) {
    this.isLoadingSummary.set(true);
    this.isTyping.set(false);
    clearInterval(this.typingInterval);
    this.summary.set('');
    const result = await this.geminiService.generatePatientSummary(patient);
    this.isLoadingSummary.set(false);
    this.typeOutSummary(result);
  }
  
  private typeOutSummary(text: string) {
    let i = 0;
    this.isTyping.set(true);
    this.typingInterval = setInterval(() => {
      if (i < text.length) {
        this.summary.update(s => s + text.charAt(i));
        i++;
      } else {
        clearInterval(this.typingInterval);
        this.isTyping.set(false);
      }
    }, 25);
  }

  onSelectHome(event: Event) {
      const homeId = (event.target as HTMLSelectElement).value;
      this.patientDataService.selectHome(homeId);
  }

  onSelectPatient(patientId: string) {
      this.patientDataService.selectPatient(patientId);
  }

  dismissFallAlert() {
    const patientId = this.selectedPatient()?.patientId;
    if (patientId) {
        this.patientDataService.dismissFallAlert(patientId);
    }
  }

  protected movementStatus = computed(() => this.selectedPatient()?.isMoving ? 'En movimiento' : 'Estacionario');
  protected capitalizedActivity = computed(() => {
    const activity = this.selectedPatient()?.activityLevel;
    if (!activity) return '';
    switch (activity) {
      case 'normal': return 'Normal';
      case 'low': return 'Baja';
      case 'none': return 'Nula';
    }
  });
  
  protected formattedFallTimestamp = computed(() => {
    const ts = this.selectedPatient()?.fallTimestamp;
    return ts ? this.datePipe.transform(ts, 'mediumTime') : '';
  });

  protected stepProgress = computed(() => {
    const patient = this.selectedPatient();
    if (!patient || patient.dailyStepGoal === 0) return 0;
    return Math.min(100, (patient.dailyStepCount / patient.dailyStepGoal) * 100);
  });
  
  protected isStepGoalReached = computed(() => {
    const patient = this.selectedPatient();
    if (!patient) return false;
    return patient.dailyStepCount >= patient.dailyStepGoal;
  });
  
  protected stepRingColor = computed(() => {
      return this.isStepGoalReached() ? 'stroke-teal-500' : 'stroke-sky-500';
  });

  protected temperatureColor = computed(() => {
    const temp = this.selectedPatient()?.currentRoomTemperature ?? 21;
    if (temp < 20) return 'text-sky-500';
    if (temp > 25) return 'text-orange-500';
    return 'text-teal-500';
  });

  protected temperatureBgColor = computed(() => {
    const temp = this.selectedPatient()?.currentRoomTemperature ?? 21;
    if (temp < 20) return 'bg-sky-100';
    if (temp > 25) return 'bg-orange-100';
    return 'bg-teal-100';
  });

  protected liveStatusClasses = computed(() => {
    const level = this.selectedPatient()?.activityLevel ?? 'none';
    return {
      'bg-green-400': level === 'normal',
      'bg-yellow-400': level === 'low',
      'bg-slate-400': level === 'none',
      'animate-ping': level === 'normal',
      'animate-pulse-slow': level === 'low'
    };
  });

  // SVG paths for icons
  protected readonly ICONS = {
    location: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z',
    motion: 'M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z',
    activity: 'M3.75 12h.007v.007H3.75V12zm.75.75h.007v.007H4.5v-.007zm.75.75h.007v.007H5.25v-.007zm.75.75h.007v.007H6v-.007zm.75.75h.007v.007H6.75v-.007zm.75.75h.007v.007H7.5v-.007zm.75.75h.007v.007H8.25v-.007zm.75.75h.007v.007H9v-.007zm.75.75h.007v.007H9.75v-.007zm.75.75h.007v.007H10.5v-.007zm.75.75h.007v.007H11.25v-.007zm.75.75h.007v.007H12v-.007zm.75.75h.007v.007H12.75v-.007zm.75.75h.007v.007H13.5v-.007zm.75.75h.007v.007H14.25v-.007zm.75.75h.007v.007H15v-.007zm.75.75h.007v.007H15.75v-.007zm.75.75h.007v.007H16.5v-.007zm.75.75h.007v.007H17.25v-.007zm.75.75h.007v.007H18v-.007zm.75.75h.007v.007H18.75v-.007zm.75.75h.007v.007H19.5v-.007zm.75.75h.007v.007H20.25v-.007zM4.5 6.857A2.25 2.25 0 016.75 4.607a2.25 2.25 0 012.25 2.25v.493a2.25 2.25 0 01-2.25 2.25A2.25 2.25 0 014.5 7.35v-.493zM12.75 6.857A2.25 2.25 0 0115 4.607a2.25 2.25 0 012.25 2.25v.493a2.25 2.25 0 01-2.25 2.25a2.25 2.25 0 01-2.25-2.25v-.493z',
    nutrition: 'M15.362 5.214A.75.75 0 0116.5 5.25h.75a.75.75 0 010 1.5h-.322l-1.01 6.315a2.25 2.25 0 01-2.22 1.935H3.802a2.25 2.25 0 01-2.22-1.935L.572 6.75h-.322a.75.75 0 010-1.5h.75a.75.75 0 011.138.036L3 5.882V5.25a2.25 2.25 0 012.25-2.25h8.25a2.25 2.25 0 012.25 2.25v.632l.464-.668zM6 5.25v.518L4.964 7.5h8.072L11.036 5.75V5.25H6zM4.14 9l.802 5h8.116l.803-5H4.14z',
    temperature: 'M8.25 6.75v9.344a4.125 4.125 0 102.344 0V6.75a2.625 2.625 0 10-2.344 0zM12 12.375a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0zM12 3.75a.75.75 0 01.75.75v6a.75.75 0 01-1.5 0v-6a.75.75 0 01.75-.75z'
  };
}