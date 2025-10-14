import { Image, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

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
    <View className="flex-1 bg-slate-900">
      <StatusBar style="light" backgroundColor="#0f172a" />
      
      {/* Header */}
      <View className="border-b-2 border-[#00babc] pt-12 pb-6 px-6">
        <View className="flex justify-between mb-4">
          <TouchableOpacity onPress={onBack} className="flex-row items-center">
            <Ionicons name="arrow-back" size={24} color="white" />
            <Text className="text-white text-lg font-medium ml-2">Voltar</Text>
          </TouchableOpacity>
          <Image
            source={require('../assets/route_logo-w.png')}
            className="h-10"
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
        <View className="bg-slate-800 rounded-2xl p-6 mb-6 shadow-lg border border-slate-700">
          <Text className="text-white text-xl font-bold mb-4">Informações do Autocarro</Text>
          <View className="gap-y-1">
            <View className="flex-row justify-between items-center p-3 bg-slate-700 rounded-xl">
              <View className="flex-row items-center">
                <FontAwesome5 name="id-card" size={16} color="#94a3b8" />
                <Text className="text-slate-300 font-medium ml-3">Matrícula:</Text>
              </View>
              <Text className="text-white font-bold">{busNumber}</Text>
            </View>
            <View className="flex-row justify-between items-center p-3 bg-slate-700 rounded-xl">
              <View className="flex-row items-center">
                <Ionicons name="person" size={16} color="#94a3b8" />
                <Text className="text-slate-300 font-medium ml-3">Motorista:</Text>
              </View>
              <Text className="text-white font-bold">{driverName}</Text>
            </View>
            <View className="flex-row justify-between items-center p-3 bg-slate-700 rounded-xl">
              <View className="flex-row items-center">
                <MaterialIcons name="access-time" size={16} color="#94a3b8" />
                <Text className="text-slate-300 font-medium ml-3">Hora Atual:</Text>
              </View>
              <Text className="text-cyan-400 font-bold text-lg" style={{ color: '#00babc' }}>{currentTime}</Text>
            </View>
            <View className="flex-row justify-between items-center p-3 bg-slate-700 rounded-xl">
              <View className="flex-row items-center">
                <MaterialIcons name="directions-bus" size={16} color="#94a3b8" />
                <Text className="text-slate-300 font-medium ml-3">Estado:</Text>
              </View>
              <View className="bg-indigo-600 px-4 py-2 rounded-full">
                <Text className="text-white text-sm font-bold">Em Rota</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Progresso da Rota */}
        <View className="bg-slate-800 rounded-2xl p-6 mb-6 shadow-lg border border-slate-700">
          <Text className="text-white text-xl font-bold mb-4">Progresso da Rota</Text>
          <View className="relative">
            {stops.map((stop, index) => (
              <View key={stop.id} className="flex-row items-start mb-6 last:mb-1">
                {/* Timeline */}
                <View className="items-center mr-4">
                  <View 
                    className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                      stop.isCompleted 
                        ? 'bg-emerald-500 border-emerald-500' 
                        : stop.isCurrent 
                        ? 'bg-cyan-500 border-cyan-500' 
                        : 'bg-slate-700 border-slate-600'
                    }`}
                  >
                    {stop.isCompleted ? (
                      <Ionicons name="checkmark" size={12} color="white" />
                    ) : stop.isCurrent ? (
                      <FontAwesome5 name="bus" size={10} color="white" />
                    ) : (
                      <View className="w-2 h-2 bg-slate-400 rounded-full" />
                    )}
                  </View>
                  {index < stops.length - 1 && (
                    <View 
                      className={`w-0.5 h-16 ${
                        stop.isCompleted ? 'bg-emerald-500' : 'bg-slate-600'
                      }`} 
                    />
                  )}
                </View>

                {/* Stop Info */}
                <View className="flex-1 bg-slate-700 rounded-xl p-4">
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className={`font-bold text-base ${
                      stop.isCurrent ? 'text-cyan-400' : 'text-white'
                    }`}
                    style={stop.isCurrent ? { color: '#00babc' } : {}}>
                      {stop.name}
                    </Text>
                    <Text className={`text-sm font-bold ${
                      stop.isCompleted 
                        ? 'text-emerald-400' 
                        : stop.isCurrent 
                        ? 'text-cyan-400' 
                        : 'text-slate-400'
                    }`}
                    style={stop.isCurrent ? { color: '#00babc' } : {}}>
                      {stop.estimatedTime}
                    </Text>
                  </View>
                  <Text className="text-slate-300 text-sm">{stop.address}</Text>
                  
                  {stop.isCurrent && (
                    <View className="mt-3 p-3 bg-cyan-900/50 rounded-lg border border-cyan-600" style={{ backgroundColor: 'rgba(0, 186, 188, 0.1)', borderColor: '#00babc' }}>
                      <View className="flex-row items-center">
                        <FontAwesome5 name="bus" size={14} color="#00babc" />
                        <Text className="text-cyan-300 text-sm font-bold ml-2" style={{ color: '#00babc' }}>
                          Próxima paragem - Chegada estimada em 20 min
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Notificações */}
        <View className="bg-slate-800 rounded-2xl p-6 mb-6 shadow-lg border border-slate-700">
          <Text className="text-white text-xl font-bold mb-4">Notificações</Text>
          <View className="bg-amber-900/30 border border-amber-600 rounded-xl p-4 mb-3">
            <View className="flex-row items-start">
              <Ionicons name="warning" size={20} color="#f59e0b" />
              <View className="flex-1 ml-3">
                <Text className="text-amber-300 font-bold text-sm">Ligeiro atraso</Text>
                <Text className="text-amber-200 text-xs mt-1">
                  Autocarro com 5 minutos de atraso devido ao trânsito na Marginal
                </Text>
              </View>
            </View>
          </View>
          
          <View className="bg-indigo-900/30 border border-indigo-600 rounded-xl p-4">
            <View className="flex-row items-start">
              <MaterialIcons name="info" size={20} color="#6366f1" />
              <View className="flex-1 ml-3">
                <Text className="text-indigo-300 font-bold text-sm">Próxima paragem</Text>
                <Text className="text-indigo-200 text-xs mt-1">
                  O autocarro está a aproximar-se do Centro Comercial Belas
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Ações */}
        <View className="flex-row justify-between mb-6">
          <TouchableOpacity className="bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl p-4 flex-1 mr-3 items-center shadow-lg" style={{ backgroundColor: '#00babc' }}>
            <View className="flex-row items-center">
              <MaterialIcons name="notifications" size={20} color="white" />
              <Text className="text-white font-bold text-sm ml-2">Notificar Chegada</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl p-4 flex-1 ml-3 items-center shadow-lg">
            <View className="flex-row items-center">
              <MaterialIcons name="phone" size={20} color="white" />
              <Text className="text-white font-bold text-sm ml-2">Contactar Motorista</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};
