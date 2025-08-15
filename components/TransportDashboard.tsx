import { Image, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

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
    <View className="flex-1 bg-slate-900">
      <StatusBar style="light" backgroundColor="#0f172a" />
      
      {/* Header */}
      <View className="bg-gradient-to-br from-purple-600 to-indigo-700 pt-12 pb-6 px-6">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white text-lg font-medium">Bem-vindo, {studentName}!</Text>
            <Text className="text-purple-100 text-sm">Monitorize o seu transporte</Text>
          </View>
          <View className="flex-row items-center">
            <TouchableOpacity onPress={onProfileSelect} className="mr-4">
              <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
                <Ionicons name="person" size={20} color="white" />
              </View>
            </TouchableOpacity>
            <Image
              source={require('../assets/route_logo-w.png')}
              className="h-10"
              resizeMode="contain"
            />
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Status Geral */}
        <View className="bg-slate-800 rounded-2xl p-6 mb-6 shadow-lg border border-slate-700">
          <Text className="text-white text-xl font-bold mb-4">Estado Geral do Sistema</Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <View className="w-12 h-12 bg-emerald-900/50 rounded-xl items-center justify-center mb-2 border border-emerald-700">
                <FontAwesome5 name="bus" size={18} color="#10b981" />
              </View>
              <Text className="text-2xl font-bold text-emerald-400">2</Text>
              <Text className="text-slate-400 text-sm font-medium">Ativos</Text>
            </View>
            <View className="items-center">
              <View className="w-12 h-12 bg-blue-900/50 rounded-xl items-center justify-center mb-2 border border-blue-700">
                <MaterialIcons name="directions-bus" size={20} color="#3b82f6" />
              </View>
              <Text className="text-2xl font-bold text-blue-400">1</Text>
              <Text className="text-slate-400 text-sm font-medium">Em Rota</Text>
            </View>
            <View className="items-center">
              <View className="w-12 h-12 bg-amber-900/50 rounded-xl items-center justify-center mb-2 border border-amber-700">
                <MaterialIcons name="pause-circle-outline" size={20} color="#f59e0b" />
              </View>
              <Text className="text-2xl font-bold text-amber-400">1</Text>
              <Text className="text-slate-400 text-sm font-medium">Parados</Text>
            </View>
          </View>
        </View>

        {/* Lista de Rotas */}
        <View className="mb-6">
          <Text className="text-white text-xl font-bold mb-4">Rotas Disponíveis</Text>
          {routes.map((route) => (
            <TouchableOpacity
              key={route.id}
              className="bg-slate-800 rounded-2xl p-5 mb-4 shadow-lg border border-slate-700"
              activeOpacity={0.7}
              onPress={onRouteSelect}
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                  <Text className="text-white font-bold text-lg">{route.name}</Text>
                  <Text className="text-slate-400 text-sm font-medium">ID: {route.id}</Text>
                </View>
                <View className={`px-4 py-2 rounded-full ${getStatusColor(route.status)}`}>
                  <Text className="text-white text-xs font-bold">
                    {getStatusText(route.status)}
                  </Text>
                </View>
              </View>

              <View className="border-t border-slate-700 pt-4">
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="text-slate-400 text-sm font-medium">Próxima paragem:</Text>
                    <Text className="text-white font-bold">{route.nextStop}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-slate-400 text-sm font-medium">Chegada em:</Text>
                    <Text className="text-purple-400 font-bold text-xl">{route.estimatedTime}</Text>
                  </View>
                </View>

                <View className="mt-4 flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <View className="w-3 h-3 bg-indigo-400 rounded-full mr-3"></View>
                    <Text className="text-slate-300 text-sm font-medium">
                      Passageiros: {route.passengers}/{route.capacity}
                    </Text>
                  </View>
                  <View className="bg-slate-700 rounded-full h-2 flex-1 mx-4">
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
        <View className="bg-slate-800 rounded-2xl p-6 mb-6 shadow-lg border border-slate-700">
          <Text className="text-white text-xl font-bold mb-4">Ações Rápidas</Text>
          <View className="flex-row justify-between">
            <TouchableOpacity className="bg-purple-900/30 rounded-xl p-4 flex-1 mr-2 items-center border border-purple-700">
              <View className="w-12 h-12 bg-purple-600 rounded-full items-center justify-center mb-2">
                <Ionicons name="location" size={20} color="white" />
              </View>
              <Text className="text-purple-300 font-bold text-sm">Localizar</Text>
              <Text className="text-purple-400 text-xs mt-1">Meu Autocarro</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="bg-emerald-900/30 rounded-xl p-4 flex-1 mx-1 items-center border border-emerald-700"
              onPress={onScheduleSelect}
            >
              <View className="w-12 h-12 bg-emerald-600 rounded-full items-center justify-center mb-2">
                <MaterialIcons name="schedule" size={20} color="white" />
              </View>
              <Text className="text-emerald-300 font-bold text-sm">Horários</Text>
              <Text className="text-emerald-400 text-xs mt-1">Ver Todos</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-blue-900/30 rounded-xl p-4 flex-1 ml-2 items-center border border-blue-700">
              <View className="w-12 h-12 bg-blue-600 rounded-full items-center justify-center mb-2">
                <MaterialIcons name="support-agent" size={20} color="white" />
              </View>
              <Text className="text-blue-300 font-bold text-sm">Suporte</Text>
              <Text className="text-blue-400 text-xs mt-1">Contactar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
