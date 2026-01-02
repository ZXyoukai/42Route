import { useState, useEffect } from 'react';
import { cadeteService } from '../services/cadeteService';
import { Cadete, CreateCadeteRequest, UpdateCadeteRequest } from '../types/api';

export const useCadetes = () => {
  const [cadetes, setCadetes] = useState<Cadete[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCadetes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await cadeteService.getAll();
      setCadetes(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar cadetes');
    } finally {
      setLoading(false);
    }
  };

  const createCadete = async (data: CreateCadeteRequest) => {
    try {
      setLoading(true);
      setError(null);
      const newCadete = await cadeteService.create(data);
      setCadetes([...cadetes, newCadete]);
      return newCadete;
    } catch (err: any) {
      setError(err.message || 'Erro ao criar cadete');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCadete = async (id: number, data: UpdateCadeteRequest) => {
    try {
      setLoading(true);
      setError(null);
      const updatedCadete = await cadeteService.update(id, data);
      setCadetes(cadetes.map((c) => (c.id === id ? updatedCadete : c)));
      return updatedCadete;
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar cadete');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCadete = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await cadeteService.delete(id);
      setCadetes(cadetes.filter((c) => c.id !== id));
    } catch (err: any) {
      setError(err.message || 'Erro ao eliminar cadete');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCadetes();
  }, []);

  return {
    cadetes,
    loading,
    error,
    fetchCadetes,
    createCadete,
    updateCadete,
    deleteCadete,
  };
};
