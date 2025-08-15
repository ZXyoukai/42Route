import { Image, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

interface RouteInfo {
  id: string;
  name: string;
  status: 'ativo' | 'em_rota' | 'parado' | 'manutencao';
  nextStop: string;
  estimatedTime: string;
  passengers: number;
  capacity: number;
}

interface TransportDashboardProps {
  studentName?: string;
  onRouteSelect?: () => void;
  onProfileSelect?: () => void;
  onScheduleSelect?: () => void;
}

export const TransportDashboard = ({ studentName = "Estudante", onRouteSelect, onProfileSelect, onScheduleSelect }: TransportDashboardProps) => {
  const routes: RouteInfo[] = [
    {
      id: 'RT001',
      name: 'Rota Central',
      status: 'em_rota',
      nextStop: 'Campus 42 Luanda',
      estimatedTime: '15 min',
      passengers: 28,
      capacity: 35
    },
    {
      id: 'RT002', 
      name: 'Rota Maianga',
      status: 'ativo',
      nextStop: 'Estação Maianga',
      estimatedTime: '8 min',
      passengers: 31,
      capacity: 35
    },
    {
      id: 'RT003',
      name: 'Rota Ingombota',
      status: 'parado',
      nextStop: 'Terminal Ingombota',
      estimatedTime: '-- min',
      passengers: 0,
      capacity: 35
    },
  ];

  const getStatusColor = (status: RouteInfo['status']) => {
    switch (status) {
      case 'ativo': return 'bg-emerald-500';
      case 'em_rota': return 'bg-indigo-500';
      case 'parado': return 'bg-slate-400';
      case 'manutencao': return 'bg-rose-500';
      default: return 'bg-slate-400';
    }
  };

  const getStatusText = (status: RouteInfo['status']) => {
    switch (status) {
      case 'ativo': return 'Disponível';
      case 'em_rota': return 'Em Rota';
      case 'parado': return 'Parado';
      case 'manutencao': return 'Manutenção';
      default: return 'Desconhecido';
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar style="light" backgroundColor="#7c3aed" />
      
      {/* Header */}
      <View className="bg-gradient-to-br from-purple-600 to-indigo-700 pt-12 pb-6 px-6">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white text-lg font-medium">Bem-vindo, {studentName}!</Text>
            <Text className="text-purple-100 text-sm">Monitorize o seu transporte</Text>
          </View>
          <View className="flex-row items-center">
            <TouchableOpacity onPress={onProfileSelect} className="mr-3">
              <View className="w-8 h-8 bg-white/20 rounded-full items-center justify-center">
                <Text className="text-white text-sm">👤</Text>
              </View>
            </TouchableOpacity>
            <Image
              source={require('../assets/route_logo-w.png')}
              className="h-8"
              resizeMode="contain"
            />
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Status Geral */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-slate-100">
          <Text className="text-slate-800 text-xl font-bold mb-4">Estado Geral do Sistema</Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <View className="w-12 h-12 bg-emerald-100 rounded-xl items-center justify-center mb-2">
                <Text className="text-2xl font-bold text-emerald-600">2</Text>
              </View>
              <Text className="text-slate-600 text-sm font-medium">Ativos</Text>
            </View>
            <View className="items-center">
              <View className="w-12 h-12 bg-blue-100 rounded-xl items-center justify-center mb-2">
                <Text className="text-2xl font-bold text-blue-600">1</Text>
              </View>
              <Text className="text-slate-600 text-sm font-medium">Em Rota</Text>
            </View>
            <View className="items-center">
              <View className="w-12 h-12 bg-amber-100 rounded-xl items-center justify-center mb-2">
                <Text className="text-2xl font-bold text-amber-600">1</Text>
              </View>
              <Text className="text-slate-600 text-sm font-medium">Parados</Text>
            </View>
          </View>
        </View>

        {/* Lista de Rotas */}
        <View className="mb-6">
          <Text className="text-slate-800 text-xl font-bold mb-4">Rotas Disponíveis</Text>
          {routes.map((route) => (
            <TouchableOpacity
              key={route.id}
              className="bg-white rounded-2xl p-5 mb-4 shadow-lg border border-slate-100"
              activeOpacity={0.7}
              onPress={onRouteSelect}
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                  <Text className="text-slate-800 font-bold text-lg">{route.name}</Text>
                  <Text className="text-slate-500 text-sm font-medium">ID: {route.id}</Text>
                </View>
                <View className={`px-4 py-2 rounded-full ${getStatusColor(route.status)}`}>
                  <Text className="text-white text-xs font-bold">
                    {getStatusText(route.status)}
                  </Text>
                </View>
              </View>

              <View className="border-t border-slate-100 pt-4">
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="text-slate-500 text-sm font-medium">Próxima paragem:</Text>
                    <Text className="text-slate-800 font-bold">{route.nextStop}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-slate-500 text-sm font-medium">Chegada em:</Text>
                    <Text className="text-purple-600 font-bold text-xl">{route.estimatedTime}</Text>
                  </View>
                </View>

                <View className="mt-4 flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <View className="w-3 h-3 bg-indigo-500 rounded-full mr-3"></View>
                    <Text className="text-slate-600 text-sm font-medium">
                      Passageiros: {route.passengers}/{route.capacity}
                    </Text>
                  </View>
                  <View className="bg-slate-200 rounded-full h-2 flex-1 mx-4">
                    <View
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full"
                      style={{
                        width: `${(route.passengers / route.capacity) * 100}%`
                      }}
                    />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Ações Rápidas */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-slate-100">
          <Text className="text-slate-800 text-xl font-bold mb-4">Ações Rápidas</Text>
          <View className="flex-row justify-between">
            <TouchableOpacity className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl p-4 flex-1 mr-2 items-center border border-purple-200">
              <Text className="text-2xl mb-2">📍</Text>
              <Text className="text-purple-700 font-bold text-sm">Localizar</Text>
              <Text className="text-purple-600 text-xs mt-1">Meu Autocarro</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl p-4 flex-1 mx-1 items-center border border-emerald-200"
              onPress={onScheduleSelect}
            >
              <Text className="text-2xl mb-2">🕐</Text>
              <Text className="text-emerald-700 font-bold text-sm">Horários</Text>
              <Text className="text-emerald-600 text-xs mt-1">Ver Todos</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl p-4 flex-1 ml-2 items-center border border-blue-200">
              <Text className="text-2xl mb-2">📞</Text>
              <Text className="text-blue-700 font-bold text-sm">Suporte</Text>
              <Text className="text-blue-600 text-xs mt-1">Contactar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
