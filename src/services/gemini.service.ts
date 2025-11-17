import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import { Patient } from '../patient.model';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private genAI: GoogleGenAI;
  private apiKey: string;

  constructor() {
    // This is a placeholder for the API key.
    // In a real Applet environment, process.env.API_KEY would be available.
    this.apiKey = (window as any).process?.env?.API_KEY ?? 'YOUR_API_KEY_HERE';
    if (this.apiKey === 'YOUR_API_KEY_HERE') {
      console.warn('Gemini API key not found. Please set the API_KEY environment variable.');
    }
    this.genAI = new GoogleGenAI({ apiKey: this.apiKey });
  }

  async generatePatientSummary(patientData: Patient): Promise<string> {
    if (this.apiKey === 'YOUR_API_KEY_HERE') {
      return Promise.resolve("El resumen de la IA no está disponible. La clave de API no está configurada.");
    }
    
    const prompt = `
      Analiza los siguientes datos de un paciente de edad avanzada y proporciona un resumen conciso 
      y fácil de entender de su estado actual y actividad reciente.
      El resumen debe tener un tono amable y tranquilizador.
      Si se detecta una caída, comienza el resumen destacándola como una alerta urgente.
      De lo contrario, proporciona una actualización general del estado. Menciona su estado nutricional.
      Mantén el resumen en 2-3 frases.

      Datos del Paciente:
      - Nombre: ${patientData.name}
      - Habitación Actual: ${patientData.currentRoom}
      - En Movimiento: ${patientData.isMoving}
      - Nivel de Actividad Actual: ${patientData.activityLevel}
      - Última Comida: ${patientData.lastMeal.type} (${patientData.lastMeal.status})
      - Caída Detectada: ${patientData.fallDetected}
      ${patientData.fallDetected ? `- Hora de la Caída: ${patientData.fallTimestamp}` : ''}
      - Pasos Diarios: ${patientData.dailyStepCount}
      - Tendencia de actividad de las últimas 24 horas: ${patientData.movementHistory.join(', ')}
    `;

    try {
      const response = await this.genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error('Error generating summary with Gemini API:', error);
      return 'No se pudo generar el resumen de IA en este momento. Por favor, inténtalo de nuevo más tarde.';
    }
  }
}