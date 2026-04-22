import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { BusLoadingScreen } from './BusLoadingScreen';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRoutes } from '../hooks/useRoutes';
import { useDrivers } from '../hooks/useDrivers';
import { Route, Driver } from '../types/api';
import { SCREEN_SUBTITLE } from './screenCopy';

interface RouteStatusCardProps {
  route: Route;
  onPress: () => void;
}

const RouteStatusCard = ({ route, onPress }: RouteStatusCardProps) => {
  const totalStops = route.stops?.length || 0;
  // Uma rota está ATIVA se há um driver com current_route_id = route.id
  const activeDriver = route.drivers?.find(d => d.current_route?.id === route.id);
  const isActive = !!activeDriver;
  const totalDrivers = activeDriver ? 1 : 0;
  
  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.8}
      className="bg-slate-800 rounded-[20px] p-[18px] mb-4 shadow-lg"
    >
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1 pr-3">
          <Text className="text-white text-[18px] font-bold">{route.route_name}</Text>
          {route.description && (
            <Text className="text-slate-400 text-[13px] mt-1" numberOfLines={2}>{route.description}</Text>
          )}
        </View>
        <View className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border ${isActive ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-700/50 border-slate-600'}`}>
          <View className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          <Text className={`text-[11px] font-bold ${isActive ? 'text-emerald-400' : 'text-slate-400'}`}>
            {isActive ? 'ATIVO' : 'PARADO'}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-4 bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
        <View className="flex-row items-center flex-1">
          <View className="w-8 h-8 rounded-full bg-[#00babc]/20 items-center justify-center mr-2 border border-[#00babc]/30">
            <Ionicons name="location" size={14} color="#00babc" />
          </View>
          <View>
            <Text className="text-slate-400 text-[11px] font-medium">Paragens</Text>
            <Text className="text-white text-[14px] font-bold">{totalStops}</Text>
          </View>
        </View>
        
        <View className="w-[1px] h-8 bg-slate-700" />
        
        <View className="flex-row items-center flex-1 pl-2">
          <View className="w-8 h-8 rounded-full bg-emerald-500/20 items-center justify-center mr-2 border border-emerald-500/30">
            <FontAwesome5 name="bus" size={12} color="#10b981" />
          </View>
          <View>
            <Text className="text-slate-400 text-[11px] font-medium">Motorista(s)</Text>
            <Text className="text-white text-[14px] font-bold">{totalDrivers}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

interface DashboardProps {
  studentName?: string;
  onRouteSelect?: (route: Route) => void;
}

export const TransportDashboardAPI = ({ studentName = "Estudante", onRouteSelect }: DashboardProps) => {
  const { routes, loading, error, fetchRoutes } = useRoutes();
  const { drivers } = useDrivers();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRoutes();
    setRefreshing(false);
  };

  // Uma rota está ATIVA se há um driver com current_route_id === route.id
  const activeRoutes = routes.filter(r => 
    r.drivers?.some(d => d.current_route?.id === r.id)
  );

  if (loading && !refreshing) {
    return <BusLoadingScreen msg="Carregando rotas..." />;
  }

  if (error) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center px-6">
        <Ionicons name="alert-circle" size={64} color="#ef4444" />
        <Text className="text-white text-xl font-bold mt-4 text-center">Erro ao carregar dados</Text>
        <Text className="text-slate-400 mt-2 text-center">{error}</Text>
        <TouchableOpacity 
          onPress={fetchRoutes}
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
      {/* Header */}
      <View className="bg-slate-800 pt-16 pb-8 px-6 border-b border-slate-700/80 rounded-b-[30px] shadow-2xl">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-slate-400 text-[13px] font-medium tracking-wide uppercase">Bem-vindo(a),</Text>
            <Text numberOfLines={1} className="text-white text-[28px] font-bold mt-1">{studentName}</Text>
            <Text numberOfLines={2} className="text-[#00babc] text-[12px] font-medium mt-1">
              {SCREEN_SUBTITLE.transportLive}
            </Text>
          </View>
 
        </View>

        {/* Quick Stats */}
        <View className="flex-row justify-between gap-4">
          <View className="flex-1 bg-slate-900/50 rounded-2xl p-4 border border-slate-700/50 items-center">
            <View className="w-10 h-10 rounded-full bg-[#00babc]/20 items-center justify-center mb-2 border border-[#00babc]/30">
              <MaterialIcons name="route" size={20} color="#00babc" />
            </View>
            <Text className="text-white text-2xl font-black">{activeRoutes.length}</Text>
            <Text className="text-slate-400 text-[11px] font-medium uppercase mt-1">Rotas Ativas</Text>
          </View>
          <View className="flex-1 bg-slate-900/50 rounded-2xl p-4 border border-slate-700/50 items-center">
            <View className="w-10 h-10 rounded-full bg-emerald-500/20 items-center justify-center mb-2 border border-emerald-500/30">
              <FontAwesome5 name="bus" size={16} color="#10b981" />
            </View>
            <Text className="text-white text-2xl font-black">
              {drivers.filter(d => d.current_route).length}
            </Text>
            <Text className="text-slate-400 text-[11px] font-medium uppercase mt-1">Veículos Movendo</Text>
          </View>
        </View>
      </View>

      {/* Routes List */}
      <ScrollView 
        className="flex-1 px-6 pt-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#00babc"
          />
        }
      >
        <View className="flex-row justify-between items-center mb-5">
          <View className="flex-row items-center gap-2">
            <MaterialIcons name="format-list-bulleted" size={20} color="#00babc" />
            <Text className="text-white text-lg font-bold">Rotas Disponíveis</Text>
          </View>
          <TouchableOpacity onPress={fetchRoutes} className="bg-slate-800 p-2 rounded-full border border-slate-700 shadow-sm">
            <Ionicons name="refresh" size={20} color="#00babc" />
          </TouchableOpacity>
        </View>

        {routes.length === 0 ? (
          <View className="bg-slate-800 rounded-2xl p-8 items-center">
            <FontAwesome5 name="bus-alt" size={48} color="#64748b" />
            <Text className="text-slate-400 text-center mt-4">
              Nenhuma rota disponível no momento
            </Text>
          </View>
        ) : (
          routes.map((route) => (
            <RouteStatusCard 
              key={route.id} 
              route={route}
              onPress={() => onRouteSelect?.(route)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};
