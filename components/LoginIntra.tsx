import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Image,
  Animated,
  Easing,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { authService } from 'services';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

interface LoginIntraProps {
  onback: () => void;
  onLogin: (userData: { name: string; email: string }) => void;
}

const ACCENT = '#00babc';

export default function LoginIntra({ onback, onLogin }: LoginIntraProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const iconScale = useRef(new Animated.Value(1)).current;
  const shieldPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Idle pulse on shield
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(shieldPulse, { toValue: 1.06, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(shieldPulse, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => {
      pulse.stop();
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (showSuccessModal) {
      const p = Animated.loop(
        Animated.sequence([
          Animated.timing(iconScale, { toValue: 1.12, duration: 420, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(iconScale, { toValue: 1, duration: 420, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      );
      p.start();
      return () => { p.stop(); iconScale.setValue(1); };
    }
    iconScale.setValue(1);
  }, [showSuccessModal]);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await authService.login42();
      if (result.type === 'success') {
        setShowSuccessModal(true);
        successTimeoutRef.current = setTimeout(async () => {
          setShowSuccessModal(false);
          const userRaw = await AsyncStorage.getItem('user');
          const user = userRaw ? JSON.parse(userRaw) : null;
          onLogin({ name: user?.username ?? 'Cadete', email: user?.email ?? '' });
        }, 2400);
      }
    } catch {
      setError('Erro ao tentar fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-900">
      {/* ── Back button ──────────────────────────────────────── */}
      <TouchableOpacity 
        onPress={onback} 
        activeOpacity={0.8}
        className="absolute top-14 left-5 w-10 h-10 rounded-full bg-slate-900/90 border border-slate-700 items-center justify-center z-10"
      >
        <Ionicons name="arrow-back" size={20} color="#fff" />
      </TouchableOpacity>

      {/* ── Center content ───────────────────────────────────── */}
      <View className="flex-1 justify-center items-center px-7 pt-10">

        {/* 42 logo + title */}
        <Image 
          source={require('../assets/route_logo-w.png')} 
          style={{ width: 80, height: 36, marginBottom: 10 }} 
          resizeMode="contain" 
        />
        <Text className="text-white text-2xl font-extrabold text-center mb-2.5">
          Autenticação com Intra 42
        </Text>
        <Text className="text-slate-500 text-[15px] text-center leading-relaxed mb-7">
          Serás redirecionado para a plataforma da 42 para autenticares a tua conta de cadete.
        </Text>

        {/* Process steps */}
        <View className="w-full bg-slate-800 rounded-3xl p-5 border border-slate-700 mb-6 flex-col gap-y-3.5 shadow-md shadow-black/10">
          {[
            { icon: 'log-in-outline', label: 'Abrir browser da 42' },
            { icon: 'person-circle-outline', label: 'Confirmar identidade' },
            { icon: 'checkmark-done-circle-outline', label: 'Aceder ao 42Routes' },
          ].map((step, i) => (
            <View key={i} className="flex-row items-center">
              <View className="w-6 h-6 rounded-full bg-[#00babc]/15 items-center justify-center mr-3">
                <Text className="text-[#00babc] text-xs font-bold">{i + 1}</Text>
              </View>
              <Ionicons name={step.icon as any} size={18} color={ACCENT} style={{ marginRight: 10 }} />
              <Text className="text-slate-200 text-[15px]">{step.label}</Text>
            </View>
          ))}
        </View>

        {/* Error */}
        {error && (
          <View className="flex-row items-center gap-2 bg-red-500/10 rounded-2xl p-3.5 border border-red-500/30 w-full mb-4">
            <Ionicons name="alert-circle" size={18} color="#f87171" />
            <Text className="text-red-400 text-[14px] flex-1 font-medium">{error}</Text>
          </View>
        )}

        {/* Main CTA */}
        <TouchableOpacity
          className={`w-full rounded-2xl py-4 items-center mb-3.5 ${
            isLoading ? 'bg-slate-600 shadow-none' : 'bg-[#00babc] shadow-md shadow-[#00babc]/30'
          }`}
          onPress={handleLogin}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <View className="flex-row items-center gap-2 justify-center">
              <ActivityIndicator color="#fff" size="small" />
              <Text className="text-white text-base font-bold ml-2">A abrir browser...</Text>
            </View>
          ) : (
            <View className="flex-row items-center justify-center">
              <FontAwesome5 name="user-graduate" size={16} color="#fff" style={{ marginRight: 10 }} />
              <Text className="text-white text-base font-bold tracking-wide">Entrar com Intra 42</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text className="text-slate-500 text-xs font-medium mt-1">
          <Ionicons name="lock-closed" size={11} color="#64748b" /> Ligação segura via OAuth 2.0
        </Text>
      </View>

      {/* ── Success modal ────────────────────────────────────── */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View className="flex-1 bg-slate-900/80 justify-center items-center px-7">
          <View className="w-full max-w-[340px] bg-slate-800 rounded-[28px] py-8 px-6 items-center border-[1.5px] border-[#00babc]/40 shadow-2xl shadow-[#00babc]/10">
            <Animated.View style={{ transform: [{ scale: iconScale }], marginBottom: 16 }}>
              <Ionicons name="checkmark-circle" size={56} color={ACCENT} />
            </Animated.View>
            <Text className="text-white text-[22px] font-bold text-center mb-2 tracking-wide">Login realizado!</Text>
            <Text className="text-slate-400 text-[15px] text-center font-medium">A aceder ao 42Routes...</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}


