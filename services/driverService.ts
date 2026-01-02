import api from './api';
import {
  Driver,
  CreateDriverRequest,
  UpdateDriverRequest,
  UpdateDriverLocationRequest,
  AssignRouteRequest,
} from '../types/api';

export const driverService = {
  // GET /api/drivers - Listar todos os motoristas
  getAll: async (): Promise<Driver[]> => {
    const response = await api.get('/drivers');
    return response.data;
  },

  // GET /api/driver/{id} - Buscar motorista por ID
  getById: async (id: number): Promise<Driver> => {
    const response = await api.get(`/driver/${id}`);
    return response.data;
  },

  // POST /api/driver - Criar motorista
  create: async (data: CreateDriverRequest): Promise<Driver> => {
    const response = await api.post('/driver', data);
    return response.data;
  },

  // PUT /api/driver/{id} - Atualizar motorista
  update: async (id: number, data: UpdateDriverRequest): Promise<Driver> => {
    const response = await api.put(`/driver/${id}`, data);
    return response.data;
  },

  // DELETE /api/driver/{id} - Eliminar motorista
  delete: async (id: number): Promise<void> => {
    await api.delete(`/driver/${id}`);
  },

  // PUT /api/driver/location/socket/{id} - Atualizar localização do motorista
  updateLocation: async (
    id: number,
    location: UpdateDriverLocationRequest
  ): Promise<any> => {
    const response = await api.put(`/driver/location/socket/${id}`, location);
    return response.data;
  },

  // POST /api/driver/assign/route/{id} - Atribuir rota ao motorista
  assignRoute: async (id: number, data: AssignRouteRequest): Promise<any> => {
    const response = await api.post(`/driver/assign/route/${id}`, data);
    return response.data;
  },

  // DELETE /api/driver/leave/route/{id} - Remover motorista da rota
  leaveRoute: async (id: number): Promise<any> => {
    const response = await api.delete(`/driver/leave/route/${id}`);
    return response.data;
  },
};
