import { Injectable, signal } from '@angular/core';
import { Patient, ActivityLevel } from '../patient.model';

@Injectable({
  providedIn: 'root',
})
export class PatientDataService {
  // Using a signal to hold the patient data.
  patientData = signal<Patient>({
    patientId: "pat-9f8e7d6c-5b4a-4c3d-2e1f-0a9b8c7d6e5f",
    lastMovementTimestamp: "2025-11-17T10:14:30.456Z",
    currentRoom: "Sala de estar",
    isMoving: true,
    activityLevel: "normal",
    fallDetected: false,
    fallTimestamp: null,
    dailyStepCount: 1450,
    movementHistory: ["normal", "normal", "low", "none", "low", "normal", "normal", "low",
    "normal", "normal", "low", "none", "low", "normal", "normal", "low", "normal", "normal", "low",
    "none", "low", "normal", "normal", "low"]
  });
  
  private rooms = ['Sala de estar', 'Cocina', 'Dormitorio', 'Baño', 'Pasillo'];
  private isFallActive = false;

  constructor() {
    // Simulate real-time data updates every 3 seconds.
    setInterval(() => this.simulateDataUpdate(), 3000);
  }

  private simulateDataUpdate(): void {
    if (this.isFallActive) {
      return; // Pause simulation during an active fall alert
    }

    this.patientData.update(currentData => {
      const isMoving = Math.random() > 0.4;
      const activityLevel: ActivityLevel = isMoving ? (Math.random() > 0.5 ? 'normal' : 'low') : 'none';

      const newStepCount = isMoving 
        ? currentData.dailyStepCount + Math.floor(Math.random() * 10) + 5 
        : currentData.dailyStepCount;

      const newMovementHistory = [...currentData.movementHistory];
      newMovementHistory.shift();
      newMovementHistory.push(activityLevel);

      let newCurrentRoom = currentData.currentRoom;
      // Change room occasionally if moving
      if (isMoving && Math.random() < 0.1) {
        const currentRoomIndex = this.rooms.indexOf(currentData.currentRoom);
        const nextRoomIndex = (currentRoomIndex + 1) % this.rooms.length;
        newCurrentRoom = this.rooms[nextRoomIndex];
      }

      // Simulate a fall with a very low probability (e.g., ~2% chance every 3s)
      let fallDetected = currentData.fallDetected;
      let fallTimestamp = currentData.fallTimestamp;
      if (Math.random() < 0.02) {
        fallDetected = true;
        fallTimestamp = new Date().toISOString();
        this.isFallActive = true;
        // The fall alert will stay for 20 seconds, then reset.
        setTimeout(() => {
          this.patientData.update(data => ({ ...data, fallDetected: false, fallTimestamp: null }));
          this.isFallActive = false; // Resume simulation
        }, 20000);
      }

      return {
        ...currentData,
        isMoving,
        activityLevel,
        dailyStepCount: newStepCount,
        movementHistory: newMovementHistory,
        currentRoom: newCurrentRoom,
        lastMovementTimestamp: isMoving ? new Date().toISOString() : currentData.lastMovementTimestamp,
        fallDetected,
        fallTimestamp,
      };
    });
  }
}