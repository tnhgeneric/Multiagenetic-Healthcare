import axios from 'axios';
import { BACKEND_BASE_URL } from '../config/backendConfig';

const api = axios.create({
    baseURL: BACKEND_BASE_URL,
    timeout: 30000, // 30 second timeout
});

export const getDiagnosisFromSymptoms = async (symptoms: string) => {
    try {
        const response = await api.post('/orchestrate', {
            prompt: symptoms,
            taskType: 'disease_prediction'
        });
        return response.data;
    } catch (error) {
        console.error('Error getting diagnosis:', error);
        throw error;
    }
};