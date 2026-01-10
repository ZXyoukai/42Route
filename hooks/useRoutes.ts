import { useState, useEffect } from 'react';
import { routeService } from '../services/routeService';
import { Route } from '../types/api';

export interface IUseRoutes
{
  routes : Route[],
  loading: boolean,
  error : string | null,
  fetchRoutes : () => Promise<void>,
  getRouteById: (id: number) => Promise<{}>,
  createRoute: (data: any) => Promise<{}>,
  addStopToRoute: (routeId: number, stopData: any) => Promise<void>,
}

export const useRoutes = () : IUseRoutes => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await routeService.getAll();
      setRoutes(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar rotas');
    } finally {
      setLoading(false);
    }
  };

  const getRouteById = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const route = await routeService.getById(id);
      return route;
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar rota');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createRoute = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      const newRoute = await routeService.create(data);
      setRoutes([...routes, newRoute]);
      return newRoute;
    } catch (err: any) {
      setError(err.message || 'Erro ao criar rota');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addStopToRoute = async (routeId: number, stopData: any) => {
    try {
      setLoading(true);
      setError(null);
      await routeService.addStop(routeId, stopData);
      await fetchRoutes(); // Recarregar rotas
    } catch (err: any) {
      setError(err.message || 'Erro ao adicionar paragem');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  return {
    routes,
    loading,
    error,
    fetchRoutes,
    getRouteById,
    createRoute,
    addStopToRoute,
  };
};
