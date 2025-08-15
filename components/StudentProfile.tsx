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
      <View className="bg-gradient-to-br  from-cyan-500 to-teal-600 mt-14 pb-2 px-6" style={{ backgroundColor: '#00babc' }}>
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={onBack} className="flex-row items-center">
            <Ionicons name="arrow-back" size={24} color="white" />
            <Text className="text-white text-lg font-medium ml-2">Voltar</Text>
          </TouchableOpacity>
          <Image
            source={require('../assets/route_logo-w.png')}
            className="h-14 top-5 right-24"
            resizeMode="contain"
          />
        </View>
        
        <View className="items-center">
          <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-4 shadow-lg">
            <Text className="text-cyan-600 text-3xl font-bold" style={{ color: '#00babc' }}>
              {studentInfo.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          <Text className="text-white text-2xl font-bold">{studentInfo.name}</Text>
          <Text className="text-cyan-100 text-sm">{studentInfo.studentId}</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-8">
        {/* Informações Pessoais */}
        <View className="bg-slate-800 rounded-2xl p-6 mb-6 shadow-lg space-y-4  border border-slate-700">
          <Text className="text-white text-xl font-bold mb-4">Informações Pessoais</Text>
          
          <View className="gap-y-2">
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
            
            <View className="p-3 bg-cyan-900/30 rounded-xl border border-cyan-600">
              <Text className="text-slate-400 text-sm font-medium">Rota Preferida</Text>
              <Text className="text-cyan-400 font-bold" style={{ color: '#00babc' }}>{studentInfo.preferredRoute}</Text>
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
                <Ionicons name="notifications" size={16} color="#00babc" />
                <Text className="text-white font-medium ml-2">Notificações Push</Text>
              </View>
              <Text className="text-slate-400 text-sm">Receber alertas sobre os autocarros</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#374151', true: '#00babc' }}
              thumbColor={notificationsEnabled ? '#ffffff' : '#64748b'}
            />
          </View>
          
          <View className="flex-row justify-between items-center mb-4 p-3 bg-slate-700 rounded-xl">
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <Ionicons name="location" size={16} color="#00babc" />
                <Text className="text-white font-medium ml-2">Localização</Text>
              </View>
              <Text className="text-slate-400 text-sm">Permitir acesso à localização</Text>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              trackColor={{ false: '#374151', true: '#00babc' }}
              thumbColor={locationEnabled ? '#ffffff' : '#64748b'}
            />
          </View>
          
          <View className="flex-row justify-between items-center p-3 bg-slate-700 rounded-xl">
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <MaterialIcons name="alarm" size={16} color="#00babc" />
                <Text className="text-white font-medium ml-2">Alertas Automáticos</Text>
              </View>
              <Text className="text-slate-400 text-sm">Notificação 10 min antes da chegada</Text>
            </View>
            <Switch
              value={autoAlerts}
              onValueChange={setAutoAlerts}
              trackColor={{ false: '#374151', true: '#00babc' }}
              thumbColor={autoAlerts ? '#ffffff' : '#64748b'}
            />
          </View>
        </View>

        {/* Estatísticas de Uso */}
        <View className="bg-slate-800 rounded-2xl p-6 mb-6 shadow-lg border border-slate-700">
          <Text className="text-white text-xl font-bold mb-4">Estatísticas</Text>
          
          <View className="flex-row justify-between mb-4">
            <View className="items-center flex-1">
              <View className="w-16 h-16 bg-cyan-900/50 rounded-2xl items-center justify-center mb-2 border border-cyan-700" style={{ backgroundColor: 'rgba(0, 186, 188, 0.1)', borderColor: '#00babc' }}>
                <Text className="text-2xl font-bold text-cyan-400" style={{ color: '#00babc' }}>42</Text>
              </View>
              <Text className="text-slate-400 text-sm text-center font-medium">Viagens este mês</Text>
            </View>
            <View className="items-center flex-1">
              <View className="w-16 h-16 bg-cyan-900/50 rounded-2xl items-center justify-center mb-2 border border-cyan-700" style={{ backgroundColor: 'rgba(0, 186, 188, 0.1)', borderColor: '#00babc' }}>
                <Text className="text-2xl font-bold text-cyan-400" style={{ color: '#00babc' }}>98%</Text>
              </View>
              <Text className="text-slate-400 text-sm text-center font-medium">Pontualidade</Text>
            </View>
            <View className="items-center flex-1">
              <View className="w-16 h-16 bg-cyan-900/50 rounded-2xl items-center justify-center mb-2 border border-cyan-700" style={{ backgroundColor: 'rgba(0, 186, 188, 0.1)', borderColor: '#00babc' }}>
                <Text className="text-2xl font-bold text-cyan-400" style={{ color: '#00babc' }}>15.2</Text>
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
        <View className="gap-y-2 mb-6">
          <TouchableOpacity className="bg-slate-800 rounded-xl p-4 flex-row items-center justify-between shadow-lg border border-slate-700">
            <View className="flex-row items-center">
              <MaterialIcons name="route" size={20} color="#00babc" />
              <Text className="text-white font-medium ml-3">Alterar Rota Preferida</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#64748b" />
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-slate-800 rounded-xl p-4 flex-row items-center justify-between shadow-lg border border-slate-700">
            <View className="flex-row items-center">
              <MaterialIcons name="schedule" size={20} color="#00babc" />
              <Text className="text-white font-medium ml-3">Horários Personalizados</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#64748b" />
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-slate-800 rounded-xl p-4 flex-row items-center justify-between shadow-lg border border-slate-700">
            <View className="flex-row items-center">
              <MaterialIcons name="emoji-events" size={20} color="#00babc" />
              <Text className="text-white font-medium ml-3">Conquistas e Badges</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#64748b" />
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-slate-800 rounded-xl p-4 flex-row items-center justify-between shadow-lg border border-slate-700">
            <View className="flex-row items-center">
              <MaterialIcons name="help-outline" size={20} color="#00babc" />
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
