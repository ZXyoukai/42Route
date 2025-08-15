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
      case 'ativo': return 'bg-green-500';
      case 'em_rota': return 'bg-blue-500';
      case 'parado': return 'bg-gray-500';
      case 'manutencao': return 'bg-red-500';
      default: return 'bg-gray-500';
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
    <View className="flex-1 bg-gray-50">
      <StatusBar style="light" backgroundColor="#0891b2" />
      
      {/* Header */}
      <View className="bg-cyan-600 pt-12 pb-6 px-6">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white text-lg font-medium">Bem-vindo, {studentName}!</Text>
            <Text className="text-cyan-100 text-sm">Monitorize o seu transporte</Text>
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
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-gray-800 text-lg font-semibold mb-3">Estado Geral do Sistema</Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-2xl font-bold text-green-600">2</Text>
              <Text className="text-gray-600 text-xs">Ativos</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-blue-600">1</Text>
              <Text className="text-gray-600 text-xs">Em Rota</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-600">1</Text>
              <Text className="text-gray-600 text-xs">Parados</Text>
            </View>
          </View>
        </View>

        {/* Lista de Rotas */}
        <View className="mb-4">
          <Text className="text-gray-800 text-lg font-semibold mb-3">Rotas Disponíveis</Text>
          {routes.map((route) => (
            <TouchableOpacity
              key={route.id}
              className="bg-white rounded-xl p-4 mb-3 shadow-sm"
              activeOpacity={0.7}
              onPress={onRouteSelect}
            >
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                  <Text className="text-gray-800 font-semibold text-base">{route.name}</Text>
                  <Text className="text-gray-600 text-sm">ID: {route.id}</Text>
                </View>
                <View className={`px-3 py-1 rounded-full ${getStatusColor(route.status)}`}>
                  <Text className="text-white text-xs font-medium">
                    {getStatusText(route.status)}
                  </Text>
                </View>
              </View>

              <View className="border-t border-gray-100 pt-3">
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="text-gray-600 text-sm">Próxima paragem:</Text>
                    <Text className="text-gray-800 font-medium">{route.nextStop}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-gray-600 text-sm">Chegada em:</Text>
                    <Text className="text-cyan-600 font-bold text-lg">{route.estimatedTime}</Text>
                  </View>
                </View>

                <View className="mt-3 flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <View className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></View>
                    <Text className="text-gray-600 text-sm">
                      Passageiros: {route.passengers}/{route.capacity}
                    </Text>
                  </View>
                  <View className="bg-gray-200 rounded-full h-2 flex-1 mx-3">
                    <View
                      className="bg-cyan-500 h-2 rounded-full"
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
        <View className="bg-white rounded-xl p-4 mb-6">
          <Text className="text-gray-800 text-lg font-semibold mb-3">Ações Rápidas</Text>
          <View className="flex-row justify-between">
            <TouchableOpacity className="bg-cyan-100 rounded-lg p-3 flex-1 mr-2 items-center">
              <Text className="text-cyan-700 font-medium text-sm">📍 Localizar</Text>
              <Text className="text-cyan-600 text-xs mt-1">Meu Autocarro</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="bg-green-100 rounded-lg p-3 flex-1 mx-1 items-center"
              onPress={onScheduleSelect}
            >
              <Text className="text-green-700 font-medium text-sm">🕐 Horários</Text>
              <Text className="text-green-600 text-xs mt-1">Ver Todos</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-blue-100 rounded-lg p-3 flex-1 ml-2 items-center">
              <Text className="text-blue-700 font-medium text-sm">📞 Suporte</Text>
              <Text className="text-blue-600 text-xs mt-1">Contactar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
