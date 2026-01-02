import api from './api';
import { Cadete, CreateCadeteRequest, UpdateCadeteRequest } from '../types/api';

export const cadeteService = {
  // GET /api/cadetes - Listar todos os cadetes
  getAll: async (): Promise<Cadete[]> => {
    const response = await api.get('/cadetes');
    return response.data;
  },

  // GET /api/cadetes/{id} - Buscar cadete por ID
  getById: async (id: number): Promise<Cadete> => {
    const response = await api.get(`/cadetes/${id}`);
    return response.data;
  },

  // POST /api/cadete - Criar cadete
  create: async (data: CreateCadeteRequest): Promise<Cadete> => {
    const response = await api.post('/cadete', data);
    return response.data;
  },

  // PUT /api/cadetes/{id} - Atualizar cadete
  update: async (id: number, data: UpdateCadeteRequest): Promise<Cadete> => {
    const response = await api.put(`/cadetes/${id}`, data);
    return response.data;
  },

  // DELETE /api/cadetes/{id} - Eliminar cadete
  delete: async (id: number): Promise<void> => {
    await api.delete(`/cadetes/${id}`);
  },

  // GET /api/cadete/route/informations/{id} - Obter informações da rota do cadete
  getRouteInformations: async (id: number): Promise<any> => {
    const response = await api.get(`/cadete/route/informations/${id}`);
    return response.data;
  },
};
