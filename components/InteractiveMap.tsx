import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Linking, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';

interface InteractiveMapProps {
  onBack: () => void;
}

export const InteractiveMap = ({ onBack }: InteractiveMapProps) => {
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);

  const GOOGLE_MAPS_APIKEY = 'AIzaSyAlm3Es35ecfHTp4-gb7MjAfoqEcWuKXX0'; 

  const luandaRegion = {
    latitude: -8.8390,
    longitude: 13.2894,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const origin = {
    latitude: -8.838333,
    longitude: 13.234444,
  };

  const destination = {
    latitude: -8.840000,
    longitude: 13.236000,
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!mapReady && !mapError) {
        console.log('Timeout do mapa - possível problema no Android');
        setMapError(true);
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [mapReady, mapError]);

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&travelmode=driving`;
    Linking.openURL(url);
  };

  const retryMap = () => {
    setMapError(false);
    setMapReady(false);
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
        <Text className="text-white text-3xl font-bold">Mapas</Text>
      </View>

      <View className="flex-1">
        {!mapError ? (
          <MapView
            provider={PROVIDER_GOOGLE}
            region={luandaRegion}
            showsUserLocation={false}
            showsMyLocationButton={false}
            showsCompass={Platform.OS === 'ios'}
            showsBuildings={true}
            showsTraffic={false}
            mapType="standard"
            style={{ flex: 1 }}
            onMapReady={() => {
              console.log(`Mapa carregado no ${Platform.OS}`);
              setMapReady(true);
            }}
            loadingEnabled={true}
            loadingIndicatorColor="#00babc"
            showsIndoors={false}
            toolbarEnabled={false}
          >
            {mapReady && (
              <>
                <Marker coordinate={origin} title="Campus 42 Luanda" description="42 School Angola" />
                <Marker coordinate={destination} title="BUS-001" description="Rota Central - 25/35" />

                {/* DIRECTIONS */}
                <MapViewDirections
                  origin={origin}
                  destination={destination}
                  apikey={GOOGLE_MAPS_APIKEY}
                  strokeWidth={4}
                  strokeColor="#00babc"
                  optimizeWaypoints={true}
                  onError={(errorMessage) => {
                    console.warn('Erro ao traçar rota: ', errorMessage);
                  }}
                />
              </>
            )}
          </MapView>
        ) : (
          <View className="flex-1 items-center justify-center bg-slate-800 px-6">
            <View className="w-20 h-20 rounded-full items-center justify-center mb-6" style={{ backgroundColor: '#00babc' }}>
              <Ionicons name="warning-outline" size={32} color="white" />
            </View>
            <Text className="text-white text-xl font-bold mb-2">Mapa Indisponível</Text>
            <Text className="text-slate-300 text-center mb-6">
              Google Maps não carregou no Android.{'\n'}
              Isso pode acontecer em alguns dispositivos.
            </Text>

            <TouchableOpacity
              className="px-6 py-3 rounded-lg mb-4"
              style={{ backgroundColor: '#00babc' }}
              onPress={retryMap}
            >
              <Text className="text-white font-semibold">Tentar Novamente</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="px-6 py-3 rounded-lg border border-slate-600"
              onPress={openGoogleMaps}
            >
              <Text className="text-white font-semibold">Abrir Google Maps</Text>
            </TouchableOpacity>
          </View>
        )}

        {mapReady && (
          <TouchableOpacity
            className="absolute bottom-6 right-6 w-12 h-12 rounded-full items-center justify-center shadow-lg"
            style={{ backgroundColor: '#00babc' }}
            onPress={openGoogleMaps}
          >
            <Ionicons name="navigate" size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
