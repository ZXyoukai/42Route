import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

interface MapScreenProps {
  studentName?: string;
  onOpenInteractiveMap?: (type: 'location' | 'routes' | 'nearest') => void;
}

export const MapScreen = ({ studentName = "Estudante", onOpenInteractiveMap }: MapScreenProps) => {
  const activeBuses = [
    {
      id: 'BUS001',
      route: 'Rota Central',
      location: 'Próximo à Marginal',
      passengers: 28,
      capacity: 35,
      eta: '15 min'
    },
    {
      id: 'BUS002',
      route: 'Rota Maianga',
      location: 'Estação Maianga',
      passengers: 31,
      capacity: 35,
      eta: '8 min'
    }
  ];

  return (
    <View className="flex-1 bg-slate-900">
      <StatusBar style="light" backgroundColor="#0f172a" />
      
      {/* Header */}
      <View className="bg-gradient-to-br from-cyan-500 to-teal-600 mt-14 pt-3 pb-3 px-6" style={{ backgroundColor: '#00babc' }}>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white text-xl font-bold">Mapa em Tempo Real</Text>
            <Text className="text-cyan-100 text-sm">Acompanhe os autocarros ao vivo</Text>
          </View>
          <Image
            source={require('../assets/route_logo-w.png')}
            className="h-12 top-0 right-52"
            resizeMode="contain"
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Placeholder do Mapa */}
        <View className="bg-slate-800 rounded-2xl p-6 mb-6 shadow-lg border border-slate-700 h-64">
          <View className="flex-1 bg-slate-700 rounded-xl items-center justify-center">
            <View className="items-center">
              <View className="w-20 h-20 bg-cyan-900/50 rounded-full items-center justify-center mb-4 border border-cyan-600" style={{ backgroundColor: 'rgba(0, 186, 188, 0.1)', borderColor: '#00babc' }}>
                <MaterialIcons name="map" size={32} color="#00babc" />
              </View>
              <Text className="text-white font-bold text-lg mb-2">Mapa Interativo</Text>
              <Text className="text-slate-300 text-sm text-center">
                Visualização em tempo real dos{'\n'}autocarros será implementada aqui
              </Text>
              <View className="mt-4 flex-row items-center">
                <View className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></View>
                <Text className="text-slate-400 text-xs">GPS ativo - Localização precisa</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Autocarros Ativos */}
        <View className="bg-slate-800 rounded-2xl p-6 mb-6 gap-y-2 shadow-lg border border-slate-700">
          <View className="flex-row items-center mb-4">
            <FontAwesome5 name="bus" size={20} color="#00babc" />
            <Text className="text-white text-xl font-bold ml-3">Autocarros Ativos</Text>
          </View>
          
          {activeBuses.map((bus, index) => (
            <TouchableOpacity
              key={bus.id}
              className="bg-slate-700 rounded-xl p-4 mb-3 last:mb-0"
              activeOpacity={0.7}
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                  <Text className="text-white font-bold text-base">{bus.route}</Text>
                  <View className="flex-row items-center mt-1">
                    <Ionicons name="location" size={14} color="#64748b" />
                    <Text className="text-slate-400 text-sm ml-1">{bus.location}</Text>
                  </View>
                </View>
                <View className="bg-emerald-600 px-3 py-1 rounded-full">
                  <Text className="text-white text-xs font-bold">Ativo</Text>
                </View>
              </View>

              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <MaterialIcons name="people" size={16} color="#64748b" />
                  <Text className="text-slate-300 text-sm ml-2">
                    {bus.passengers}/{bus.capacity}
                  </Text>
                  <View className="bg-slate-600 rounded-full h-1.5 w-16 ml-3">
                    <View
                      className="bg-gradient-to-r from-cyan-500 to-teal-500 h-1.5 rounded-full"
                      style={{
                        backgroundColor: '#00babc',
                        width: `${(bus.passengers / bus.capacity) * 100}%`
                      }}
                    />
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-slate-400 text-xs">ETA</Text>
                  <Text className="text-cyan-400 font-bold" style={{ color: '#00babc' }}>{bus.eta}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Ações do Mapa */}
        <View className="bg-slate-800 rounded-2xl p-6 mb-6 shadow-lg border border-slate-700">
          <Text className="text-white text-xl font-bold mb-4">Ações do Mapa</Text>
          <View className="flex-row justify-between">
            <TouchableOpacity 
              onPress={() => onOpenInteractiveMap?.('location')} 
              className="bg-cyan-900/30 rounded-xl p-4 flex-1 mr-2 items-center border border-cyan-700" 
              style={{ borderColor: '#00babc', backgroundColor: 'rgba(0, 186, 188, 0.1)' }}
            >
              <View className="w-12 h-12 rounded-full items-center justify-center mb-2" style={{ backgroundColor: '#00babc' }}>
                <MaterialIcons name="my-location" size={20} color="white" />
              </View>
              <Text className="text-cyan-300 font-bold text-sm" style={{ color: '#00babc' }}>Localizar-me</Text>
              <Text className="text-cyan-400 text-xs mt-1" style={{ color: '#00babc' }}>Minha Posição</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => onOpenInteractiveMap?.('routes')} 
              className="bg-cyan-900/30 rounded-xl p-4 flex-1 mx-1 items-center border border-cyan-700" 
              style={{ borderColor: '#00babc', backgroundColor: 'rgba(0, 186, 188, 0.1)' }}
            >
              <View className="w-12 h-12 rounded-full items-center justify-center mb-2" style={{ backgroundColor: '#00babc' }}>
                <FontAwesome5 name="route" size={16} color="white" />
              </View>
              <Text className="text-cyan-300 font-bold text-sm" style={{ color: '#00babc' }}>Todas Rotas</Text>
              <Text className="text-cyan-400 text-xs mt-1" style={{ color: '#00babc' }}>Ver no Mapa</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => onOpenInteractiveMap?.('nearest')} 
              className="bg-cyan-900/30 rounded-xl p-4 flex-1 ml-2 items-center border border-cyan-700" 
              style={{ borderColor: '#00babc', backgroundColor: 'rgba(0, 186, 188, 0.1)' }}
            >
              <View className="w-12 h-12 rounded-full items-center justify-center mb-2" style={{ backgroundColor: '#00babc' }}>
                <MaterialIcons name="near-me" size={20} color="white" />
              </View>
              <Text className="text-cyan-300 font-bold text-sm" style={{ color: '#00babc' }}>Mais Próximo</Text>
              <Text className="text-cyan-400 text-xs mt-1" style={{ color: '#00babc' }}>Autocarro</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
