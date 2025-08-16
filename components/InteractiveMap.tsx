import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';

interface InteractiveMapProps {
  onBack: () => void;
}

export const InteractiveMap = ({ onBack }: InteractiveMapProps) => {
  const [mapReady, setMapReady] = useState(false);
  
  // Coordenadas de Luanda corrigidas
  const luandaRegion = {
    latitude: -8.838333,
    longitude: 13.234444,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  // Função para abrir Google Maps
  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${luandaRegion.latitude},${luandaRegion.longitude}`;
    Linking.openURL(url);
  };

  return (
    <View className="flex-1 bg-slate-900">
      <StatusBar style="light" backgroundColor="#0f172a" />
      
      {/* Header */}
      <View className="pt-12 pb-6 px-6" style={{ backgroundColor: '#00babc' }}>
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={onBack} className="flex-row items-center">
            <Ionicons name="arrow-back" size={24} color="white" />
            <Text className="text-white text-lg font-medium ml-2">Voltar</Text>
          </TouchableOpacity>
        </View>
        
        <Text className="text-white text-3xl font-bold">Mapa</Text>
      </View>

      <View className="flex-1">
        <MapView
          provider={PROVIDER_GOOGLE}
          region={luandaRegion}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={false}
          showsBuildings={true}
          showsTraffic={false}
          mapType="standard"
          style={{ flex: 1 }}
          onMapReady={() => {
            console.log('Mapa carregado');
            setMapReady(true);
          }}
        >
          {mapReady && (
            <>
              <Marker
                coordinate={{
                  latitude: -8.838333,
                  longitude: 13.234444,
                }}
                title="Campus 42 Luanda"
                description="42 School Angola"
              />
              
              <Marker
                coordinate={{
                  latitude: -8.840000,
                  longitude: 13.236000,
                }}
                title="BUS-001"
                description="Rota Central - 25/35"
              />
            </>
          )}
        </MapView>
        
        {/* Loading indicator */}
        {!mapReady && (
          <View className="absolute inset-0 items-center justify-center bg-slate-600/50">
            <View className="w-16 h-16 rounded-full items-center justify-center mb-4" style={{ backgroundColor: '#00babc' }}>
              <Ionicons name="map" size={24} color="white" />
            </View>
            <Text className="text-white font-medium">Carregando mapa...</Text>
          </View>
        )}
        
        {/* Botão flutuante */}
        <TouchableOpacity
          className="absolute bottom-6 right-6 w-12 h-12 rounded-full items-center justify-center shadow-lg"
          style={{ backgroundColor: '#00babc' }}
          onPress={openGoogleMaps}
        >
          <Ionicons name="navigate" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};


