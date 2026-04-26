import { useState, useEffect } from 'react';
import { scheduleService, ScheduleResponse } from '../services/scheduleService';
import { ApiError } from '../types/api';
import { useApiError } from './useApiError';

export interface IUseSchedules {
  schedules: ScheduleResponse[];
  loading: boolean;
  error: string | null;
  apiError: ApiError | null;
  fetchSchedules: () => Promise<void>;
}

export const useSchedules = (): IUseSchedules => {
  const [schedules, setSchedules] = useState<ScheduleResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { apiError, handleError, clearError } = useApiError();

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      clearError();
      const data = await scheduleService.getAll();
      setSchedules(data);
    } catch (err: any) {
      const classified = handleError(err);
      setError(classified.userMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return {
    schedules,
    loading,
    error,
    apiError,
    fetchSchedules,
  };
};
