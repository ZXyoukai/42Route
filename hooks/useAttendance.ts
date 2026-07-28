import { useState, useCallback } from 'react';
import { attendanceService } from '../services/attendanceService';
import { extractApiError } from '../services/api';
import { Attendance, ApiError, MarkAttendanceRequest } from '../types/api';

export const useAttendance = () => {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<ApiError | null>(null);

  const fetchTripAttendance = useCallback(async (tripId: string) => {
    try {
      setLoading(true);
      setApiError(null);
      const data = await attendanceService.getTripAttendance(tripId);
      setAttendances(data);
      return data;
    } catch (err) {
      setApiError(extractApiError(err));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const markAttendance = useCallback(async (data: MarkAttendanceRequest) => {
    try {
      setLoading(true);
      setApiError(null);
      return await attendanceService.mark(data);
    } catch (err) {
      setApiError(extractApiError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { attendances, loading, apiError, fetchTripAttendance, markAttendance };
};
