export type ActivityLevel = "normal" | "low" | "none";

export interface Meal {
    type: 'Desayuno' | 'Almuerzo' | 'Cena';
    time: string;
    status: 'Completado' | 'Omitido' | 'Pendiente';
}

export interface Patient {
  patientId: string;
  name: string;
  age: number;
  avatarUrl: string;
  lastMovementTimestamp: string;
  currentRoom: string;
  isMoving: boolean;
  activityLevel: ActivityLevel;
  fallDetected: boolean;
  fallTimestamp: string | null;
  dailyStepCount: number;
  dailyStepGoal: number;
  lastMeal: Meal;
  movementHistory: ActivityLevel[];
  weeklyStepHistory: { day: string; steps: number }[];
  currentRoomTemperature: number;
}

export interface NursingHome {
    id: string;
    name: string;
    patients: Patient[];
}