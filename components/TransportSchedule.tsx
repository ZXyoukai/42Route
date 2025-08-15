import { Image, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useCustomAlert } from './CustomAlert';

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
  const { AlertComponent, showSuccess, showError, showWarning, showInfo } = useCustomAlert();

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

  const handleRoutePress = (route: ScheduleInfo) => {
    if (!route.isActive) {
      showError(
        'Rota Indisponível',
        `A ${route.routeName} está temporariamente fora de serviço. Por favor, consulte as rotas alternativas.`
      );
      return;
    }
    showInfo(
      'Informações da Rota',
      `${route.routeName} - Saída: ${route.departureTime}, Chegada: ${route.arrivalTime}, Duração: ${route.duration}`
    );
  };

  const handleSetAlert = (route: ScheduleInfo) => {
    if (!route.isActive) {
      showError(
        'Alerta Indisponível',
        'Não é possível criar alertas para rotas inativas.'
      );
      return;
    }
    showSuccess(
      'Alerta Criado!',
      `Receberá uma notificação 10 minutos antes da saída da ${route.routeName} (${route.departureTime}).`
    );
  };

  const handleEmergencyContact = () => {
    showWarning(
      'Contactar Emergência',
      'Será feita uma chamada de emergência. Use apenas em situações urgentes.',
      () => {
        showSuccess('Emergência Contactada', 'A equipa de emergência foi notificada.');
      }
    );
  };

  const handleSupportContact = () => {
    showInfo(
      'Suporte Técnico',
      'Será redirecionado para o WhatsApp do suporte técnico.'
    );
  };

  const renderScheduleCard = (schedule: ScheduleInfo) => (
    <TouchableOpacity
      key={`${schedule.routeId}-${schedule.departureTime}`}
      className={`rounded-2xl p-5 mb-4 shadow-lg border ${
        schedule.isActive ? 'bg-slate-800 border-slate-700' : 'bg-slate-800/50 border-slate-600'
      }`}
      activeOpacity={0.7}
      onPress={() => handleRoutePress(schedule)}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className={`font-bold text-lg ${schedule.isActive ? 'text-white' : 'text-slate-400'}`}>
            {schedule.routeName}
          </Text>
          <Text className={`text-sm ${schedule.isActive ? 'text-slate-400' : 'text-slate-500'}`}>
            ID: {schedule.routeId}
          </Text>
        </View>
        <View className={`px-3 py-1 rounded-full ${schedule.isActive ? 'bg-green-600' : 'bg-slate-600'}`}>
          <Text className="text-white text-xs font-bold">
            {schedule.isActive ? 'Ativo' : 'Inativo'}
          </Text>
        </View>
      </View>

      <View className="border-t border-slate-700 pt-4">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className={`text-sm font-medium ${schedule.isActive ? 'text-slate-400' : 'text-slate-500'}`}>
              Saída
            </Text>
            <Text className={`font-bold text-xl ${schedule.isActive ? 'text-white' : 'text-slate-400'}`}>
              {schedule.departureTime}
            </Text>
          </View>
          
          <View className="flex-1 items-center mx-4">
            <View className="flex-row items-center">
              <View className={`w-2 h-2 rounded-full ${schedule.isActive ? 'bg-cyan-400' : 'bg-slate-500'}`} 
                   style={schedule.isActive ? { backgroundColor: '#00babc' } : {}}></View>
              <View className={`flex-1 h-px mx-2 ${schedule.isActive ? 'bg-cyan-400' : 'bg-slate-600'}`}
                   style={schedule.isActive ? { backgroundColor: '#00babc' } : {}}></View>
              <Text className={`text-xs font-medium ${schedule.isActive ? 'text-cyan-400' : 'text-slate-500'}`}
                    style={schedule.isActive ? { color: '#00babc' } : {}}>
                {schedule.duration}
              </Text>
              <View className={`flex-1 h-px mx-2 ${schedule.isActive ? 'bg-cyan-400' : 'bg-slate-600'}`}
                   style={schedule.isActive ? { backgroundColor: '#00babc' } : {}}></View>
              <View className={`w-2 h-2 rounded-full ${schedule.isActive ? 'bg-cyan-400' : 'bg-slate-500'}`}
                   style={schedule.isActive ? { backgroundColor: '#00babc' } : {}}></View>
            </View>
          </View>
          
          <View>
            <Text className={`text-sm font-medium text-right ${schedule.isActive ? 'text-slate-400' : 'text-slate-500'}`}>
              Chegada
            </Text>
            <Text className={`font-bold text-xl text-right ${schedule.isActive ? 'text-white' : 'text-slate-400'}`}>
              {schedule.arrivalTime}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <MaterialIcons name="location-on" size={16} color={schedule.isActive ? "#00babc" : "#64748b"} />
            <Text className={`ml-1 text-sm font-medium ${schedule.isActive ? 'text-slate-300' : 'text-slate-500'}`}>
              {schedule.stops} paragens
            </Text>
          </View>
          
          <View className="flex-row items-center">
            <Ionicons name="time" size={16} color={schedule.isActive ? "#00babc" : "#64748b"} />
            <Text className={`ml-1 text-sm font-medium ${schedule.isActive ? 'text-slate-300' : 'text-slate-500'}`}>
              {schedule.frequency}
            </Text>
          </View>

          {schedule.isActive && (
            <TouchableOpacity
              className="bg-cyan-600 px-4 py-2 rounded-full"
              style={{ backgroundColor: '#00babc' }}
              onPress={() => handleSetAlert(schedule)}
            >
              <Text className="text-white text-xs font-bold">Definir Alerta</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
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
        
        <Text className="text-white text-3xl font-bold mb-2">Horários</Text>
        <Text className="text-cyan-100 text-base">Consulte os horários de todos os autocarros</Text>
      </View>

      <ScrollView className="flex-1 px-6 py-6">
        {/* Horários de Segunda a Sexta */}
        <View className="mb-8">
          <Text className="text-white text-2xl font-bold mb-4">Segunda a Sexta-feira</Text>
          {weekdays.map(renderScheduleCard)}
        </View>

        {/* Horários de Fim de Semana */}
        <View className="mb-8">
          <Text className="text-white text-2xl font-bold mb-4">Fins de Semana</Text>
          <View className="bg-amber-900/30 rounded-2xl p-4 mb-4 border border-amber-700">
            <View className="flex-row items-center">
              <MaterialIcons name="warning" size={20} color="#f59e0b" />
              <Text className="text-amber-400 font-bold ml-2">Serviço Limitado</Text>
            </View>
            <Text className="text-amber-200 text-sm mt-1">
              Aos fins de semana o serviço opera com horários reduzidos
            </Text>
          </View>
          {weekends.map(renderScheduleCard)}
        </View>

        {/* Contactos de Emergência */}
        <View className="mb-8">
          <Text className="text-white text-2xl font-bold mb-4">Contactos Úteis</Text>
          
          <TouchableOpacity 
            className="bg-red-900/30 rounded-2xl p-5 mb-4 border border-red-700"
            onPress={handleEmergencyContact}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <MaterialIcons name="emergency" size={24} color="#ef4444" />
                <View className="ml-3">
                  <Text className="text-red-400 font-bold text-lg">Emergência</Text>
                  <Text className="text-red-300 text-sm">+244 222 123 456</Text>
                </View>
              </View>
              <Ionicons name="call" size={20} color="#ef4444" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            className="bg-slate-800 rounded-2xl p-5 mb-4 shadow-lg border border-slate-700"
            onPress={handleSupportContact}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <MaterialIcons name="support-agent" size={24} color="#00babc" />
                <View className="ml-3">
                  <Text className="text-white font-bold text-lg">Suporte Técnico</Text>
                  <Text className="text-slate-400 text-sm">WhatsApp: +244 923 456 789</Text>
                </View>
              </View>
              <Ionicons name="logo-whatsapp" size={20} color="#25d366" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Atualização dos Horários */}
        <View className="items-center py-4">
          <Text className="text-slate-500 text-sm">Última atualização: 15 Ago 2025</Text>
          <Text className="text-slate-600 text-xs">Os horários estão sujeitos a alterações</Text>
        </View>
      </ScrollView>
      
      {/* Custom Alert Component */}
      {AlertComponent}
    </View>
  );
};
