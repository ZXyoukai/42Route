import React, { useEffect, useMemo, useState } from 'react';
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

interface MapScreenProps {
  studentName?: string;
}

const BUS_ROUTE_POINTS = [
  { latitude: -8.8386, longitude: 13.2347 },
  { latitude: -8.8369, longitude: 13.2389 },
  { latitude: -8.8352, longitude: 13.2441 },
  { latitude: -8.8338, longitude: 13.2482 },
  { latitude: -8.832, longitude: 13.2524 },
];

export const MapScreen = ({ studentName = 'Estudante' }: MapScreenProps) => {
  const [busPointIndex, setBusPointIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setBusPointIndex((currentIndex) => (currentIndex + 1) % BUS_ROUTE_POINTS.length);
    }, 2500);

    return () => clearInterval(intervalId);
  }, []);

  const busPosition = useMemo(() => BUS_ROUTE_POINTS[busPointIndex], [busPointIndex]);

  return (
    <View className="flex-1 bg-slate-900">
      <StatusBar style="light" backgroundColor="#0f172a" />
      
      {/* Header */}
      <View className="border-b-2 border-[#00babc] mt-14 pt-3 pb-3 px-6">
        <View className="flex-row justify-between"> 
          <View>
            <Text className="text-white text-xl font-bold">Mapa em Tempo Real</Text>
            <Text className="text-cyan-100 text-sm">{studentName}, rastreio automático ativo</Text>
          </View>
        </View>
      </View>

      <View className="flex-1 border-t border-slate-700">
        <MapView
          provider={PROVIDER_GOOGLE}
          style={{ flex: 1 }}
          initialRegion={{
            latitude: -8.8352,
            longitude: 13.2441,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
          }}
        >
          <Polyline coordinates={BUS_ROUTE_POINTS} strokeColor="#00babc" strokeWidth={4} />

          <Marker coordinate={busPosition} title="Autocarro 42" description="Rastreio automático em tempo real">
            <View className="bg-cyan-600 rounded-full w-10 h-10 items-center justify-center border-2 border-white" style={{ backgroundColor: '#00babc' }}>
              <FontAwesome5 name="bus" size={16} color="white" />
            </View>
          </Marker>
        </MapView>
      </View>

      <View className="px-6 py-3 border-t border-slate-700 bg-slate-800">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="radio" size={14} color="#10b981" />
            <Text className="text-slate-300 ml-2">Rastreio automático ativo</Text>
          </View>
          <Text className="text-cyan-400 font-bold" style={{ color: '#00babc' }}>Autocarro 42</Text>
        </View>
      </View>
    </View>
  );
};
