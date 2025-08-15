import { Image, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

interface ScheduleInfo {
  routeName: string;
  routeId: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  frequency: string;
  isActive: boolean;
}

interface TransportScheduleProps {
  onBack?: () => void;
}

export const TransportSchedule = ({ onBack }: TransportScheduleProps) => {
  const weekdays: ScheduleInfo[] = [
    {
      routeName: 'Rota Central',
      routeId: 'RT001',
      departureTime: '07:30',
      arrivalTime: '08:25',
      duration: '55 min',
      stops: 4,
      frequency: 'A cada 30 min',
      isActive: true
    },
    {
      routeName: 'Rota Maianga',
      routeId: 'RT002',
      departureTime: '07:45',
      arrivalTime: '08:30',
      duration: '45 min',
      stops: 3,
      frequency: 'A cada 45 min',
      isActive: true
    },
    {
      routeName: 'Rota Ingombota',
      routeId: 'RT003',
      departureTime: '08:00',
      arrivalTime: '08:50',
      duration: '50 min',
      stops: 5,
      frequency: 'A cada hora',
      isActive: false
    }
  ];

  const weekends: ScheduleInfo[] = [
    {
      routeName: 'Rota Central',
      routeId: 'RT001',
      departureTime: '09:00',
      arrivalTime: '09:55',
      duration: '55 min',
      stops: 4,
      frequency: 'A cada hora',
      isActive: true
    },
    {
      routeName: 'Rota Maianga',
      routeId: 'RT002',
      departureTime: '09:30',
      arrivalTime: '10:15',
      duration: '45 min',
      stops: 3,
      frequency: 'A cada 2 horas',
      isActive: true
    }
  ];

  const renderScheduleCard = (schedule: ScheduleInfo) => (
    <View
      key={schedule.routeId}
      className={`rounded-2xl p-5 mb-4 border shadow-lg ${
        schedule.isActive
          ? 'bg-slate-800 border-slate-700'
          : 'bg-slate-800/50 border-slate-600'
      }`}
    >
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1">
          <Text className={`font-bold text-lg ${
            schedule.isActive ? 'text-white' : 'text-slate-400'
          }`}>
            {schedule.routeName}
          </Text>
          <Text               className={`text-sm font-medium ${
              schedule.isActive ? 'text-cyan-400' : 'text-slate-400'
            }`}
            style={schedule.isActive ? { color: '#00babc' } : {}}>
            {schedule.routeId} • {schedule.stops} paragens
          </Text>
        </View>
        <View className={`px-4 py-2 rounded-full ${
          schedule.isActive ? 'bg-emerald-600' : 'bg-slate-600'
        }`}>
          <Text className={`text-sm font-bold ${
            schedule.isActive ? 'text-white' : 'text-slate-300'
          }`}>
            {schedule.isActive ? 'Ativo' : 'Inativo'}
          </Text>
        </View>
      </View>

      <View className="bg-slate-700 rounded-xl p-4">
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className={`text-sm font-medium ${
              schedule.isActive ? 'text-slate-300' : 'text-slate-500'
            }`}>
              Partida - Chegada
            </Text>
            <Text className={`font-bold text-xl ${
              schedule.isActive ? 'text-purple-400' : 'text-slate-400'
            }`}>
              {schedule.departureTime} - {schedule.arrivalTime}
            </Text>
          </View>
          <View className="items-center">
            <Text className={`text-sm font-medium ${
              schedule.isActive ? 'text-slate-300' : 'text-slate-500'
            }`}>
              Duração
            </Text>
            <Text className={`font-bold ${
              schedule.isActive ? 'text-white' : 'text-slate-400'
            }`}>
              {schedule.duration}
            </Text>
          </View>
          <View className="items-end">
            <Text className={`text-sm font-medium ${
              schedule.isActive ? 'text-slate-300' : 'text-slate-500'
            }`}>
              Frequência
            </Text>
            <Text className={`font-bold text-right ${
              schedule.isActive ? 'text-white' : 'text-slate-400'
            }`}>
              {schedule.frequency}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-slate-900">
      <StatusBar style="light" backgroundColor="#0f172a" />
      
      {/* Header */}
      <View className="bg-gradient-to-br from-cyan-500 to-teal-600 pt-12 pb-6 px-6" style={{ backgroundColor: '#00babc' }}>
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={onBack} className="flex-row items-center">
            <Ionicons name="arrow-back" size={24} color="white" />
            <Text className="text-white text-lg font-medium ml-2">Voltar</Text>
          </TouchableOpacity>
          <Image
            source={require('../assets/route_logo-w.png')}
            className="h-8"
            resizeMode="contain"
          />
        </View>
        
        <View>
          <Text className="text-white text-xl font-bold">Horários de Transporte</Text>
          <Text className="text-cyan-100 text-sm">Consulte todos os horários disponíveis</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Informações Importantes */}
        <View className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-4 shadow-lg">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#06b6d4" />
            <View className="flex-1 ml-3">
              <Text className="text-cyan-400 font-medium text-sm mb-1">Informações Importantes</Text>
              <Text className="text-slate-300 text-xs">
                • Chegue à paragem 5 minutos antes{'\n'}
                • Tenha sempre o seu cartão de estudante{'\n'}
                • Horários podem variar em caso de trânsito intenso
              </Text>
            </View>
          </View>
        </View>

        {/* Horários de Segunda a Sexta */}
        <View className="mb-6">
          <Text className="text-white text-xl font-bold mb-4">Segunda a Sexta-feira</Text>
          {weekdays.map(renderScheduleCard)}
        </View>

        {/* Horários de Fim de Semana */}
        <View className="mb-6">
          <Text className="text-white text-xl font-bold mb-4">Sábados e Domingos</Text>
          {weekends.map(renderScheduleCard)}
        </View>

        {/* Horários Especiais */}
        <View className="bg-slate-800 rounded-xl p-4 mb-4 shadow-lg border border-slate-700">
          <Text className="text-white text-lg font-semibold mb-3">Horários Especiais</Text>
          
          <View className="mb-3">
            <View className="flex-row items-center mb-1">
              <Ionicons name="snow" size={16} color="#ef4444" />
              <Text className="text-white font-medium ml-2">Época Natalícia (Dezembro)</Text>
            </View>
            <Text className="text-slate-400 text-sm">Horários reduzidos - apenas Rota Central</Text>
            <Text className="text-cyan-400 font-medium" style={{ color: '#00babc' }}>09:00 - 17:00 (a cada 2 horas)</Text>
          </View>
          
          <View className="mb-3">
            <View className="flex-row items-center mb-1">
              <MaterialIcons name="book" size={16} color="#10b981" />
              <Text className="text-white font-medium ml-2">Período de Exames</Text>
            </View>
            <Text className="text-slate-400 text-sm">Horários alargados durante as avaliações</Text>
            <Text className="text-cyan-400 font-medium" style={{ color: '#00babc' }}>07:00 - 22:00 (a cada 20 min)</Text>
          </View>
          
          <View>
            <View className="flex-row items-center mb-1">
              <Ionicons name="sunny" size={16} color="#f59e0b" />
              <Text className="text-white font-medium ml-2">Férias de Verão</Text>
            </View>
            <Text className="text-slate-400 text-sm">Serviço limitado apenas para atividades especiais</Text>
            <Text className="text-slate-500 font-medium">Mediante marcação prévia</Text>
          </View>
        </View>

        {/* Contactos para Mais Informações */}
        <View className="bg-slate-800 rounded-xl p-4 mb-6 shadow-lg border border-slate-700">
          <Text className="text-white text-lg font-semibold mb-3">Mais Informações</Text>
          
          <TouchableOpacity className="flex-row items-center justify-between mb-3 p-3 bg-slate-700 rounded-lg">
            <View className="flex-row items-center">
              <MaterialIcons name="phone" size={20} color="#a855f7" />
              <View className="ml-3">
                <Text className="text-white font-medium">Central de Transportes</Text>
                <Text className="text-slate-400 text-sm">+244 222 123 456</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#64748b" />
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center justify-between mb-3 p-3 bg-slate-700 rounded-lg">
            <View className="flex-row items-center">
              <MaterialIcons name="email" size={20} color="#6366f1" />
              <View className="ml-3">
                <Text className="text-white font-medium">Email de Suporte</Text>
                <Text className="text-slate-400 text-sm">transport@42luanda.ao</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#64748b" />
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center justify-between p-3 bg-slate-700 rounded-lg">
            <View className="flex-row items-center">
              <MaterialIcons name="language" size={20} color="#10b981" />
              <View className="ml-3">
                <Text className="text-white font-medium">Portal do Estudante</Text>
                <Text className="text-slate-400 text-sm">portal.42luanda.ao</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Atualização dos Horários */}
        <View className="items-center py-4">
          <Text className="text-slate-500 text-sm">Última atualização: 15 Ago 2025</Text>
          <Text className="text-slate-600 text-xs">Os horários estão sujeitos a alterações</Text>
        </View>
      </ScrollView>
    </View>
  );
};
