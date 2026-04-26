import { useState, useEffect, useCallback } from 'react';
import { routeService } from '../services/routeService';
import { Route, ApiError } from '../types/api';
import { useApiError } from './useApiError';

export interface IUseRoutes {
  routes: Route[];
  loading: boolean;
  error: string | null;
  /** Structured error object for UI-level error screens */
  apiError: ApiError | null;
  fetchRoutes: () => Promise<void>;
  getRouteById: (id: number) => Promise<{}>;
  createRoute: (data: any) => Promise<{}>;
  addStopToRoute: (routeId: number, stopData: any) => Promise<void>;
}

export const useRoutes = (): IUseRoutes => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { apiError, handleError, clearError } = useApiError();

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      setError(null);
      clearError();
      const data = await routeService.getAll();
      setRoutes(data);
    } catch (err: any) {
      const classified = handleError(err);
      setError(classified.userMessage);
    } finally {
      setLoading(false);
    }
  };

  const getRouteById = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      clearError();
      const route = await routeService.getById(id);
      return route;
    } catch (err: any) {
      const classified = handleError(err);
      setError(classified.userMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createRoute = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      clearError();
      const newRoute = await routeService.create(data);
      setRoutes([...routes, newRoute]);
      return newRoute;
    } catch (err: any) {
      const classified = handleError(err);
      setError(classified.userMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addStopToRoute = async (routeId: number, stopData: any) => {
    try {
      setLoading(true);
      setError(null);
      clearError();
      await routeService.addStop(routeId, stopData);
      await fetchRoutes(); // Recarregar rotas
    } catch (err: any) {
      const classified = handleError(err);
      setError(classified.userMessage);
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
    apiError,
    fetchRoutes,
    getRouteById,
    createRoute,
    addStopToRoute,
  };
};
