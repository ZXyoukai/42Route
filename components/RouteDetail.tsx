import { Image, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

interface Stop {
  id: string;
  name: string;
  address: string;
  estimatedTime: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

interface RouteDetailProps {
  routeId?: string;
  routeName?: string;
  onBack?: () => void;
}

export const RouteDetail = ({ 
  routeId = 'RT001', 
  routeName = 'Rota Central',
  onBack 
}: RouteDetailProps) => {
  const stops: Stop[] = [
    {
      id: 'S001',
      name: 'Terminal Marginal',
      address: 'Av. 4 de Fevereiro, Marginal',
      estimatedTime: '07:30',
      isCompleted: true,
      isCurrent: false
    },
    {
      id: 'S002',
      name: 'Estação Maianga',
      address: 'Rua Rei Katyavala, Maianga',
      estimatedTime: '07:45',
      isCompleted: true,
      isCurrent: false
    },
    {
      id: 'S003',
      name: 'Centro Comercial Belas',
      address: 'Estrada de Catete, Belas',
      estimatedTime: '08:10',
      isCompleted: false,
      isCurrent: true
    },
    {
      id: 'S004',
      name: 'Campus 42 Luanda',
      address: 'Zona Económica Especial, Luanda',
      estimatedTime: '08:25',
      isCompleted: false,
      isCurrent: false
    }
  ];

  const currentTime = '08:05';
  const busNumber = 'AC-001-LU';
  const driverName = 'António Mateus';

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
        
        <View>
          <Text className="text-white text-xl font-bold">{routeName}</Text>
          <Text className="text-cyan-100 text-sm">Acompanhe a rota em tempo real</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Informações do Autocarro */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-gray-800 text-lg font-semibold mb-3">Informações do Autocarro</Text>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-gray-600">Matrícula:</Text>
            <Text className="text-gray-800 font-medium">{busNumber}</Text>
          </View>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-gray-600">Motorista:</Text>
            <Text className="text-gray-800 font-medium">{driverName}</Text>
          </View>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-gray-600">Hora Atual:</Text>
            <Text className="text-cyan-600 font-bold">{currentTime}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-600">Estado:</Text>
            <View className="bg-blue-500 px-3 py-1 rounded-full">
              <Text className="text-white text-xs font-medium">Em Rota</Text>
            </View>
          </View>
        </View>

        {/* Progresso da Rota */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-gray-800 text-lg font-semibold mb-3">Progresso da Rota</Text>
          <View className="relative">
            {stops.map((stop, index) => (
              <View key={stop.id} className="flex-row items-start mb-4 last:mb-0">
                {/* Timeline */}
                <View className="items-center mr-4">
                  <View 
                    className={`w-4 h-4 rounded-full border-2 ${
                      stop.isCompleted 
                        ? 'bg-green-500 border-green-500' 
                        : stop.isCurrent 
                        ? 'bg-cyan-500 border-cyan-500' 
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    {stop.isCompleted && (
                      <Text className="text-white text-xs leading-none text-center mt-0.5">✓</Text>
                    )}
                  </View>
                  {index < stops.length - 1 && (
                    <View 
                      className={`w-0.5 h-12 ${
                        stop.isCompleted ? 'bg-green-500' : 'bg-gray-300'
                      }`} 
                    />
                  )}
                </View>

                {/* Stop Info */}
                <View className="flex-1">
                  <View className="flex-row justify-between items-start mb-1">
                    <Text className={`font-semibold ${
                      stop.isCurrent ? 'text-cyan-600' : 'text-gray-800'
                    }`}>
                      {stop.name}
                    </Text>
                    <Text className={`text-sm font-medium ${
                      stop.isCompleted 
                        ? 'text-green-600' 
                        : stop.isCurrent 
                        ? 'text-cyan-600' 
                        : 'text-gray-600'
                    }`}>
                      {stop.estimatedTime}
                    </Text>
                  </View>
                  <Text className="text-gray-600 text-sm">{stop.address}</Text>
                  
                  {stop.isCurrent && (
                    <View className="mt-2">
                      <Text className="text-cyan-600 text-xs font-medium">
                        🚌 Próxima paragem - Chegada estimada em 20 min
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Notificações */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-gray-800 text-lg font-semibold mb-3">Notificações</Text>
          <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
            <View className="flex-row items-start">
              <Text className="text-yellow-600 mr-2">⚠️</Text>
              <View className="flex-1">
                <Text className="text-yellow-800 font-medium text-sm">Ligeiro atraso</Text>
                <Text className="text-yellow-700 text-xs mt-1">
                  Autocarro com 5 minutos de atraso devido ao trânsito na Marginal
                </Text>
              </View>
            </View>
          </View>
          
          <View className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <View className="flex-row items-start">
              <Text className="text-blue-600 mr-2">ℹ️</Text>
              <View className="flex-1">
                <Text className="text-blue-800 font-medium text-sm">Próxima paragem</Text>
                <Text className="text-blue-700 text-xs mt-1">
                  O autocarro está a aproximar-se do Centro Comercial Belas
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Ações */}
        <View className="flex-row justify-between mb-6">
          <TouchableOpacity className="bg-cyan-600 rounded-lg p-4 flex-1 mr-2 items-center">
            <Text className="text-white font-semibold">📱 Notificar Chegada</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-green-600 rounded-lg p-4 flex-1 ml-2 items-center">
            <Text className="text-white font-semibold">📞 Contactar Motorista</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};
