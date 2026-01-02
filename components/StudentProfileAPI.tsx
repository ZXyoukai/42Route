import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Cadete } from '../types/api';
import { cadeteService } from '../services/cadeteService';

interface StudentProfileAPIProps {
  cadeteId: number;
  onBack?: () => void;
  onLogout?: () => void;
}

export const StudentProfileAPI = ({ cadeteId, onBack, onLogout }: StudentProfileAPIProps) => {
  const [cadete, setCadete] = useState<Cadete | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  useEffect(() => {
    loadCadeteData();
  }, [cadeteId]);

  const loadCadeteData = async () => {
    try {
      setLoading(true);
      const data = await cadeteService.getById(cadeteId);
      setCadete(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados do estudante');
    } finally {
      setLoading(false);
    }
  };

  const loadRouteInfo = async () => {
    if (!cadete) return;
    try {
      const routeInfo = await cadeteService.getRouteInformations(cadete.id);
      console.log('Route info:', routeInfo);
      // Handle route information
    } catch (err) {
      console.error('Error loading route info:', err);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center">
        <ActivityIndicator size="large" color="#00babc" />
        <Text className="text-white mt-4">Carregando perfil...</Text>
      </View>
    );
  }

  if (error || !cadete) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center px-6">
        <Ionicons name="alert-circle" size={64} color="#ef4444" />
        <Text className="text-white text-xl font-bold mt-4 text-center">Erro ao carregar perfil</Text>
        <Text className="text-slate-400 mt-2 text-center">{error}</Text>
        <TouchableOpacity 
          onPress={loadCadeteData}
          className="bg-cyan-600 px-6 py-3 rounded-xl mt-6"
          style={{ backgroundColor: '#00babc' }}
        >
          <Text className="text-white font-bold">Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-900">
      <StatusBar style="light" backgroundColor="#0f172a" />
      
      {/* Header */}
      <View className="border-b-2 border-[#00babc] pt-12 pb-6 px-6">
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity onPress={onBack} className="flex-row items-center">
            <Ionicons name="arrow-back" size={24} color="white" />
            <Text className="text-white text-lg font-medium ml-2">Voltar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onLogout}>
            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>
        
        <View className="items-center">
          <View className="w-24 h-24 bg-slate-800 rounded-full items-center justify-center mb-4 shadow-lg border-2 border-cyan-600">
            <Text className="text-cyan-600 text-3xl font-bold" style={{ color: '#00babc' }}>
              {cadete.full_name?.split(' ').map(n => n[0]).join('') || 'CD'}
            </Text>
          </View>
          <Text className="text-white text-2xl font-bold">{cadete.full_name || 'Cadete'}</Text>
          <Text className="text-cyan-100 text-sm">ID: {cadete.id}</Text>
          {cadete.email && (
            <Text className="text-slate-400 text-sm mt-1">{cadete.email}</Text>
          )}
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Personal Information */}
        <View className="bg-slate-800 rounded-2xl p-6 mb-6 shadow-lg border border-slate-700">
          <Text className="text-white text-xl font-bold mb-4">Informações Pessoais</Text>
          
          <View className="gap-y-2">
            {cadete.username && (
              <View className="p-3 bg-slate-700 rounded-xl">
                <Text className="text-slate-400 text-sm font-medium">Username</Text>
                <Text className="text-white font-bold">{cadete.username}</Text>
              </View>
            )}
            
            {cadete.phone && (
              <View className="p-3 bg-slate-700 rounded-xl">
                <Text className="text-slate-400 text-sm font-medium">Telefone</Text>
                <Text className="text-white font-bold">{cadete.phone}</Text>
              </View>
            )}
            
            {cadete.city && (
              <View className="p-3 bg-slate-700 rounded-xl">
                <Text className="text-slate-400 text-sm font-medium">Cidade</Text>
                <Text className="text-white font-bold">{cadete.city}</Text>
              </View>
            )}
            
            {cadete.distrit && (
              <View className="p-3 bg-slate-700 rounded-xl">
                <Text className="text-slate-400 text-sm font-medium">Distrito</Text>
                <Text className="text-white font-bold">{cadete.distrit}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Stop Information */}
        {cadete.stop && (
          <View className="bg-slate-800 rounded-2xl p-6 mb-6 shadow-lg border border-slate-700">
            <Text className="text-white text-xl font-bold mb-4">Paragem Atribuída</Text>
            <View className="bg-cyan-900/30 rounded-xl p-4 border border-cyan-600" style={{ backgroundColor: 'rgba(0, 186, 188, 0.1)', borderColor: '#00babc' }}>
              <Text className="text-cyan-400 text-lg font-bold" style={{ color: '#00babc' }}>
                {cadete.stop.stop_name}
              </Text>
              {cadete.stop.distrit && (
                <Text className="text-slate-300 text-sm mt-2">{cadete.stop.distrit}</Text>
              )}
              {cadete.stop.latitude && cadete.stop.longitude && (
                <Text className="text-slate-400 text-xs mt-2 font-mono">
                  {cadete.stop.latitude.toFixed(6)}, {cadete.stop.longitude.toFixed(6)}
                </Text>
              )}
              <TouchableOpacity 
                onPress={loadRouteInfo}
                className="bg-cyan-600 px-4 py-2 rounded-lg mt-3"
                style={{ backgroundColor: '#00babc' }}
              >
                <Text className="text-white text-center font-bold">Ver Informações da Rota</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Settings */}
        <View className="bg-slate-800 rounded-2xl p-6 mb-6 shadow-lg border border-slate-700">
          <Text className="text-white text-xl font-bold mb-4">Configurações</Text>
          
          <View className="gap-y-3">
            <View className="flex-row justify-between items-center p-3 bg-slate-700 rounded-xl">
              <View className="flex-row items-center">
                <Ionicons name="notifications" size={20} color="#00babc" />
                <Text className="text-white ml-3">Notificações</Text>
              </View>
              <Switch 
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#475569', true: '#00babc' }}
                thumbColor={notificationsEnabled ? '#ffffff' : '#94a3b8'}
              />
            </View>

            <View className="flex-row justify-between items-center p-3 bg-slate-700 rounded-xl">
              <View className="flex-row items-center">
                <Ionicons name="location" size={20} color="#00babc" />
                <Text className="text-white ml-3">Localização</Text>
              </View>
              <Switch 
                value={locationEnabled}
                onValueChange={setLocationEnabled}
                trackColor={{ false: '#475569', true: '#00babc' }}
                thumbColor={locationEnabled ? '#ffffff' : '#94a3b8'}
              />
            </View>
          </View>
        </View>

        {/* Messages */}
        {cadete.messages && cadete.messages.length > 0 && (
          <View className="bg-slate-800 rounded-2xl p-6 mb-6 shadow-lg border border-slate-700">
            <Text className="text-white text-xl font-bold mb-4">Mensagens Recentes</Text>
            {cadete.messages.slice(0, 5).map((msg, idx) => (
              <View key={idx} className="bg-slate-700 rounded-xl p-3 mb-2">
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="text-cyan-400 text-sm font-bold" style={{ color: '#00babc' }}>
                    {msg.driver?.full_name || 'Motorista'}
                  </Text>
                </View>
                <Text className="text-white">{msg.message}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <TouchableOpacity 
          onPress={loadCadeteData}
          className="bg-cyan-600 rounded-xl py-4 mb-4"
          style={{ backgroundColor: '#00babc' }}
        >
          <Text className="text-white text-center font-bold text-lg">Atualizar Dados</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={onLogout}
          className="bg-red-600 rounded-xl py-4 mb-6"
        >
          <Text className="text-white text-center font-bold text-lg">Terminar Sessão</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};
