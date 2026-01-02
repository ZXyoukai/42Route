import api from './api';
import { Route } from '../types/api';

export const routeService = {
  // GET /api/routes - Listar todas as rotas
  getAll: async (): Promise<Route[]> => {
    const response = await api.get('/routes');
    return response.data;
  },

  // GET /api/route/{id} - Buscar rota por ID
  getById: async (id: number): Promise<Route> => {
    const response = await api.get(`/route/${id}`);
    return response.data;
  },

  // POST /api/routes - Criar rota
  create: async (data: any): Promise<Route> => {
    const response = await api.post('/routes', data);
    return response.data;
  },

  // POST /api/routes/{id}/stops - Adicionar paragem à rota
  addStop: async (routeId: number, stopData: any): Promise<any> => {
    const response = await api.post(`/routes/${routeId}/stops`, stopData);
    return response.data;
  },
};
