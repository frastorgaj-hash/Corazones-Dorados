export type ActivityLevel = "normal" | "low" | "none";

export interface Patient {
  patientId: string;
  lastMovementTimestamp: string;
  currentRoom: string;
  isMoving: boolean;
  activityLevel: ActivityLevel;
  fallDetected: boolean;
  fallTimestamp: string | null;
  dailyStepCount: number;
  movementHistory: ActivityLevel[];
}