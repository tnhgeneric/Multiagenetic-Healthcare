import axios, { AxiosInstance } from 'axios';
import { BACKEND_BASE_URL } from '../config/backendConfig';

const api: AxiosInstance = axios.create({
  baseURL: BACKEND_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Types for requests/responses (lightweight)
export interface PatientJourneyRequest {
  symptoms: string[];
}

export interface PatientJourneyResponse {
  result?: {
    journey_steps: string[];
    confidence: number;
  };
  error?: string;
}

export interface DiseasePredictionRequest {
  symptoms: string[];
}

export interface DiseasePredictionResponse {
  result?: {
    predicted_diseases: string[];
    confidence: number;
  };
  error?: string;
}

export async function callPatientJourney(payload: PatientJourneyRequest): Promise<PatientJourneyResponse> {
  const resp = await api.post<PatientJourneyResponse>('/patient_journey', payload);
  return resp.data;
}

export async function callPredictDisease(payload: DiseasePredictionRequest): Promise<DiseasePredictionResponse> {
  const resp = await api.post<DiseasePredictionResponse>('/predict_disease', payload);
  return resp.data;
}

export async function callOrchestrate(mcpAclJson: any): Promise<any> {
  const resp = await api.post('/orchestrate', mcpAclJson);
  return resp.data;
}

export async function callChatOrchestrate(payload: { prompt: string; user_id: string; session_id: string; workflow: string; }) {
  const resp = await api.post('/chat_orchestrate', payload);
  return resp.data;
}

export default api;
