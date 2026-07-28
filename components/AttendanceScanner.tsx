import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { attendanceService } from '../services/attendanceService';
import { extractApiError } from '../services/api';

const ACCENT = '#00babc';

type ScanState = 'scanning' | 'submitting' | 'success' | 'error';

interface AttendanceScannerProps {
  onBack: () => void;
}

export const AttendanceScanner = ({ onBack }: AttendanceScannerProps) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanState, setScanState] = useState<ScanState>('scanning');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const scannedRef = useRef(false);

  const handleScanned = async ({ data }: { data: string }) => {
    if (scannedRef.current) return;
    scannedRef.current = true;
    setScanState('submitting');

    try {
      const rawUser = await AsyncStorage.getItem('user');
      const user = rawUser ? JSON.parse(rawUser) : null;
      if (!user?.id) {
        throw new Error('Sessão inválida. Faz login novamente.');
      }

      let lat: number | undefined;
      let lng: number | undefined;
      try {
        const pos =
          (await Location.getLastKnownPositionAsync()) ??
          (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
        lat = pos?.coords.latitude;
        lng = pos?.coords.longitude;
      } catch {
        // posição é opcional — o backend valida só se disponível
      }

      await attendanceService.mark({ trip_token: data, cadete_id: user.id, lat, lng });
      setScanState('success');
    } catch (err: any) {
      const apiError = err?.response ? extractApiError(err) : null;
      if (apiError?.statusCode === 409) {
        setErrorMessage('A tua presença já foi registada nesta viagem.');
      } else if (apiError?.statusCode === 410 || apiError?.statusCode === 400) {
        setErrorMessage('QR code inválido ou expirado. Pede ao motorista para mostrar o código atualizado.');
      } else {
        setErrorMessage(apiError?.userMessage ?? err?.message ?? 'Erro ao registar presença.');
      }
      setScanState('error');
    }
  };

  const resetScan = () => {
    scannedRef.current = false;
    setErrorMessage('');
    setScanState('scanning');
  };

  if (!permission) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center">
        <ActivityIndicator color={ACCENT} size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center px-8">
        <StatusBar style="light" backgroundColor="#0f172a" />
        <Ionicons name="camera-outline" size={64} color="#64748b" />
        <Text className="text-white text-lg font-bold mt-4 text-center">Acesso à câmara necessário</Text>
        <Text className="text-slate-400 text-[13px] mt-2 text-center">
          Para marcar presença precisas de escanear o QR code do motorista.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="px-6 py-3 rounded-xl mt-6"
          style={{ backgroundColor: ACCENT }}
        >
          <Text className="text-white font-bold">Permitir Câmara</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onBack} className="mt-4">
          <Text className="text-slate-400 text-[13px]">Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-900">
      <StatusBar style="light" backgroundColor="#0f172a" />

      {/* Header */}
      <View className="flex-row items-center gap-3 px-5 pt-14 pb-4 border-b border-slate-700 bg-slate-900 z-10">
        <TouchableOpacity
          onPress={onBack}
          className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 items-center justify-center"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text className="text-white text-[18px] font-bold">Marcar Presença</Text>
          <Text className="text-slate-400 text-[12px] mt-0.5">Escaneia o QR code do motorista</Text>
        </View>
      </View>

      {scanState === 'success' ? (
        <View className="flex-1 justify-center items-center px-8">
          <View className="w-24 h-24 rounded-full bg-emerald-500/15 border-2 border-emerald-500 items-center justify-center">
            <Ionicons name="checkmark" size={52} color="#10b981" />
          </View>
          <Text className="text-white text-xl font-bold mt-6 text-center">Presença registada!</Text>
          <Text className="text-slate-400 text-[13px] mt-2 text-center">
            Boa viagem. O motorista já consegue ver a tua presença.
          </Text>
          <TouchableOpacity
            onPress={onBack}
            className="px-8 py-3 rounded-xl mt-8"
            style={{ backgroundColor: ACCENT }}
          >
            <Text className="text-white font-bold">Concluir</Text>
          </TouchableOpacity>
        </View>
      ) : scanState === 'error' ? (
        <View className="flex-1 justify-center items-center px-8">
          <View className="w-24 h-24 rounded-full bg-red-500/15 border-2 border-red-500 items-center justify-center">
            <Ionicons name="close" size={52} color="#ef4444" />
          </View>
          <Text className="text-white text-xl font-bold mt-6 text-center">Não foi possível registar</Text>
          <Text className="text-slate-400 text-[13px] mt-2 text-center">{errorMessage}</Text>
          <TouchableOpacity
            onPress={resetScan}
            className="px-8 py-3 rounded-xl mt-8"
            style={{ backgroundColor: ACCENT }}
          >
            <Text className="text-white font-bold">Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex-1">
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={scanState === 'scanning' ? handleScanned : undefined}
          />

          {/* Moldura de mira */}
          <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
            <View
              className="w-60 h-60 rounded-3xl"
              style={{ borderWidth: 3, borderColor: ACCENT, backgroundColor: 'transparent' }}
            />
            <Text className="text-white text-[13px] mt-4 bg-slate-900/70 px-3 py-1.5 rounded-full">
              Aponta a câmara para o QR code
            </Text>
          </View>

          {scanState === 'submitting' && (
            <View className="absolute inset-0 bg-slate-900/80 items-center justify-center">
              <ActivityIndicator color={ACCENT} size="large" />
              <View className="flex-row items-center gap-2 mt-4">
                <MaterialIcons name="how-to-reg" size={18} color={ACCENT} />
                <Text className="text-[#00babc] text-[14px] font-medium">A registar presença...</Text>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
};
