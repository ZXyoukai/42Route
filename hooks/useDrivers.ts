import { useState, useEffect } from 'react';
import { driverService } from '../services/driverService';
import {
  Driver,
  CreateDriverRequest,
  UpdateDriverRequest,
  UpdateDriverLocationRequest,
} from '../types/api';

export const useDrivers = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await driverService.getAll();
      setDrivers(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar motoristas');
    } finally {
      setLoading(false);
    }
  };

  const createDriver = async (data: CreateDriverRequest) => {
    try {
      setLoading(true);
      setError(null);
      const newDriver = await driverService.create(data);
      setDrivers([...drivers, newDriver]);
      return newDriver;
    } catch (err: any) {
      setError(err.message || 'Erro ao criar motorista');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateDriver = async (id: number, data: UpdateDriverRequest) => {
    try {
      setLoading(true);
      setError(null);
      const updatedDriver = await driverService.update(id, data);
      setDrivers(drivers.map((d) => (d.id === id ? updatedDriver : d)));
      return updatedDriver;
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar motorista');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteDriver = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await driverService.delete(id);
      setDrivers(drivers.filter((d) => d.id !== id));
    } catch (err: any) {
      setError(err.message || 'Erro ao eliminar motorista');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateDriverLocation = async (
    id: number,
    location: UpdateDriverLocationRequest
  ) => {
    try {
      await driverService.updateLocation(id, location);
    } catch (err: any) {
      console.error('Erro ao atualizar localização:', err);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  return {
    drivers,
    loading,
    error,
    fetchDrivers,
    createDriver,
    updateDriver,
    deleteDriver,
    updateDriverLocation,
  };
};
