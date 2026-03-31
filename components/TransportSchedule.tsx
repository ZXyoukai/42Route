import {
  useState,
} from 'react';
import { BusLoadingScreen } from './BusLoadingScreen';
import { Text, View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useCustomAlert } from './CustomAlert';
import { useRoutes } from '../hooks/useRoutes';
import { Route } from '../types/api';
import { ScheduleInfo } from './interfaces';
import { SCREEN_SUBTITLE } from './screenCopy';


interface TransportScheduleProps {
  onBack?: () => void;
}

/** Converte uma Route da API num ScheduleInfo para a UI */
function routeToScheduleInfo(route: Route): ScheduleInfo {
  const hasDriver = (route.drivers?.length ?? 0) > 0;
  return {
    routeName: route.route_name,
    routeId: `RT${String(route.id).padStart(3, '0')}`,
    departureTime: '--:--',
    arrivalTime: '--:--',
    duration: '--',
    stops: route.stops?.length ?? 0,
    frequency: hasDriver ? 'Em rota' : 'Sem motorista',
    isActive: hasDriver,
  };
}

export const TransportSchedule = ({ onBack }: TransportScheduleProps) => {
  const { AlertComponent, showSuccess, showError, showWarning, showInfo } = useCustomAlert();
  const { routes, loading, error, fetchRoutes } = useRoutes();

  const weekdays: ScheduleInfo[] = routes.map(routeToScheduleInfo);

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
        schedule.isActive ? 'border-1-2 border-gray-300' : ''
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
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRoutes();
    setRefreshing(false);
  };

  return (
    <View className="flex-1 bg-slate-900">
      <StatusBar style="light" />
      
      {(loading || refreshing) && <BusLoadingScreen msg="A carregar horários..." />}
      {/* Header */}
      {!loading  &&
      <View className="bg-gradient-to-br flex-row items-center gap-x-3 pt-12 pb-6 px-6 border-b-2 border-[#00babc]">
        <View className="flex justify-between">
          <TouchableOpacity
            onPress={onBack}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(15,23,42,0.9)', borderWidth: 1, borderColor: '#334155', alignItems: 'center', justifyContent: 'center' }}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <View>
          <Text className="text-white text-2xl font-bold mb-2 mt-2">Horários</Text>
          <Text numberOfLines={2} className="text-slate-400 text-[12px] font-medium">
            {SCREEN_SUBTITLE.transportLive}
          </Text>
        </View>
      </View>}

      {!loading  &&

      <ScrollView
        className="flex-1 px-6 py-6"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00babc"
            colors={['#00babc']}
          />
        }
      >
        {/* Rotas (Horários) */}
        <View className="mb-8">
          <Text className="text-white text-2xl font-bold mb-4">Segunda a Sexta-feira</Text>
          {error ? (
            <View className="bg-red-900/20 border border-red-700 rounded-2xl p-5 mb-4">
              <Text className="text-red-400 font-bold mb-1">Erro ao carregar horários</Text>
              <Text className="text-red-300 text-sm">{error}</Text>
              <TouchableOpacity
                onPress={fetchRoutes}
                className="mt-3 px-4 py-2 rounded-xl"
                style={{ backgroundColor: '#00babc', alignSelf: 'flex-start' }}
              >
                <Text className="text-white text-xs font-bold">Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          ) : weekdays.length === 0 && !loading ? (
            <View className="bg-slate-800 border border-slate-700 rounded-2xl p-5 mb-4 items-center">
              <MaterialIcons name="directions-bus" size={40} color="#64748b" />
              <Text className="text-slate-400 mt-3 text-center">Nenhuma rota disponível de momento.</Text>
            </View>
          ) : (
            weekdays.map(renderScheduleCard)
          )}
        </View>


        {/* Contactos de Emergência */}
        <View className="mb-8">
          <Text className="text-white text-2xl font-bold mb-4">Contactos Úteis</Text>
          
          <TouchableOpacity 
            className="bg-red-900/30 rounded-2xl p-5 mb-4 "
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
            className="bg-slate-800 rounded-2xl p-5 mb-4 shadow-lg "
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
      </ScrollView>}
      
      {/* Custom Alert Component */}
      {AlertComponent}
      
    </View>
  );
};
