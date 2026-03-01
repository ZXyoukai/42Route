import api from './api';
import { MiniBusStop } from '../types/api';

export const miniBusStopService = {
  // GET /api/minibusstops - Listar todas as paragens
  getAll: async (): Promise<MiniBusStop[]> => {
    const response = await api.get('/minibusstops');
    return response.data;
  },

  // GET /api/minibusstop/{id} - Buscar paragem por ID
  getById: async (id: number): Promise<MiniBusStop> => {
    const response = await api.get(`/minibusstop/${id}`);
    return response.data;
  },

  // POST /api/minibusstop - Criar paragem
  create: async (data: any): Promise<MiniBusStop> => {
    const response = await api.post('/minibusstop', data);
    return response.data;
  },

  // PUT /api/minibusstop/{id} - Atualizar paragem
  update: async (id: number, data: any): Promise<MiniBusStop> => {
    const response = await api.put(`/minibusstop/${id}`, data);
    return response.data;
  },

  // DELETE /api/minibusstop/{id} - Eliminar paragem
  delete: async (id: number): Promise<void> => {
    await api.delete(`/minibusstop/${id}`);
  },
};
