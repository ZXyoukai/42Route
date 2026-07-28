import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { attendanceService } from '../services/attendanceService';
import { Attendance } from '../types/api';

const ACCENT = '#00babc';

// Renovação automática do token (o backend deve emitir tokens com validade curta)
const QR_REFRESH_INTERVAL_MS = 45000;
const LIST_REFRESH_INTERVAL_MS = 15000;

interface AttendanceQRDisplayProps {
  visible: boolean;
  tripId: string;
  driverId: number;
  routeId: number;
  routeName: string;
  onClose: () => void;
}

export const AttendanceQRDisplay = ({
  visible,
  tripId,
  driverId,
  routeId,
  routeName,
  onClose,
}: AttendanceQRDisplayProps) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const mountedRef = useRef(true);

  const fetchQr = useCallback(async () => {
    try {
      const data = await attendanceService.getTripQr(tripId);
      if (!mountedRef.current) return;
      setToken(data.trip_token);
      setUsingFallback(false);
    } catch {
      if (!mountedRef.current) return;
      // Fallback local enquanto o endpoint /trips/{id}/qrcode não existir no backend:
      // o token é o próprio contexto da viagem; o backend valida quando estiver pronto
      setToken(
        JSON.stringify({ trip_id: tripId, driver_id: driverId, route_id: routeId, ts: Date.now() })
      );
      setUsingFallback(true);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [tripId, driverId, routeId]);

  const fetchList = useCallback(async () => {
    try {
      const data = await attendanceService.getTripAttendance(tripId);
      if (mountedRef.current) setAttendances(data);
    } catch {
      // endpoint ainda não disponível no backend — lista fica vazia
    }
  }, [tripId]);

  useEffect(() => {
    mountedRef.current = true;
    if (!visible) return;
    setLoading(true);
    fetchQr();
    fetchList();
    const qrInterval = setInterval(fetchQr, QR_REFRESH_INTERVAL_MS);
    const listInterval = setInterval(fetchList, LIST_REFRESH_INTERVAL_MS);
    return () => {
      mountedRef.current = false;
      clearInterval(qrInterval);
      clearInterval(listInterval);
    };
  }, [visible, fetchQr, fetchList]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 justify-end">
        <View className="bg-slate-800 rounded-t-[24px] px-5 pb-9 pt-3 border-t border-slate-700">
          <View className="w-10 h-1 rounded-full bg-slate-600 self-center mb-4" />

          <View className="flex-row items-center gap-2 mb-1.5">
            <MaterialIcons name="qr-code-2" size={22} color={ACCENT} />
            <Text className="text-white text-[18px] font-bold flex-1">QR de Presença</Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <Ionicons name="close" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <Text className="text-slate-400 text-[13px] mb-4">
            Pede aos cadetes para escanearem este código ao embarcar. Rota: {routeName}
          </Text>

          <View className="items-center py-4">
            {loading && !token ? (
              <ActivityIndicator color={ACCENT} size="large" className="my-16" />
            ) : token ? (
              <View className="bg-white p-4 rounded-2xl">
                <QRCode value={token} size={220} />
              </View>
            ) : null}
          </View>

          {usingFallback && (
            <View className="flex-row items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2 mb-3">
              <Ionicons name="cloud-offline" size={14} color="#f59e0b" />
              <Text className="text-amber-400 text-[11px] flex-1">
                Sem token do servidor — a usar código local da viagem.
              </Text>
            </View>
          )}

          <View className="flex-row items-center justify-between bg-slate-900 rounded-xl px-4 py-3 border border-slate-700">
            <View className="flex-row items-center gap-2">
              <Ionicons name="people" size={16} color={ACCENT} />
              <Text className="text-slate-300 text-[13px]">Presenças registadas</Text>
            </View>
            <Text className="text-[#00babc] text-[16px] font-bold">{attendances.length}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};
