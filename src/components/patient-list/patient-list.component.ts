import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Patient, ActivityLevel } from '../../patient.model';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientListComponent {
  patients = input.required<Patient[]>();
  selectedPatientId = input<string | null>();
  patientSelected = output<string>();

  selectPatient(patientId: string) {
    this.patientSelected.emit(patientId);
  }

  protected activityColorClass(level: ActivityLevel): string {
    switch (level) {
      case 'normal':
        return 'bg-teal-400';
      case 'low':
        return 'bg-yellow-400';
      case 'none':
        return 'bg-slate-400';
      default:
        return 'bg-slate-400';
    }
  }
}