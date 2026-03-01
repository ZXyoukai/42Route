import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
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
const BG = '#0f172a';
const CARD = '#1e293b';
const BORDER = '#334155';
const MUTED = '#64748b';

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
    <View style={s.root}>
      {/* ── Back button ──────────────────────────────────────── */}
      <TouchableOpacity onPress={onback} style={s.backBtn} activeOpacity={0.8}>
        <Ionicons name="arrow-back" size={20} color="#fff" />
      </TouchableOpacity>

      {/* ── Center content ───────────────────────────────────── */}
      <View style={s.center}>

        {/* Shield hero */}
        <Animated.View style={[s.shieldWrap, { transform: [{ scale: shieldPulse }] }]}>
          <Ionicons name="shield-checkmark" size={56} color={ACCENT} />
        </Animated.View>

        {/* 42 logo + title */}
        <Image source={require('../assets/route_logo-w.png')} style={{ width: 80, height: 36, marginBottom: 10 }} resizeMode="contain" />
        <Text style={s.title}>Autenticação com Intra 42</Text>
        <Text style={s.sub}>
          Serás redirecionado para a plataforma da 42 para autenticares a tua conta de cadete.
        </Text>

        {/* Process steps */}
        <View style={s.steps}>
          {[
            { icon: 'log-in-outline', label: 'Abrir browser da 42' },
            { icon: 'person-circle-outline', label: 'Confirmar identidade' },
            { icon: 'checkmark-done-circle-outline', label: 'Aceder ao 42Routes' },
          ].map((step, i) => (
            <View key={i} style={s.stepRow}>
              <View style={s.stepNum}><Text style={s.stepNumText}>{i + 1}</Text></View>
              <Ionicons name={step.icon as any} size={18} color={ACCENT} style={{ marginRight: 10 }} />
              <Text style={s.stepLabel}>{step.label}</Text>
            </View>
          ))}
        </View>

        {/* Error */}
        {error && (
          <View style={s.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#ef4444" />
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}

        {/* Main CTA */}
        <TouchableOpacity
          style={[s.btn, isLoading && s.btnDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <View style={s.btnInner}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={s.btnText}>A abrir browser...</Text>
            </View>
          ) : (
            <View style={s.btnInner}>
              <FontAwesome5 name="user-graduate" size={16} color="#fff" />
              <Text style={s.btnText}>Entrar com Intra 42</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={s.note}>
          <Ionicons name="lock-closed" size={11} color={MUTED} /> Ligação segura via OAuth 2.0
        </Text>
      </View>

      {/* ── Success modal ────────────────────────────────────── */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Animated.View style={{ transform: [{ scale: iconScale }], marginBottom: 14 }}>
              <Ionicons name="checkmark-circle" size={52} color={ACCENT} />
            </Animated.View>
            <Text style={s.modalTitle}>Login realizado!</Text>
            <Text style={s.modalSub}>A aceder ao 42Routes...</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  backBtn: {
    position: 'absolute',
    top: 56,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 40,
  },

  shieldWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(0,186,188,0.1)',
    borderWidth: 2,
    borderColor: 'rgba(0,186,188,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  title: { color: '#fff', fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 10 },
  sub: { color: MUTED, fontSize: 14, textAlign: 'center', lineHeight: 21, marginBottom: 28 },

  steps: {
    width: '100%',
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 24,
    gap: 12,
  },
  stepRow: { flexDirection: 'row', alignItems: 'center' },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,186,188,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stepNumText: { color: ACCENT, fontSize: 11, fontWeight: '700' },
  stepLabel: { color: '#e2e8f0', fontSize: 14 },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    width: '100%',
    marginBottom: 16,
  },
  errorText: { color: '#ef4444', fontSize: 13, flex: 1 },

  btn: {
    width: '100%',
    backgroundColor: ACCENT,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 14,
  },
  btnDisabled: { backgroundColor: '#475569', shadowOpacity: 0 },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  note: { color: MUTED, fontSize: 12 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28 },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: CARD,
    borderRadius: 22,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,186,188,0.4)',
  },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  modalSub: { color: MUTED, fontSize: 14, textAlign: 'center' },
});


