import api from './api';
import { Attendance, MarkAttendanceRequest, TripQrResponse } from '../types/api';

export const attendanceService = {
  // GET /api/trips/{tripId}/qrcode - Token/QR corrente da viagem (motorista)
  getTripQr: async (tripId: string): Promise<TripQrResponse> => {
    const response = await api.get(`/trips/${tripId}/qrcode`);
    return response.data;
  },

  // POST /api/attendance - Registar presença do cadete (scan do QR)
  mark: async (data: MarkAttendanceRequest): Promise<Attendance> => {
    const response = await api.post('/attendance', data);
    return response.data;
  },

  // GET /api/trips/{tripId}/attendance - Lista de presenças da viagem
  getTripAttendance: async (tripId: string): Promise<Attendance[]> => {
    const response = await api.get(`/trips/${tripId}/attendance`);
    return response.data;
  },
};
