import { Injectable, signal, computed } from '@angular/core';
import { Patient, ActivityLevel, NursingHome, Meal } from '../patient.model';

const MOCK_DATA: NursingHome[] = [
    {
        id: 'nh-1',
        name: 'Residencia Los Robles',
        patients: [
            {
                patientId: "pat-9f8e7d6c",
                name: "Elena García",
                age: 82,
                avatarUrl: "https://i.pravatar.cc/150?img=24",
                lastMovementTimestamp: new Date().toISOString(),
                currentRoom: "Sala de estar",
                isMoving: true,
                activityLevel: "normal",
                fallDetected: false,
                fallTimestamp: null,
                dailyStepCount: 1450,
                dailyStepGoal: 3000,
                lastMeal: { type: 'Desayuno', time: '08:30', status: 'Completado' },
                movementHistory: ["normal", "normal", "low", "none", "low", "normal", "normal", "low", "normal", "normal", "low", "none", "low", "normal", "normal", "low", "normal", "normal", "low", "none", "low", "normal", "normal", "low"],
                weeklyStepHistory: [{ day: 'Lun', steps: 2800 }, { day: 'Mar', steps: 3100 }, { day: 'Mié', steps: 2500 }, { day: 'Jue', steps: 3500 }, { day: 'Vie', steps: 2900 }, { day: 'Sáb', steps: 3200 }, { day: 'Dom', steps: 1450 }],
                currentRoomTemperature: 22.5
            },
            {
                patientId: "pat-a1b2c3d4",
                name: "Carlos Martínez",
                age: 78,
                avatarUrl: "https://i.pravatar.cc/150?img=60",
                lastMovementTimestamp: new Date().toISOString(),
                currentRoom: "Dormitorio",
                isMoving: false,
                activityLevel: "none",
                fallDetected: false,
                fallTimestamp: null,
                dailyStepCount: 850,
                dailyStepGoal: 2500,
                lastMeal: { type: 'Desayuno', time: '09:00', status: 'Completado' },
                movementHistory: ["low", "low", "none", "none", "low", "normal", "low", "none", "none", "none", "low", "none", "low", "normal", "low", "none", "low", "low", "low", "none", "none", "low", "none", "none"],
                weeklyStepHistory: [{ day: 'Lun', steps: 1200 }, { day: 'Mar', steps: 1500 }, { day: 'Mié', steps: 900 }, { day: 'Jue', steps: 1800 }, { day: 'Vie', steps: 1100 }, { day: 'Sáb', steps: 1300 }, { day: 'Dom', steps: 850 }],
                currentRoomTemperature: 21.0
            },
            {
                patientId: "pat-m4n5u6e7",
                name: "Manuel Pérez",
                age: 88,
                avatarUrl: "https://i.pravatar.cc/150?img=68",
                lastMovementTimestamp: new Date().toISOString(),
                currentRoom: "Dormitorio",
                isMoving: true,
                activityLevel: "low",
                fallDetected: false,
                fallTimestamp: null,
                dailyStepCount: 980,
                dailyStepGoal: 2000,
                lastMeal: { type: 'Almuerzo', time: '13:15', status: 'Completado' },
                movementHistory: ["low", "none", "low", "low", "none", "low", "normal", "low", "none", "low", "low", "none", "low", "normal", "low", "none", "low", "low", "low", "none", "none", "low", "low", "low"],
                weeklyStepHistory: [{ day: 'Lun', steps: 1100 }, { day: 'Mar', steps: 1300 }, { day: 'Mié', steps: 850 }, { day: 'Jue', steps: 1400 }, { day: 'Vie', steps: 1000 }, { day: 'Sáb', steps: 1150 }, { day: 'Dom', steps: 980 }],
                currentRoomTemperature: 21.2
            }
        ]
    },
    {
        id: 'nh-2',
        name: 'Centro Geriátrico El Amanecer',
        patients: [
            {
                patientId: "pat-x9y8z7w6",
                name: "Isabel Torres",
                age: 85,
                avatarUrl: "https://i.pravatar.cc/150?img=31",
                lastMovementTimestamp: new Date().toISOString(),
                currentRoom: "Jardín",
                isMoving: true,
                activityLevel: "low",
                fallDetected: false,
                fallTimestamp: null,
                dailyStepCount: 2100,
                dailyStepGoal: 3500,
                lastMeal: { type: 'Desayuno', time: '08:45', status: 'Completado' },
                movementHistory: ["normal", "low", "low", "none", "low", "normal", "normal", "low", "normal", "low", "low", "none", "low", "normal", "normal", "low", "normal", "low", "low", "none", "low", "normal", "low", "low"],
                weeklyStepHistory: [{ day: 'Lun', steps: 3200 }, { day: 'Mar', steps: 3400 }, { day: 'Mié', steps: 2800 }, { day: 'Jue', steps: 3800 }, { day: 'Vie', steps: 3100 }, { day: 'Sáb', steps: 3500 }, { day: 'Dom', steps: 2100 }],
                currentRoomTemperature: 19.5
            }
        ]
    }
];

@Injectable({
  providedIn: 'root',
})
export class PatientDataService {
  private homes = signal<NursingHome[]>(MOCK_DATA);
  
  selectedHomeId = signal<string>(this.homes()[0].id);
  selectedPatientId = signal<string | null>(this.homes()[0].patients[0].patientId);

  // Computed Selectors
  homesList = computed(() => this.homes().map(h => ({ id: h.id, name: h.name })));
  selectedHome = computed(() => this.homes().find(h => h.id === this.selectedHomeId()));
  patientsInSelectedHome = computed(() => this.selectedHome()?.patients ?? []);
  selectedPatient = computed(() => this.patientsInSelectedHome().find(p => p.patientId === this.selectedPatientId()));
  
  private roomPath = ['Dormitorio', 'Baño', 'Cocina', 'Sala de estar', 'Jardín', 'Sala de estar'];
  private roomTemperatures: { [key: string]: number } = {
    'Sala de estar': 22,
    'Cocina': 24,
    'Dormitorio': 21,
    'Baño': 23,
    'Jardín': 18
  };
  private fallTimers: { [patientId: string]: any } = {};

  constructor() {
    setInterval(() => this.simulateDataUpdate(), 3000);
  }

  selectHome(homeId: string): void {
    this.selectedHomeId.set(homeId);
    const firstPatientId = this.selectedHome()?.patients[0]?.patientId ?? null;
    this.selectedPatientId.set(firstPatientId);
  }

  selectPatient(patientId: string): void {
    this.selectedPatientId.set(patientId);
  }

  dismissFallAlert(patientId: string) {
    clearTimeout(this.fallTimers[patientId]);
    this.updatePatient(patientId, { fallDetected: false, fallTimestamp: null });
  }

  private updatePatient(patientId: string, updates: Partial<Patient>) {
      this.homes.update(homes => 
        homes.map(home => ({
            ...home,
            patients: home.patients.map(p => p.patientId === patientId ? { ...p, ...updates } : p)
        }))
      );
  }

  private simulateDataUpdate(): void {
    const currentHome = this.selectedHome();
    if (!currentHome || currentHome.patients.length === 0) return;

    // Select a random patient from the current home to update
    const patientToUpdate = currentHome.patients[Math.floor(Math.random() * currentHome.patients.length)];
    const { patientId, fallDetected, dailyStepCount, currentRoomTemperature, dailyStepGoal } = patientToUpdate;

    if (fallDetected) return; // Don't update if a fall is active for this patient

    const isMoving = Math.random() > 0.3; // Increased chance of being moving
    const activityLevel: ActivityLevel = isMoving ? (Math.random() > 0.5 ? 'normal' : 'low') : 'none';

    // Only add steps if goal is not yet reached, to make the celebration stick
    const newStepCount = isMoving && dailyStepCount < dailyStepGoal
      ? dailyStepCount + Math.floor(Math.random() * 10) + 5 
      : dailyStepCount;

    const newMovementHistory = [...patientToUpdate.movementHistory];
    newMovementHistory.shift();
    newMovementHistory.push(activityLevel);

    let newCurrentRoom = patientToUpdate.currentRoom;
    let newTemperature = currentRoomTemperature;

    if (isMoving && Math.random() < 0.3) { // Increased chance of moving rooms
      const currentRoomIndex = this.roomPath.indexOf(patientToUpdate.currentRoom);
      const nextRoomIndex = (currentRoomIndex + 1) % this.roomPath.length;
      newCurrentRoom = this.roomPath[nextRoomIndex];
      newTemperature = this.roomTemperatures[newCurrentRoom] + (Math.random() - 0.5); // Set base temp for new room + fluctuation
    } else {
      newTemperature = Math.max(15, Math.min(30, newTemperature + (Math.random() - 0.5) * 0.5)); // Natural fluctuation
    }
    
    let newFallDetected = fallDetected;
    let newFallTimestamp = patientToUpdate.fallTimestamp;
    if (!fallDetected && Math.random() < 0.005) { // Lowered probability for multi-patient
      newFallDetected = true;
      newFallTimestamp = new Date().toISOString();
      this.fallTimers[patientId] = setTimeout(() => {
        this.dismissFallAlert(patientId);
      }, 25000);
    }
    
    const newWeeklyHistory = [...patientToUpdate.weeklyStepHistory];
    newWeeklyHistory[6] = { ...newWeeklyHistory[6], steps: newStepCount };
    
    let lastMeal = patientToUpdate.lastMeal;
    if(Math.random() < 0.02) {
      const mealTypes: Meal['type'][] = ['Desayuno', 'Almuerzo', 'Cena'];
      const currentMealIndex = mealTypes.indexOf(lastMeal.type);
      const nextMeal = mealTypes[(currentMealIndex + 1) % mealTypes.length];
      lastMeal = {
        type: nextMeal,
        time: nextMeal === 'Desayuno' ? '08:30' : nextMeal === 'Almuerzo' ? '13:00' : '19:30',
        status: Math.random() > 0.1 ? 'Completado' : 'Omitido'
      }
    }

    this.updatePatient(patientId, {
      isMoving,
      activityLevel,
      dailyStepCount: newStepCount,
      weeklyStepHistory: newWeeklyHistory,
      movementHistory: newMovementHistory,
      currentRoom: newCurrentRoom,
      currentRoomTemperature: parseFloat(newTemperature.toFixed(1)),
      lastMovementTimestamp: isMoving ? new Date().toISOString() : patientToUpdate.lastMovementTimestamp,
      fallDetected: newFallDetected,
      fallTimestamp: newFallTimestamp,
      lastMeal
    });
  }
}