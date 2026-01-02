import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRoutes } from '../hooks/useRoutes';
import { useDrivers } from '../hooks/useDrivers';
import { Route, Driver } from '../types/api';

interface RouteStatusCardProps {
  route: Route;
  onPress: () => void;
}

const RouteStatusCard = ({ route, onPress }: RouteStatusCardProps) => {
  const activeDrivers = route.drivers?.filter(d => d.current_route?.id === route.id) || [];
  const totalStops = route.stops?.length || 0;
  
  return (
    <TouchableOpacity 
      onPress={onPress}
      className="bg-slate-800 rounded-2xl p-5 mb-4 border border-slate-700"
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-white text-lg font-bold">{route.route_name}</Text>
          {route.description && (
            <Text className="text-slate-400 text-sm mt-1">{route.description}</Text>
          )}
        </View>
        <View className={`px-3 py-1 rounded-full ${activeDrivers.length > 0 ? 'bg-emerald-900/30 border border-emerald-600' : 'bg-slate-700'}`}>
          <Text className={`text-xs font-bold ${activeDrivers.length > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
            {activeDrivers.length > 0 ? 'ATIVO' : 'PARADO'}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <FontAwesome5 name="map-marked-alt" size={14} color="#00babc" />
          <Text className="text-slate-300 ml-2 text-sm">{totalStops} paragens</Text>
        </View>
        
        <View className="flex-row items-center">
          <FontAwesome5 name="bus" size={14} color="#00babc" />
          <Text className="text-slate-300 ml-2 text-sm">{activeDrivers.length} motorista(s)</Text>
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

  const activeRoutes = routes.filter(r => 
    r.drivers?.some(d => d.current_route?.id === r.id)
  );

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center">
        <ActivityIndicator size="large" color="#00babc" />
        <Text className="text-white mt-4">Carregando rotas...</Text>
      </View>
    );
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
      <View className="border-b-2 border-[#00babc] pt-12 pb-6 px-6">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-slate-400 text-sm">Bem-vindo(a),</Text>
            <Text className="text-white text-2xl font-bold">{studentName}</Text>
          </View>
          <TouchableOpacity className="w-12 h-12 bg-slate-800 rounded-full items-center justify-center border border-cyan-600">
            <Ionicons name="person" size={24} color="#00babc" />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View className="flex-row justify-between mt-4">
          <View className="flex-1 bg-slate-800 rounded-xl p-3 mr-2 border border-slate-700">
            <Text className="text-slate-400 text-xs">Rotas Ativas</Text>
            <Text className="text-cyan-400 text-2xl font-bold" style={{ color: '#00babc' }}>
              {activeRoutes.length}
            </Text>
          </View>
          <View className="flex-1 bg-slate-800 rounded-xl p-3 ml-2 border border-slate-700">
            <Text className="text-slate-400 text-xs">Motoristas</Text>
            <Text className="text-emerald-400 text-2xl font-bold">
              {drivers.filter(d => d.current_route).length}
            </Text>
          </View>
        </View>
      </View>

      {/* Routes List */}
      <ScrollView 
        className="flex-1 px-6 py-4"
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#00babc"
          />
        }
      >
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white text-xl font-bold">Rotas Disponíveis</Text>
          <TouchableOpacity onPress={fetchRoutes}>
            <Ionicons name="refresh" size={24} color="#00babc" />
          </TouchableOpacity>
        </View>

        {routes.length === 0 ? (
          <View className="bg-slate-800 rounded-2xl p-8 items-center border border-slate-700">
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
