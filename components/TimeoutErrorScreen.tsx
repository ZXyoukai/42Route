import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { ApiError, ApiErrorType } from '../types/api';

// ─── Config per error type ────────────────────────────────────────────────

interface ErrorDisplay {
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  title: string;
  bgAccent: string;
  borderAccent: string;
}

const ERROR_CONFIG: Record<ApiErrorType, ErrorDisplay> = {
  timeout: {
    icon: 'timer-off',
    iconColor: '#f59e0b',
    title: 'Tempo Esgotado',
    bgAccent: 'rgba(245,158,11,0.1)',
    borderAccent: 'rgba(245,158,11,0.3)',
  },
  network: {
    icon: 'wifi-off',
    iconColor: '#f59e0b',
    title: 'Sem Conexão',
    bgAccent: 'rgba(245,158,11,0.1)',
    borderAccent: 'rgba(245,158,11,0.3)',
  },
  server: {
    icon: 'cloud-off',
    iconColor: '#ef4444',
    title: 'Erro no Servidor',
    bgAccent: 'rgba(239,68,68,0.1)',
    borderAccent: 'rgba(239,68,68,0.3)',
  },
  auth: {
    icon: 'lock-outline',
    iconColor: '#f59e0b',
    title: 'Sessão Expirada',
    bgAccent: 'rgba(245,158,11,0.1)',
    borderAccent: 'rgba(245,158,11,0.3)',
  },
  not_found: {
    icon: 'search-off',
    iconColor: '#94a3b8',
    title: 'Não Encontrado',
    bgAccent: 'rgba(148,163,184,0.1)',
    borderAccent: 'rgba(148,163,184,0.3)',
  },
  unknown: {
    icon: 'error-outline',
    iconColor: '#ef4444',
    title: 'Erro Inesperado',
    bgAccent: 'rgba(239,68,68,0.1)',
    borderAccent: 'rgba(239,68,68,0.3)',
  },
};

// ─── Component ────────────────────────────────────────────────────────────

interface TimeoutErrorScreenProps {
  error: ApiError;
  onRetry: () => void;
  onBack?: () => void;
  /** Optional contextual message, e.g. "ao carregar rotas" */
  context?: string;
}

export const TimeoutErrorScreen = ({
  error,
  onRetry,
  onBack,
  context,
}: TimeoutErrorScreenProps) => {
  const config = ERROR_CONFIG[error.type] ?? ERROR_CONFIG.unknown;

  // Pulse animation on the icon
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <View className="flex-1 bg-slate-900 justify-center items-center px-8">
      <StatusBar style="light" backgroundColor="#0f172a" />

      {/* Icon with pulse + glow ring */}
      <Animated.View
        style={{
          transform: [{ scale: pulseAnim }],
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: config.bgAccent,
            borderWidth: 2,
            borderColor: config.borderAccent,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialIcons
            name={config.icon}
            size={56}
            color={config.iconColor}
          />
        </View>
      </Animated.View>

      {/* Title */}
      <Text className="text-white text-[22px] font-bold mt-7 text-center">
        {config.title}
      </Text>

      {/* Message */}
      <Text className="text-slate-400 text-[14px] text-center mt-3 leading-5 px-4">
        {error.userMessage}
        {context ? `\n\nContexto: ${context}` : ''}
      </Text>

      {/* Retry button */}
      <TouchableOpacity
        onPress={onRetry}
        className="mt-8 bg-[#00babc] rounded-2xl px-8 py-4 flex-row items-center gap-2 shadow-lg"
        style={{ shadowColor: '#00babc', shadowOpacity: 0.3, shadowRadius: 12 }}
        activeOpacity={0.85}
      >
        <Ionicons name="refresh" size={18} color="#fff" />
        <Text className="text-white text-[15px] font-bold">
          Tentar Novamente
        </Text>
      </TouchableOpacity>

      {/* Back button (optional) */}
      {onBack && (
        <TouchableOpacity
          onPress={onBack}
          className="mt-4 px-6 py-3 rounded-xl"
          activeOpacity={0.7}
        >
          <Text className="text-slate-400 text-[14px] font-medium">
            ← Voltar
          </Text>
        </TouchableOpacity>
      )}

      {/* Debug info (only in dev) */}
      <View className="mt-8 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
        <Text className="text-slate-500 text-[11px] text-center font-mono">
          {error.type.toUpperCase()}
          {error.statusCode ? ` · HTTP ${error.statusCode}` : ''}
        </Text>
      </View>
    </View>
  );
};
