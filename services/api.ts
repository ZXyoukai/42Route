import axios, { AxiosInstance, AxiosError } from 'axios';


const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token and logging
api.interceptors.request.use(
  (config) => {
    // You can add auth token here when implemented
    // const token = await getAuthToken();
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status);
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
      
      // Handle specific error codes
      switch (error.response.status) {
        case 401:
          console.error('Unauthorized - Please login again');
          // Handle logout or token refresh
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error - Please try again later');
          break;
        default:
          console.error('An error occurred');
      }
    } else if (error.request) {
      console.error('❌ Network Error:', error.message);
      console.error('No response received from server. Check your internet connection.');
    } else {
      console.error('❌ Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
