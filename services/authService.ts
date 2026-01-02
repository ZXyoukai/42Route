import api from './api';

export const authService = {
  // GET /api/auth/42/login - Iniciar login OAuth 42
  login42: async (): Promise<any> => {
    const response = await api.get('/auth/42/login');
    return response.data;
  },

  // GET /api/auth/42/callback - Callback OAuth 42
  callback42: async (params: any): Promise<any> => {
    const response = await api.get('/auth/42/callback', { params });
    return response.data;
  },
};
