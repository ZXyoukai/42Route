import { useState, useEffect } from 'react';
import { miniBusStopService } from '../services/miniBusStopService';
import { MiniBusStop } from '../types/api';

export const useMiniBusStops = () => {
  const [stops, setStops] = useState<MiniBusStop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStops = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await miniBusStopService.getAll();
      setStops(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar paragens');
    } finally {
      setLoading(false);
    }
  };

  const createStop = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      const newStop = await miniBusStopService.create(data);
      setStops([...stops, newStop]);
      return newStop;
    } catch (err: any) {
      setError(err.message || 'Erro ao criar paragem');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateStop = async (id: number, data: any) => {
    try {
      setLoading(true);
      setError(null);
      const updatedStop = await miniBusStopService.update(id, data);
      setStops(stops.map((s) => (s.id === id ? updatedStop : s)));
      return updatedStop;
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar paragem');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteStop = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await miniBusStopService.delete(id);
      setStops(stops.filter((s) => s.id !== id));
    } catch (err: any) {
      setError(err.message || 'Erro ao eliminar paragem');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStops();
  }, []);

  return {
    stops,
    loading,
    error,
    fetchStops,
    createStop,
    updateStop,
    deleteStop,
  };
};
