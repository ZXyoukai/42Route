import { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { Admin, CreateAdminRequest, UpdateAdminRequest } from '../types/api';

export const useAdmins = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getAll();
      setAdmins(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar administradores');
    } finally {
      setLoading(false);
    }
  };

  const createAdmin = async (data: CreateAdminRequest) => {
    try {
      setLoading(true);
      setError(null);
      const newAdmin = await adminService.create(data);
      setAdmins([...admins, newAdmin]);
      return newAdmin;
    } catch (err: any) {
      setError(err.message || 'Erro ao criar administrador');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAdmin = async (id: number, data: UpdateAdminRequest) => {
    try {
      setLoading(true);
      setError(null);
      const updatedAdmin = await adminService.update(id, data);
      setAdmins(admins.map((a) => (a.id === id ? updatedAdmin : a)));
      return updatedAdmin;
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar administrador');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAdmin = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await adminService.delete(id);
      setAdmins(admins.filter((a) => a.id !== id));
    } catch (err: any) {
      setError(err.message || 'Erro ao eliminar administrador');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  return {
    admins,
    loading,
    error,
    fetchAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin,
  };
};
