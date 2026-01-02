import api from './api';
import { Admin, CreateAdminRequest, UpdateAdminRequest } from '../types/api';

export const adminService = {
  // GET /api/admins - Listar todos os administradores
  getAll: async (): Promise<Admin[]> => {
    const response = await api.get('/admins');
    return response.data;
  },

  // GET /api/admins/{id} - Buscar administrador por ID
  getById: async (id: number): Promise<Admin> => {
    const response = await api.get(`/admins/${id}`);
    return response.data;
  },

  // POST /api/admin - Criar administrador
  create: async (data: CreateAdminRequest): Promise<Admin> => {
    const response = await api.post('/admin', data);
    return response.data;
  },

  // PUT /api/admins/{id} - Atualizar administrador
  update: async (id: number, data: UpdateAdminRequest): Promise<Admin> => {
    const response = await api.put(`/admins/${id}`, data);
    return response.data;
  },

  // DELETE /api/admins/{id} - Eliminar administrador
  delete: async (id: number): Promise<void> => {
    await api.delete(`/admins/${id}`);
  },
};
