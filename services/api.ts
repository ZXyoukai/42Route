import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV_CONFIG, API_FULL_URL } from '../config/environment';
import { classifyError, ApiError } from '../types/api';

// Use a configuração centralizada
const API_BASE_URL = ENV_CONFIG.API_BASE_URL;

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: API_FULL_URL,
  timeout: ENV_CONFIG.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

if (ENV_CONFIG.DEBUG_MODE) {
  console.log('[API] Configurado com baseURL:', API_FULL_URL);
}

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (ENV_CONFIG.DEBUG_MODE) {
      console.log(`[API] → ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    // Silent — no console.error to avoid Expo crashes
    return Promise.reject(error);
  }
);

// Response interceptor — silent error handling (no console.error)
api.interceptors.response.use(
  (response) => {
    if (ENV_CONFIG.DEBUG_MODE) {
      console.log(`[API] ← ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    }
    return response;
  },
  (error: AxiosError) => {
    // Classify the error into a typed ApiError for upstream consumers
    const apiError = classifyError(error);

    // Attach the classified error to the Axios error for hooks to consume
    (error as any)._apiError = apiError;

    // Silent debug log instead of console.error (prevents Expo crashes)
    if (ENV_CONFIG.DEBUG_MODE) {
      console.log(`[API] ✗ ${apiError.type}: ${apiError.technicalMessage}`);
    }

    return Promise.reject(error);
  }
);

/**
 * Extract the classified ApiError from a caught Axios error.
 * Falls back to classifyError() if the interceptor didn't attach one.
 */
export function extractApiError(err: any): ApiError {
  return err?._apiError ?? classifyError(err);
}

export default api;
