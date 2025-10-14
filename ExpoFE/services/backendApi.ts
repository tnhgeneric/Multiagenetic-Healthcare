import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { BACKEND_BASE_URL } from '../config/backendConfig';

// Extend axios config type
interface RetryConfig extends InternalAxiosRequestConfig {
  retry?: number;
  retryDelay?: number;
}

// Create axios retry interceptor
const axiosRetry = async (error: AxiosError) => {
  const config = error.config as RetryConfig;
  if (!config || config.retry === undefined || config.retry <= 0) {
    return Promise.reject(error);
  }
  config.retry -= 1;
  const delayRetry = new Promise(resolve => setTimeout(resolve, config.retryDelay || 1000));
  await delayRetry;
  return axios(config);
};

const api: AxiosInstance = axios.create({
  baseURL: BACKEND_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  maxContentLength: Infinity,
  maxBodyLength: Infinity
});

// Add request interceptor to configure retry
api.interceptors.request.use((config) => {
  const retryConfig = config as RetryConfig;
  retryConfig.retry = 3;  // Number of retries
  retryConfig.retryDelay = 1000;  // Delay between retries in ms
  return config;
});

// Add response interceptor for retries
api.interceptors.response.use(undefined, axiosRetry);

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
  // Log the full URL we're trying to access
  console.log('Attempting to connect to:', `${BACKEND_BASE_URL}/orchestrate`);
  
  // Convert chat payload to MCP format
  const mcpPayload = {
    mcp_acl: {
      agents: ["symptom_analyzer", "disease_prediction"],
      workflow: "medical_diagnosis",
      actions: [
        {
          agent: "symptom_analyzer",
          action: "analyze_symptoms",
          params: {
            symptoms_text: payload.prompt
          }
        },
        {
          agent: "disease_prediction",
          action: "predict_disease",
          params: {
            symptoms: []  // Will be populated from symptom analyzer's output
          }
        }
      ],
      data_flow: [
        {
          from: "symptom_analyzer",
          to: "disease_prediction",
          data: "structured_symptoms"
        }
      ]
    }
  };
  const resp = await api.post('/orchestrate', mcpPayload);
  return resp.data;
}

export default api;
