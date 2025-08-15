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
          <Text className="text-white text-xl font-bold">{routeName}</Text>
          <Text className="text-purple-100 text-sm">Acompanhe a rota em tempo real</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Informações do Autocarro */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-slate-100">
          <Text className="text-slate-800 text-xl font-bold mb-4">Informações do Autocarro</Text>
          <View className="space-y-3">
            <View className="flex-row justify-between items-center p-3 bg-slate-50 rounded-xl">
              <Text className="text-slate-600 font-medium">Matrícula:</Text>
              <Text className="text-slate-800 font-bold">{busNumber}</Text>
            </View>
            <View className="flex-row justify-between items-center p-3 bg-slate-50 rounded-xl">
              <Text className="text-slate-600 font-medium">Motorista:</Text>
              <Text className="text-slate-800 font-bold">{driverName}</Text>
            </View>
            <View className="flex-row justify-between items-center p-3 bg-slate-50 rounded-xl">
              <Text className="text-slate-600 font-medium">Hora Atual:</Text>
              <Text className="text-purple-600 font-bold text-lg">{currentTime}</Text>
            </View>
            <View className="flex-row justify-between items-center p-3 bg-slate-50 rounded-xl">
              <Text className="text-slate-600 font-medium">Estado:</Text>
              <View className="bg-indigo-500 px-4 py-2 rounded-full">
                <Text className="text-white text-sm font-bold">Em Rota</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Progresso da Rota */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-slate-100">
          <Text className="text-slate-800 text-xl font-bold mb-4">Progresso da Rota</Text>
          <View className="relative">
            {stops.map((stop, index) => (
              <View key={stop.id} className="flex-row items-start mb-6 last:mb-0">
                {/* Timeline */}
                <View className="items-center mr-4">
                  <View 
                    className={`w-5 h-5 rounded-full border-2 ${
                      stop.isCompleted 
                        ? 'bg-emerald-500 border-emerald-500' 
                        : stop.isCurrent 
                        ? 'bg-purple-500 border-purple-500' 
                        : 'bg-white border-slate-300'
                    }`}
                  >
                    {stop.isCompleted && (
                      <Text className="text-white text-xs leading-none text-center mt-0.5">✓</Text>
                    )}
                  </View>
                  {index < stops.length - 1 && (
                    <View 
                      className={`w-0.5 h-16 ${
                        stop.isCompleted ? 'bg-emerald-500' : 'bg-slate-300'
                      }`} 
                    />
                  )}
                </View>

                {/* Stop Info */}
                <View className="flex-1 bg-slate-50 rounded-xl p-4">
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className={`font-bold text-base ${
                      stop.isCurrent ? 'text-purple-600' : 'text-slate-800'
                    }`}>
                      {stop.name}
                    </Text>
                    <Text className={`text-sm font-bold ${
                      stop.isCompleted 
                        ? 'text-emerald-600' 
                        : stop.isCurrent 
                        ? 'text-purple-600' 
                        : 'text-slate-500'
                    }`}>
                      {stop.estimatedTime}
                    </Text>
                  </View>
                  <Text className="text-slate-600 text-sm">{stop.address}</Text>
                  
                  {stop.isCurrent && (
                    <View className="mt-3 p-3 bg-purple-100 rounded-lg border border-purple-200">
                      <Text className="text-purple-700 text-sm font-bold">
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
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-slate-100">
          <Text className="text-slate-800 text-xl font-bold mb-4">Notificações</Text>
          <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-3">
            <View className="flex-row items-start">
              <Text className="text-amber-600 mr-3 text-lg">⚠️</Text>
              <View className="flex-1">
                <Text className="text-amber-800 font-bold text-sm">Ligeiro atraso</Text>
                <Text className="text-amber-700 text-xs mt-1">
                  Autocarro com 5 minutos de atraso devido ao trânsito na Marginal
                </Text>
              </View>
            </View>
          </View>
          
          <View className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
            <View className="flex-row items-start">
              <Text className="text-indigo-600 mr-3 text-lg">ℹ️</Text>
              <View className="flex-1">
                <Text className="text-indigo-800 font-bold text-sm">Próxima paragem</Text>
                <Text className="text-indigo-700 text-xs mt-1">
                  O autocarro está a aproximar-se do Centro Comercial Belas
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Ações */}
        <View className="flex-row justify-between mb-6">
          <TouchableOpacity className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl p-4 flex-1 mr-3 items-center shadow-lg">
            <Text className="text-white font-bold text-sm">📱 Notificar Chegada</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl p-4 flex-1 ml-3 items-center shadow-lg">
            <Text className="text-white font-bold text-sm">📞 Contactar Motorista</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};
