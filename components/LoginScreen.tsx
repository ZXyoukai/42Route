import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useCustomAlert } from './CustomAlert';

interface LoginScreenProps {
  onLogin: (userData: { name: string; email: string }) => void;
}

export const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { AlertComponent, showError, showSuccess } = useCustomAlert();

  const handleLogin = async () => {
    if (!email || !password) {
      showError(
        'Erro de Autenticação', 
        'Por favor preencha todos os campos para continuar'
      );
      return;
    }

    setIsLoading(true);
    
    // Simular autenticação
    setTimeout(() => {
      setIsLoading(false);
      showSuccess(
        'Login Realizado!', 
        'Bem-vindo ao sistema 42Routes',
        () => {
          onLogin({
            name: 'João Silva',
            email: email
          });
        }
      );
    }, 2000);
  };

  return (
    <View className="flex-1 bg-slate-900">
      <StatusBar style="light" backgroundColor="#0f172a" />
      
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header com Logo */}
          <View className="pt-20 pb-12 px-6 items-center">
            <View className="bg-gradient-to-br from-cyan-500 to-teal-600 rounded-3xl p-4 mb-6 shadow-2xl" style={{ backgroundColor: '#00babc' }}>
              <Image
                source={require('../assets/route_logo-w.png')}
                className="h-24"
                resizeMode="contain"
              />
            </View>
            
            {/* <Text className="text-white text-3xl font-bold mb-2">42Routes</Text> */}
            <Text className="text-slate-300 text-lg text-center">
              Sistema de Transporte
            </Text>
            <Text className="text-slate-400 text-sm text-center mt-1">
              42 Escola de Programação - Luanda
            </Text>
          </View>

          {/* Form de Login */}
          <View className="flex-1 px-6">
            <View className="bg-slate-800 rounded-3xl p-6 shadow-2xl border border-slate-700">
              <Text className="text-white text-2xl font-bold mb-6 text-center">
                Iniciar Sessão
              </Text>

              {/* Campo Email */}
              <View className="mb-4">
                <Text className="text-slate-300 text-sm font-medium mb-2">
                  Email Institucional
                </Text>
                <View className="bg-slate-700 rounded-xl flex-row items-center px-4 py-3 border border-slate-600">
                  <MaterialIcons name="email" size={20} color="#94a3b8" />
                  <TextInput
                    className="flex-1 text-white ml-3 text-base"
                    placeholder="seu.email@student.42luanda.ao"
                    placeholderTextColor="#64748b"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>
              </View>

              {/* Campo Senha */}
              <View className="mb-6">
                <Text className="text-slate-300 text-sm font-medium mb-2">
                  Palavra-passe
                </Text>
                <View className="bg-slate-700 rounded-xl flex-row items-center px-4 py-3 border border-slate-600">
                  <Ionicons name="lock-closed" size={20} color="#94a3b8" />
                  <TextInput
                    className="flex-1 text-white ml-3 text-base"
                    placeholder="Digite a sua palavra-passe"
                    placeholderTextColor="#64748b"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="ml-2"
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off" : "eye"} 
                      size={20} 
                      color="#94a3b8" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Botão Login */}
              <TouchableOpacity
                className={`rounded-2xl py-5 px-6 items-center mb-4 shadow-2xl ${
                  isLoading 
                    ? 'bg-slate-600' 
                    : 'bg-gradient-to-r from-cyan-500 via-cyan-600 to-teal-600'
                }`}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
                style={{
                  backgroundColor: isLoading ? '#475569' : '#00babc',
                  shadowColor: '#00babc',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                {isLoading ? (
                  <View className="flex-row items-center">
                    <View className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                    <Text className="text-white font-bold text-xl">A entrar...</Text>
                  </View>
                ) : (
                  <View className="flex-row items-center">
                    <Ionicons name="log-in" size={24} color="white" />
                    <Text className="text-white font-bold text-xl ml-2">Entrar</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Links auxiliares */}
              <View className="items-center">
                <TouchableOpacity className="mb-2">
                  <Text className="text-slate-400 text-sm font-medium" style={{ color: '#00babc' }}>
                    Esqueceu a palavra-passe?
                  </Text>
                </TouchableOpacity>
                
                <View className="flex-row items-center">
                  <View className="flex-1 h-px bg-slate-600" />
                  <Text className="text-slate-400 text-xs mx-4">OU</Text>
                  <View className="flex-1 h-px bg-slate-600" />
                </View>

                <TouchableOpacity className="mt-3 flex-row items-center">
                  <MaterialIcons name="help-outline" size={16} color="#00babc" />
                  <Text className="text-slate-400 text-sm font-medium ml-2" style={{ color: '#00babc' }}>
                    Precisa de ajuda? Contacte o suporte
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Informações adicionais */}
            <View className="mt-8 px-4 pb-6">
              <View className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                <View className="flex-row items-start mb-3">
                  <Ionicons name="information-circle" size={20} color="#00babc" />
                  <View className="flex-1 ml-3">
                    <Text className="font-bold text-sm mb-1" style={{ color: '#00babc' }}>
                      Primeira vez na aplicação?
                    </Text>
                    <Text className="text-slate-300 text-xs leading-relaxed">
                      Use as suas credenciais da intranet da 42 Luanda para aceder ao sistema de transporte.
                    </Text>
                  </View>
                </View>
                
                <View className="flex-row items-start">
                  <MaterialIcons name="security" size={20} color="#10b981" />
                  <View className="flex-1 ml-3">
                    <Text className="text-emerald-400 font-bold text-sm mb-1">
                      Segurança Garantida
                    </Text>
                    <Text className="text-slate-300 text-xs leading-relaxed">
                      Os seus dados estão protegidos com criptografia de ponta a ponta.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Custom Alert Component */}
      {AlertComponent}
    </View>
  );
};
