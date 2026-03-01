import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useCustomAlert } from './CustomAlert';
import logoWhite from '../assets/route_logo-w.png';
import logoBlack from '../assets/route_logo-d.png';
import LoginIntra from './LoginIntra';

interface LoginScreenProps {
  onLogin: (userData: { name: string; email: string }) => void;
}

const ACCENT = '#00babc';
const BG = '#0f172a';
const CARD = '#1e293b';
const BORDER = '#334155';
const MUTED = '#64748b';

export const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showIntraLogin, setShowIntraLogin] = useState(false);

  const { AlertComponent, showError, showSuccess } = useCustomAlert();

  const handleLogin = async () => {
    if (!email || !password) {
      showError('Campos obrigatórios', 'Por favor preencha o email e a palavra-passe.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showSuccess('Login Realizado!', 'Bem-vindo ao sistema 42Routes', () => {
        onLogin({ name: 'Motorista', email });
      });
    }, 1800);
  };

  if (showIntraLogin) {
    return <LoginIntra onback={() => setShowIntraLogin(false)} onLogin={onLogin} />;
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" backgroundColor={BG} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Logo / Brand ─────────────────────────────────── */}
          <View style={styles.brand}>
            <View style={styles.logoBox}>
              <Image source={logoWhite} style={{ width: 120, height: 56 }} resizeMode="contain" />
            </View>
            <Text style={styles.brandSub}>Sistema de Transporte · 42 Luanda</Text>
          </View>

          <View style={styles.body}>
            {/* ── Separador ─────────────────────────────────── */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>Escolha como entrar</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* ══════════════════════════════════════════════════
                CARD 1 — Motorista (email + password)
            ══════════════════════════════════════════════════ */}
            <View style={styles.card}>
              {/* Role chip */}
              <View style={styles.roleRow}>
                <View style={styles.roleIconWrap}>
                  <FontAwesome5 name="id-card" size={16} color={ACCENT} />
                </View>
                <View>
                  <Text style={styles.roleTitle}>Motorista</Text>
                  <Text style={styles.roleSub}>Acesso com credenciais institucionais</Text>
                </View>
              </View>

              {/* Email */}
              <View style={styles.fieldWrap}>
                <View style={styles.fieldRow}>
                  <MaterialIcons name="email" size={18} color={MUTED} style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email institucional"
                    placeholderTextColor={MUTED}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>
              </View>

              {/* Password */}
              <View style={[styles.fieldWrap, { marginBottom: 18 }]}>
                <View style={styles.fieldRow}>
                  <Ionicons name="lock-closed" size={18} color={MUTED} style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.input}
                    placeholder="Palavra-passe"
                    placeholderTextColor={MUTED}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={18} color={MUTED} />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.btn, isLoading && styles.btnDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <View style={styles.btnInner}>
                    <View style={styles.spinner} />
                    <Text style={styles.btnText}>A entrar...</Text>
                  </View>
                ) : (
                  <View style={styles.btnInner}>
                    <FontAwesome5 name="id-card" size={16} color="#fff" />
                    <Text style={styles.btnText}>Entrar como Motorista</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={{ alignSelf: 'center', marginTop: 10 }}>
                <Text style={styles.forgotText}>Esqueceu a palavra-passe?</Text>
              </TouchableOpacity>
            </View>

            {/* ── OR divider ────────────────────────────────── */}
            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>OU</Text>
              <View style={styles.orLine} />
            </View>

            {/* ══════════════════════════════════════════════════
                CARD 2 — Cadete / Intra 42
            ══════════════════════════════════════════════════ */}
            <View style={[styles.card, styles.cardAccent]}>
              <View style={styles.roleRow}>
                <View style={[styles.roleIconWrap, { backgroundColor: 'rgba(0,186,188,0.18)' }]}>
                  <FontAwesome5 name="user-graduate" size={16} color={ACCENT} />
                </View>
                <View>
                  <Text style={styles.roleTitle}>Cadete 42</Text>
                  <Text style={styles.roleSub}>Autenticação via Intra da 42</Text>
                </View>
              </View>

              <View style={styles.intraLogoRow}>
                <Image source={logoBlack} style={{ width: 48, height: 48 }} resizeMode="contain" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.intraTitle}>Login com Intra 42</Text>
                  <Text style={styles.intraSub}>
                    Usa as tuas credenciais da plataforma 42 para entrar de forma segura.
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.btnOutline}
                onPress={() => setShowIntraLogin(true)}
                activeOpacity={0.85}
              >
                <View style={styles.btnInner}>
                  <Ionicons name="shield-checkmark" size={18} color={ACCENT} />
                  <Text style={styles.btnOutlineText}>Entrar com Intra 42</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* ── Footer info ───────────────────────────────── */}
            <View style={styles.footer}>
              <MaterialIcons name="security" size={14} color="#10b981" />
              <Text style={styles.footerText}>
                Ligação segura · dados protegidos na 42 Luanda
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {AlertComponent}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  brand: {
    alignItems: 'center',
    paddingTop: 72,
    paddingBottom: 28,
    paddingHorizontal: 24,
  },
  logoBox: {
    backgroundColor: ACCENT,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginBottom: 16,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  brandSub: { color: MUTED, fontSize: 14, textAlign: 'center' },

  body: { paddingHorizontal: 20, paddingBottom: 32 },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: BORDER },
  dividerLabel: { color: MUTED, fontSize: 12, marginHorizontal: 12 },

  card: {
    backgroundColor: CARD,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 4,
  },
  cardAccent: {
    borderColor: 'rgba(0,186,188,0.35)',
    backgroundColor: 'rgba(0,186,188,0.04)',
  },

  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  roleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0,186,188,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,186,188,0.25)',
  },
  roleTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  roleSub: { color: MUTED, fontSize: 12, marginTop: 1 },

  fieldWrap: {
    backgroundColor: BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 12,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  input: { flex: 1, color: '#fff', fontSize: 14 },

  btn: {
    backgroundColor: ACCENT,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  btnDisabled: { backgroundColor: '#475569', shadowOpacity: 0 },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  btnOutline: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: ACCENT,
  },
  btnOutlineText: { color: ACCENT, fontSize: 15, fontWeight: '700' },

  forgotText: { color: ACCENT, fontSize: 13 },

  orRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 14 },
  orLine: { flex: 1, height: 1, backgroundColor: BORDER },
  orText: { color: MUTED, fontSize: 11, fontWeight: '600', marginHorizontal: 12 },

  intraLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: BG,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  intraTitle: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 3 },
  intraSub: { color: MUTED, fontSize: 12, lineHeight: 16 },

  spinner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#fff',
    borderTopColor: 'transparent',
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
  },
  footerText: { color: MUTED, fontSize: 12 },
});

