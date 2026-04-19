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
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useCustomAlert } from './CustomAlert';
import logoWhite from '../assets/route_logo-w.png';
import LoginIntra from './LoginIntra';
import { authService } from '../services/authService';

interface LoginScreenProps {
  onLogin: (userData: { name: string; email: string }) => void | Promise<void>;
}

const ACCENT = '#00babc';

export const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showIntraLogin, setShowIntraLogin] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const { AlertComponent, showError } = useCustomAlert();

  const handleLogin = async () => {
    if (!username || !password) {
      showError('Campos obrigatórios', 'Por favor preencha o utilizador e a palavra-passe.');
      return;
    }
    setIsLoading(true);
    try {
      const driver = await authService.driverLogin({ username, password });
      await onLogin({ name: driver.full_name ?? driver.username ?? 'Motorista', email: driver.email ?? username });
    } catch (err: any) {
      const msg =
        err?.message == "Network Error" ? "Erro de conexão. Verifique sua internet e tente novamente." : 
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        'Credenciais inválidas. Verifique os dados e tente novamente.';
        showError('Acesso Negado', msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (showIntraLogin) {
    return <LoginIntra onback={() => setShowIntraLogin(false)} onLogin={onLogin} />;
  }

  return (
    <View className="flex-1 bg-slate-900">
      <StatusBar style="light" backgroundColor="#0f172a" />

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Logo / Brand ─────────────────────────────────── */}
          <View className="items-center pt-20 pb-4 px-6">
            <View className="rounded-3xl px-6 py-4 mb-5">
              <Image source={logoWhite} style={{ width: 120, height: 56 }} resizeMode="contain" />
            </View>
            <Text className="text-white text-2xl font-bold mb-1.5 tracking-wide">Bem-vindo de volta</Text>
            <Text className="text-slate-500 text-sm text-center">Sistema de Transporte Institucional · 42 Luanda</Text>
          </View>

          <View className="px-5 pb-10">
            <View className=" rounded-[24px] p-6 mb-2 shadow-md shadow-black/15">
              <Text className="text-white text-lg font-bold mb-5 text-center tracking-wide">Acesse à Plataforma</Text>

              {/* Email */}
              <View
                className={`bg-slate-900 rounded-2xl border-2 mb-3.5 ${
                  focusedField === 'username' ? 'border-[#00babc] bg-[#00babc]/5' : 'border-slate-700'
                }`}
              >
                <View className="flex-row items-center px-4 py-4">
                  <MaterialIcons
                    name="person"
                    size={20}
                    color={focusedField === 'username' ? ACCENT : '#64748b'}
                    style={{ marginRight: 12 }}
                  />
                  <TextInput
                    className="flex-1 text-white text-[15px]"
                    placeholder="Nome de utilizador"
                    placeholderTextColor="#64748b"
                    value={username}
                    onChangeText={setUsername}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="none"
                    autoComplete="username"
                  />
                </View>
              </View>

              {/* Password */}
              <View
                className={`bg-slate-900 rounded-2xl border-2 mb-3 ${
                  focusedField === 'password' ? 'border-[#00babc] bg-[#00babc]/5' : 'border-slate-700'
                }`}
              >
                <View className="flex-row items-center px-4 py-3.5">
                  <Ionicons
                    name="lock-closed"
                    size={20}
                    color={focusedField === 'password' ? ACCENT : '#64748b'}
                    style={{ marginRight: 12 }}
                  />
                  <TextInput
                    className="flex-1 text-white text-[15px]"
                    placeholder="Palavra-passe"
                    placeholderTextColor="#64748b"
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={focusedField === 'password' ? ACCENT : '#64748b'} />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity className="self-end mb-5">
                <Text className="text-slate-500 text-[14px] font-medium">Esqueceu a senha?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`rounded-2xl py-4 items-center ${
                  isLoading ? 'bg-slate-600 shadow-none' : 'bg-[#00babc] shadow-md shadow-[#00babc]/30'
                }`}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <View className="flex-row items-center gap-2 justify-center">
                    <ActivityIndicator size="small" color="#fff" />
                    <Text className="text-white text-base font-bold ml-2">A entrar...</Text>
                  </View>
                ) : (
                  <View className="flex-row items-center gap-2 justify-center">
                    <Text className="text-white text-base font-bold">Entrar como Motorista</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* ── OR divider ────────────────────────────────── */}
              <View className="flex-row items-center my-5 px-2.5">
                <View className="flex-1 h-px bg-slate-700" />
                <Text className="text-slate-500 text-xs font-semibold mx-4 tracking-[1px]">OU ENTÃO</Text>
                <View className="flex-1 h-px bg-slate-700" />
              </View>

              {/* ── Intra Button ──────────────────────────────── */}
              <TouchableOpacity
                className="rounded-2xl py-4 items-center  bg-[#00babc]/5"
                onPress={() => setShowIntraLogin(true)}
                activeOpacity={0.85}
              >
                <View className="flex-row items-center justify-center">
                  <Text className="text-[#00babc] text-base font-bold">Cadetes: Login com Intra 42</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* ── Footer info ───────────────────────────────── */}
            <View className="flex-row items-center justify-center gap-2 mt-2">
              <MaterialIcons name="security" size={16} color="#00babc" />
              <Text className="text-slate-500 text-[13px] font-medium">Ambiente seguro · 42 Luanda</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {AlertComponent}
    </View>
  );
};



