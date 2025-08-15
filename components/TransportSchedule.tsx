import { Image, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

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
          ? 'bg-white border-slate-100'
          : 'bg-slate-100 border-slate-200'
      }`}
    >
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1">
          <Text className={`font-bold text-lg ${
            schedule.isActive ? 'text-slate-800' : 'text-slate-500'
          }`}>
            {schedule.routeName}
          </Text>
          <Text className={`text-sm font-medium ${
            schedule.isActive ? 'text-slate-600' : 'text-slate-400'
          }`}>
            {schedule.routeId} • {schedule.stops} paragens
          </Text>
        </View>
        <View className={`px-4 py-2 rounded-full ${
          schedule.isActive ? 'bg-emerald-100' : 'bg-slate-200'
        }`}>
          <Text className={`text-sm font-bold ${
            schedule.isActive ? 'text-emerald-700' : 'text-slate-600'
          }`}>
            {schedule.isActive ? 'Ativo' : 'Inativo'}
          </Text>
        </View>
      </View>

      <View className="bg-slate-50 rounded-xl p-4">
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className={`text-sm font-medium ${
              schedule.isActive ? 'text-slate-600' : 'text-slate-400'
            }`}>
              Partida - Chegada
            </Text>
            <Text className={`font-bold text-xl ${
              schedule.isActive ? 'text-purple-600' : 'text-slate-500'
            }`}>
              {schedule.departureTime} - {schedule.arrivalTime}
            </Text>
          </View>
          <View className="items-center">
            <Text className={`text-sm font-medium ${
              schedule.isActive ? 'text-slate-600' : 'text-slate-400'
            }`}>
              Duração
            </Text>
            <Text className={`font-bold ${
              schedule.isActive ? 'text-slate-800' : 'text-slate-500'
            }`}>
              {schedule.duration}
            </Text>
          </View>
          <View className="items-end">
            <Text className={`text-sm font-medium ${
              schedule.isActive ? 'text-slate-600' : 'text-slate-400'
            }`}>
              Frequência
            </Text>
            <Text className={`font-bold text-right ${
              schedule.isActive ? 'text-slate-800' : 'text-slate-500'
            }`}>
              {schedule.frequency}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar style="light" backgroundColor="#7c3aed" />
      
      {/* Header */}
      <View className="bg-gradient-to-br from-purple-600 to-indigo-700 pt-12 pb-6 px-6">
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
        
        <View>
          <Text className="text-white text-xl font-bold">Horários de Transporte</Text>
          <Text className="text-purple-100 text-sm">Consulte todos os horários disponíveis</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Informações Importantes */}
        <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <View className="flex-row items-start">
            <Text className="text-blue-600 mr-2">ℹ️</Text>
            <View className="flex-1">
              <Text className="text-blue-800 font-medium text-sm mb-1">Informações Importantes</Text>
              <Text className="text-blue-700 text-xs">
                • Chegue à paragem 5 minutos antes{'\n'}
                • Tenha sempre o seu cartão de estudante{'\n'}
                • Horários podem variar em caso de trânsito intenso
              </Text>
            </View>
          </View>
        </View>

        {/* Horários de Segunda a Sexta */}
        <View className="mb-6">
          <Text className="text-slate-800 text-xl font-bold mb-4">Segunda a Sexta-feira</Text>
          {weekdays.map(renderScheduleCard)}
        </View>

        {/* Horários de Fim de Semana */}
        <View className="mb-6">
          <Text className="text-slate-800 text-xl font-bold mb-4">Sábados e Domingos</Text>
          {weekends.map(renderScheduleCard)}
        </View>

        {/* Horários Especiais */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-gray-800 text-lg font-semibold mb-3">Horários Especiais</Text>
          
          <View className="mb-3">
            <Text className="text-gray-800 font-medium">🎄 Época Natalícia (Dezembro)</Text>
            <Text className="text-gray-600 text-sm">Horários reduzidos - apenas Rota Central</Text>
            <Text className="text-cyan-600 font-medium">09:00 - 17:00 (a cada 2 horas)</Text>
          </View>
          
          <View className="mb-3">
            <Text className="text-gray-800 font-medium">📚 Período de Exames</Text>
            <Text className="text-gray-600 text-sm">Horários alargados durante as avaliações</Text>
            <Text className="text-cyan-600 font-medium">07:00 - 22:00 (a cada 20 min)</Text>
          </View>
          
          <View>
            <Text className="text-gray-800 font-medium">🏖️ Férias de Verão</Text>
            <Text className="text-gray-600 text-sm">Serviço limitado apenas para atividades especiais</Text>
            <Text className="text-gray-500 font-medium">Mediante marcação prévia</Text>
          </View>
        </View>

        {/* Contactos para Mais Informações */}
        <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <Text className="text-gray-800 text-lg font-semibold mb-3">Mais Informações</Text>
          
          <TouchableOpacity className="flex-row items-center justify-between mb-3 p-2 bg-gray-50 rounded-lg">
            <View className="flex-row items-center">
              <Text className="mr-3">📞</Text>
              <View>
                <Text className="text-gray-800 font-medium">Central de Transportes</Text>
                <Text className="text-gray-600 text-sm">+244 222 123 456</Text>
              </View>
            </View>
            <Text className="text-gray-400">›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center justify-between mb-3 p-2 bg-gray-50 rounded-lg">
            <View className="flex-row items-center">
              <Text className="mr-3">✉️</Text>
              <View>
                <Text className="text-gray-800 font-medium">Email de Suporte</Text>
                <Text className="text-gray-600 text-sm">transport@42luanda.ao</Text>
              </View>
            </View>
            <Text className="text-gray-400">›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center justify-between p-2 bg-gray-50 rounded-lg">
            <View className="flex-row items-center">
              <Text className="mr-3">🌐</Text>
              <View>
                <Text className="text-gray-800 font-medium">Portal do Estudante</Text>
                <Text className="text-gray-600 text-sm">portal.42luanda.ao</Text>
              </View>
            </View>
            <Text className="text-gray-400">›</Text>
          </TouchableOpacity>
        </View>

        {/* Atualização dos Horários */}
        <View className="items-center py-4">
          <Text className="text-gray-500 text-sm">Última atualização: 15 Ago 2025</Text>
          <Text className="text-gray-400 text-xs">Os horários estão sujeitos a alterações</Text>
        </View>
      </ScrollView>
    </View>
  );
};
