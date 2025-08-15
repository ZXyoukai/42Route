import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

interface DriverProfileProps {
  onBack?: () => void;
}

export const DriverProfile = ({ onBack }: DriverProfileProps) => {
  const [isOnline, setIsOnline] = useState(true);

  const driverInfo = {
    id: 'DR001',
    name: 'Carlos Mendes',
    license: 'AB123456',
    phone: '+244 923 456 789',
    route: 'Rota Central',
    busNumber: 'BUS-001',
    rating: '4.8/5',
    totalTrips: 1420,
    yearsExperience: 8
  };

  const todayStats = {
    trips: 12,
    passengers: 184,
    distance: '89km',
    fuel: '78%'
  };

  return (
    <View className="flex-1 bg-slate-900">
      <StatusBar style="light" backgroundColor="#0f172a" />
      
      {/* Header */}
      <View className="bg-gradient-to-br from-cyan-500 to-teal-600 pt-12 pb-6 px-6" style={{ backgroundColor: '#00babc' }}>
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity onPress={onBack} className="flex-row items-center">
            <Ionicons name="arrow-back" size={24} color="white" />
            <Text className="text-white text-lg font-medium ml-2">Voltar</Text>
          </TouchableOpacity>
          <Image
            source={require('../assets/route_logo-w.png')}
            className="h-10"
            resizeMode="contain"
          />
        </View>
        
        <View className="items-center">
          <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-4 shadow-lg">
            <Text className="text-cyan-600 text-3xl font-bold" style={{ color: '#00babc' }}>
              {driverInfo.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          <Text className="text-white text-2xl font-bold">{driverInfo.name}</Text>
          <Text className="text-cyan-100 text-sm">Motorista Profissional • {driverInfo.id}</Text>
          <View className="flex-row items-center mt-2">
            <Ionicons name="star" size={16} color="#fbbf24" />
            <Text className="text-cyan-100 text-sm ml-2">{driverInfo.rating} • {driverInfo.totalTrips} viagens</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Status Online */}
        <View className="bg-slate-800 rounded-2xl p-6 mb-6 shadow-lg border border-slate-700">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-xl font-bold">Status</Text>
            <View className={`px-3 py-1 rounded-full ${isOnline ? 'bg-emerald-900/30 border border-emerald-600' : 'bg-red-900/30 border border-red-600'}`}>
              <Text className={`text-xs font-bold ${isOnline ? 'text-emerald-400' : 'text-red-400'}`}>
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </Text>
            </View>
          </View>
          
          <View className="space-y-3">
            <View className="flex-row justify-between items-center p-3 bg-cyan-900/30 rounded-xl border border-cyan-600" style={{ backgroundColor: 'rgba(0, 186, 188, 0.1)', borderColor: '#00babc' }}>
              <View className="flex-row items-center">
                <FontAwesome5 name="route" size={16} color="#00babc" />
                <Text className="text-slate-300 font-medium ml-3">Rota Ativa:</Text>
              </View>
              <Text className="text-cyan-400 font-bold" style={{ color: '#00babc' }}>{driverInfo.route}</Text>
            </View>
            
            <View className="flex-row justify-between items-center p-3 bg-slate-700 rounded-xl">
              <View className="flex-row items-center">
                <FontAwesome5 name="bus" size={16} color="#94a3b8" />
                <Text className="text-slate-300 font-medium ml-3">Autocarro:</Text>
              </View>
              <Text className="text-white font-bold">{driverInfo.busNumber}</Text>
            </View>
          </View>
        </View>

        {/* Estatísticas de Hoje */}
        <View className="bg-slate-800 rounded-2xl p-6 mb-6 shadow-lg border border-slate-700">
          <Text className="text-white text-xl font-bold mb-4">Estatísticas de Hoje</Text>
          
          <View className="flex-row justify-between mb-4">
            <View className="items-center flex-1">
              <View className="w-16 h-16 bg-cyan-900/50 rounded-2xl items-center justify-center mb-2 border border-cyan-700" style={{ backgroundColor: 'rgba(0, 186, 188, 0.1)', borderColor: '#00babc' }}>
                <FontAwesome5 name="road" size={18} color="#00babc" />
              </View>
              <Text className="text-2xl font-bold text-cyan-400" style={{ color: '#00babc' }}>{todayStats.distance}</Text>
              <Text className="text-slate-400 text-sm text-center font-medium">Distância</Text>
            </View>
            <View className="items-center flex-1">
              <View className="w-16 h-16 bg-emerald-900/50 rounded-2xl items-center justify-center mb-2 border border-emerald-700">
                <Ionicons name="people" size={20} color="#10b981" />
              </View>
              <Text className="text-2xl font-bold text-emerald-400">{todayStats.passengers}</Text>
              <Text className="text-slate-400 text-sm text-center font-medium">Passageiros</Text>
            </View>
          </View>
          
          <View className="flex-row justify-between">
            <View className="items-center flex-1">
              <View className="w-16 h-16 bg-blue-900/50 rounded-2xl items-center justify-center mb-2 border border-blue-700">
                <MaterialIcons name="directions-bus" size={20} color="#3b82f6" />
              </View>
              <Text className="text-2xl font-bold text-blue-400">{todayStats.trips}</Text>
              <Text className="text-slate-400 text-sm text-center font-medium">Viagens</Text>
            </View>
            <View className="items-center flex-1">
              <View className="w-16 h-16 bg-orange-900/50 rounded-2xl items-center justify-center mb-2 border border-orange-700">
                <MaterialIcons name="local-gas-station" size={20} color="#f97316" />
              </View>
              <Text className="text-2xl font-bold text-orange-400">{todayStats.fuel}</Text>
              <Text className="text-slate-400 text-sm text-center font-medium">Combustível</Text>
            </View>
          </View>
        </View>

        {/* Informações Profissionais */}
        <View className="bg-slate-800 rounded-2xl p-6 mb-6 shadow-lg border border-slate-700">
          <Text className="text-white text-xl font-bold mb-4">Informações Profissionais</Text>
          
          <View className="space-y-4">
            <View className="p-3 bg-slate-700 rounded-xl">
              <Text className="text-slate-400 text-sm font-medium">Licença de Condução</Text>
              <Text className="text-white font-bold">{driverInfo.license}</Text>
            </View>
            
            <View className="p-3 bg-slate-700 rounded-xl">
              <Text className="text-slate-400 text-sm font-medium">Contacto</Text>
              <Text className="text-white font-bold">{driverInfo.phone}</Text>
            </View>
            
            <View className="p-3 bg-slate-700 rounded-xl">
              <Text className="text-slate-400 text-sm font-medium">Experiência</Text>
              <Text className="text-white font-bold">{driverInfo.yearsExperience} anos</Text>
            </View>
          </View>
        </View>

        {/* Ações Rápidas */}
        <View className="space-y-3 mb-6">
          <TouchableOpacity className="bg-slate-800 rounded-xl p-4 flex-row items-center justify-between shadow-lg border border-slate-700">
            <View className="flex-row items-center">
              <MaterialIcons name="schedule" size={20} color="#00babc" />
              <Text className="text-white font-medium ml-3">Horário de Trabalho</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#64748b" />
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-slate-800 rounded-xl p-4 flex-row items-center justify-between shadow-lg border border-slate-700">
            <View className="flex-row items-center">
              <MaterialIcons name="assessment" size={20} color="#00babc" />
              <Text className="text-white font-medium ml-3">Relatórios</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#64748b" />
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-slate-800 rounded-xl p-4 flex-row items-center justify-between shadow-lg border border-slate-700">
            <View className="flex-row items-center">
              <MaterialIcons name="build" size={20} color="#f59e0b" />
              <Text className="text-white font-medium ml-3">Manutenção</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#64748b" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            className={`rounded-xl p-4 flex-row items-center justify-center ${
              isOnline ? 'bg-red-900/30 border border-red-700' : 'bg-emerald-900/30 border border-emerald-700'
            }`}
            onPress={() => setIsOnline(!isOnline)}
          >
            <MaterialIcons 
              name={isOnline ? "pause" : "play-arrow"} 
              size={20} 
              color={isOnline ? "#ef4444" : "#10b981"} 
            />
            <Text 
              className={`font-bold ml-3 ${
                isOnline ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {isOnline ? 'Pausar Serviço' : 'Iniciar Serviço'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Versão da App */}
        <View className="items-center py-4">
          <Text className="text-slate-500 text-sm">42Routes Driver v1.0.0</Text>
          <Text className="text-slate-600 text-xs">© 2024 42 Luanda</Text>
        </View>
      </ScrollView>
    </View>
  );
};
