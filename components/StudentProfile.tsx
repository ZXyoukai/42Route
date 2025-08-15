import React, { useState } from 'react';
import { Image, Text, View, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

interface StudentProfileProps {
  onBack?: () => void;
}

export const StudentProfile = ({ onBack }: StudentProfileProps) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [autoAlerts, setAutoAlerts] = useState(false);

  const studentInfo = {
    name: 'João Silva',
    studentId: '42LU001',
    email: 'joao.silva@student.42luanda.ao',
    course: 'Common Core - Web Development',
    level: 'Level 3',
    preferredRoute: 'Rota Central',
    emergencyContact: '+244 923 456 789'
  };

  return (
    <View className="flex-1 bg-slate-900">
      <StatusBar style="light" backgroundColor="#0f172a" />
      
      {/* Header */}
      <View className="bg-gradient-to-br from-purple-600 to-indigo-700 pt-12 pb-6 px-6">
        <View className="flex-row items-center justify-between mb-4">
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
            <Text className="text-purple-600 text-3xl font-bold">
              {studentInfo.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          <Text className="text-white text-2xl font-bold">{studentInfo.name}</Text>
          <Text className="text-purple-100 text-sm">{studentInfo.studentId}</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Informações Pessoais */}
        <View className="bg-slate-800 rounded-2xl p-6 mb-6 shadow-lg border border-slate-700">
          <Text className="text-white text-xl font-bold mb-4">Informações Pessoais</Text>
          
          <View className="space-y-4">
            <View className="p-3 bg-slate-700 rounded-xl">
              <Text className="text-slate-400 text-sm font-medium">Email</Text>
              <Text className="text-white font-bold">{studentInfo.email}</Text>
            </View>
            
            <View className="p-3 bg-slate-700 rounded-xl">
              <Text className="text-slate-400 text-sm font-medium">Curso</Text>
              <Text className="text-white font-bold">{studentInfo.course}</Text>
            </View>
            
            <View className="p-3 bg-slate-700 rounded-xl">
              <Text className="text-slate-400 text-sm font-medium">Nível</Text>
              <Text className="text-white font-bold">{studentInfo.level}</Text>
            </View>
            
            <View className="p-3 bg-purple-900/30 rounded-xl border border-purple-600">
              <Text className="text-slate-400 text-sm font-medium">Rota Preferida</Text>
              <Text className="text-purple-400 font-bold">{studentInfo.preferredRoute}</Text>
            </View>
            
            <View className="p-3 bg-slate-700 rounded-xl">
              <Text className="text-slate-400 text-sm font-medium">Contacto de Emergência</Text>
              <Text className="text-white font-bold">{studentInfo.emergencyContact}</Text>
            </View>
          </View>
        </View>

        {/* Configurações de Notificação */}
        <View className="bg-slate-800 rounded-2xl p-6 mb-6 shadow-lg border border-slate-700">
          <Text className="text-white text-xl font-bold mb-4">Notificações</Text>
          
          <View className="flex-row justify-between items-center mb-4 p-3 bg-slate-700 rounded-xl">
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <Ionicons name="notifications" size={16} color="#a855f7" />
                <Text className="text-white font-medium ml-2">Notificações Push</Text>
              </View>
              <Text className="text-slate-400 text-sm">Receber alertas sobre os autocarros</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#374151', true: '#a855f7' }}
              thumbColor={notificationsEnabled ? '#ffffff' : '#64748b'}
            />
          </View>
          
          <View className="flex-row justify-between items-center mb-4 p-3 bg-slate-700 rounded-xl">
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <Ionicons name="location" size={16} color="#6366f1" />
                <Text className="text-white font-medium ml-2">Localização</Text>
              </View>
              <Text className="text-slate-400 text-sm">Permitir acesso à localização</Text>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              trackColor={{ false: '#374151', true: '#6366f1' }}
              thumbColor={locationEnabled ? '#ffffff' : '#64748b'}
            />
          </View>
          
          <View className="flex-row justify-between items-center p-3 bg-slate-700 rounded-xl">
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <MaterialIcons name="alarm" size={16} color="#8b5cf6" />
                <Text className="text-white font-medium ml-2">Alertas Automáticos</Text>
              </View>
              <Text className="text-slate-400 text-sm">Notificação 10 min antes da chegada</Text>
            </View>
            <Switch
              value={autoAlerts}
              onValueChange={setAutoAlerts}
              trackColor={{ false: '#374151', true: '#8b5cf6' }}
              thumbColor={autoAlerts ? '#ffffff' : '#64748b'}
            />
          </View>
        </View>

        {/* Estatísticas de Uso */}
        <View className="bg-slate-800 rounded-2xl p-6 mb-6 shadow-lg border border-slate-700">
          <Text className="text-white text-xl font-bold mb-4">Estatísticas</Text>
          
          <View className="flex-row justify-between mb-4">
            <View className="items-center flex-1">
              <View className="w-16 h-16 bg-purple-900/50 rounded-2xl items-center justify-center mb-2 border border-purple-700">
                <Text className="text-2xl font-bold text-purple-400">42</Text>
              </View>
              <Text className="text-slate-400 text-sm text-center font-medium">Viagens este mês</Text>
            </View>
            <View className="items-center flex-1">
              <View className="w-16 h-16 bg-emerald-900/50 rounded-2xl items-center justify-center mb-2 border border-emerald-700">
                <Text className="text-2xl font-bold text-emerald-400">98%</Text>
              </View>
              <Text className="text-slate-400 text-sm text-center font-medium">Pontualidade</Text>
            </View>
            <View className="items-center flex-1">
              <View className="w-16 h-16 bg-blue-900/50 rounded-2xl items-center justify-center mb-2 border border-blue-700">
                <Text className="text-2xl font-bold text-blue-400">15.2</Text>
              </View>
              <Text className="text-slate-400 text-sm text-center font-medium">Tempo médio (min)</Text>
            </View>
          </View>
          
          <View className="border-t border-slate-700 pt-4">
            <Text className="text-slate-400 text-sm text-center">
              Você usa o transporte 42Routes há <Text className="font-bold text-white">6 meses</Text>
            </Text>
          </View>
        </View>

        {/* Ações */}
        <View className="space-y-3 mb-6">
          <TouchableOpacity className="bg-slate-800 rounded-xl p-4 flex-row items-center justify-between shadow-lg border border-slate-700">
            <View className="flex-row items-center">
              <MaterialIcons name="route" size={20} color="#a855f7" />
              <Text className="text-white font-medium ml-3">Alterar Rota Preferida</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#64748b" />
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-slate-800 rounded-xl p-4 flex-row items-center justify-between shadow-lg border border-slate-700">
            <View className="flex-row items-center">
              <MaterialIcons name="schedule" size={20} color="#6366f1" />
              <Text className="text-white font-medium ml-3">Horários Personalizados</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#64748b" />
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-slate-800 rounded-xl p-4 flex-row items-center justify-between shadow-lg border border-slate-700">
            <View className="flex-row items-center">
              <MaterialIcons name="emoji-events" size={20} color="#f59e0b" />
              <Text className="text-white font-medium ml-3">Conquistas e Badges</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#64748b" />
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-slate-800 rounded-xl p-4 flex-row items-center justify-between shadow-lg border border-slate-700">
            <View className="flex-row items-center">
              <MaterialIcons name="help-outline" size={20} color="#10b981" />
              <Text className="text-white font-medium ml-3">Ajuda e Suporte</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#64748b" />
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-red-900/30 rounded-xl p-4 flex-row items-center justify-between border border-red-700">
            <View className="flex-row items-center">
              <MaterialIcons name="logout" size={20} color="#ef4444" />
              <Text className="text-red-400 font-medium ml-3">Terminar Sessão</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>

        {/* Versão da App */}
        <View className="items-center py-4">
          <Text className="text-slate-500 text-sm">42Routes v1.0.0</Text>
          <Text className="text-slate-600 text-xs">© 2024 42 Luanda</Text>
        </View>
      </ScrollView>
    </View>
  );
};
