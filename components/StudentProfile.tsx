import { Image, Text, View, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';

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
    <View className="flex-1 bg-gray-50">
      <StatusBar style="light" backgroundColor="#0891b2" />
      
      {/* Header */}
      <View className="bg-cyan-600 pt-12 pb-6 px-6">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={onBack}>
            <Text className="text-white text-lg">← Voltar</Text>
          </TouchableOpacity>
          <Image
            source={require('../assets/route_logo-w.png')}
            className="h-8"
            resizeMode="contain"
          />
        </View>
        
        <View className="items-center">
          <View className="w-20 h-20 bg-white rounded-full items-center justify-center mb-3">
            <Text className="text-cyan-600 text-2xl font-bold">
              {studentInfo.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          <Text className="text-white text-xl font-bold">{studentInfo.name}</Text>
          <Text className="text-cyan-100 text-sm">{studentInfo.studentId}</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Informações Pessoais */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-gray-800 text-lg font-semibold mb-3">Informações Pessoais</Text>
          
          <View className="mb-3">
            <Text className="text-gray-600 text-sm">Email</Text>
            <Text className="text-gray-800 font-medium">{studentInfo.email}</Text>
          </View>
          
          <View className="mb-3">
            <Text className="text-gray-600 text-sm">Curso</Text>
            <Text className="text-gray-800 font-medium">{studentInfo.course}</Text>
          </View>
          
          <View className="mb-3">
            <Text className="text-gray-600 text-sm">Nível</Text>
            <Text className="text-gray-800 font-medium">{studentInfo.level}</Text>
          </View>
          
          <View className="mb-3">
            <Text className="text-gray-600 text-sm">Rota Preferida</Text>
            <Text className="text-cyan-600 font-medium">{studentInfo.preferredRoute}</Text>
          </View>
          
          <View>
            <Text className="text-gray-600 text-sm">Contacto de Emergência</Text>
            <Text className="text-gray-800 font-medium">{studentInfo.emergencyContact}</Text>
          </View>
        </View>

        {/* Configurações de Notificação */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-gray-800 text-lg font-semibold mb-3">Notificações</Text>
          
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-1">
              <Text className="text-gray-800 font-medium">Notificações Push</Text>
              <Text className="text-gray-600 text-sm">Receber alertas sobre os autocarros</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#d1d5db', true: '#0891b2' }}
              thumbColor={notificationsEnabled ? '#ffffff' : '#f4f3f4'}
            />
          </View>
          
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-1">
              <Text className="text-gray-800 font-medium">Localização</Text>
              <Text className="text-gray-600 text-sm">Permitir acesso à localização</Text>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              trackColor={{ false: '#d1d5db', true: '#0891b2' }}
              thumbColor={locationEnabled ? '#ffffff' : '#f4f3f4'}
            />
          </View>
          
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-gray-800 font-medium">Alertas Automáticos</Text>
              <Text className="text-gray-600 text-sm">Notificação 10 min antes da chegada</Text>
            </View>
            <Switch
              value={autoAlerts}
              onValueChange={setAutoAlerts}
              trackColor={{ false: '#d1d5db', true: '#0891b2' }}
              thumbColor={autoAlerts ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Estatísticas de Uso */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-gray-800 text-lg font-semibold mb-3">Estatísticas</Text>
          
          <View className="flex-row justify-between mb-4">
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-cyan-600">42</Text>
              <Text className="text-gray-600 text-xs text-center">Viagens este mês</Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-green-600">98%</Text>
              <Text className="text-gray-600 text-xs text-center">Pontualidade</Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-blue-600">15.2</Text>
              <Text className="text-gray-600 text-xs text-center">Tempo médio (min)</Text>
            </View>
          </View>
          
          <View className="border-t border-gray-100 pt-3">
            <Text className="text-gray-600 text-sm text-center">
              Você usa o transporte 42Routes há <Text className="font-semibold text-gray-800">6 meses</Text>
            </Text>
          </View>
        </View>

        {/* Ações */}
        <View className="space-y-3 mb-6">
          <TouchableOpacity className="bg-white rounded-xl p-4 flex-row items-center justify-between shadow-sm">
            <View className="flex-row items-center">
              <Text className="mr-3">🎯</Text>
              <Text className="text-gray-800 font-medium">Alterar Rota Preferida</Text>
            </View>
            <Text className="text-gray-400">›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-white rounded-xl p-4 flex-row items-center justify-between shadow-sm">
            <View className="flex-row items-center">
              <Text className="mr-3">📅</Text>
              <Text className="text-gray-800 font-medium">Horários Personalizados</Text>
            </View>
            <Text className="text-gray-400">›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-white rounded-xl p-4 flex-row items-center justify-between shadow-sm">
            <View className="flex-row items-center">
              <Text className="mr-3">🏆</Text>
              <Text className="text-gray-800 font-medium">Conquistas e Badges</Text>
            </View>
            <Text className="text-gray-400">›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-white rounded-xl p-4 flex-row items-center justify-between shadow-sm">
            <View className="flex-row items-center">
              <Text className="mr-3">❓</Text>
              <Text className="text-gray-800 font-medium">Ajuda e Suporte</Text>
            </View>
            <Text className="text-gray-400">›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-red-50 rounded-xl p-4 flex-row items-center justify-between border border-red-200">
            <View className="flex-row items-center">
              <Text className="mr-3">🚪</Text>
              <Text className="text-red-600 font-medium">Terminar Sessão</Text>
            </View>
            <Text className="text-red-400">›</Text>
          </TouchableOpacity>
        </View>

        {/* Versão da App */}
        <View className="items-center py-4">
          <Text className="text-gray-500 text-sm">42Routes v1.0.0</Text>
          <Text className="text-gray-400 text-xs">© 2024 42 Luanda</Text>
        </View>
      </ScrollView>
    </View>
  );
};
