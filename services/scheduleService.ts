import api from './api';

export interface ScheduleResponse {
  id: number;
  routeId: number;
  routeName: string;
  departureTime: string;
  arrivalTime: string;
  durationMin: number;
  dayType: string;
  shift: string;
  isActive: boolean;
}

export const scheduleService = {
  /** GET /api/schedules — list all active schedules */
  getAll: async (): Promise<ScheduleResponse[]> => {
    const response = await api.get('/schedules');
    return response.data;
  },

  /** GET /api/schedules?route_id=X — list schedules for a specific route */
  getByRoute: async (routeId: number): Promise<ScheduleResponse[]> => {
    const response = await api.get(`/schedules?route_id=${routeId}`);
    return response.data;
  },
};
