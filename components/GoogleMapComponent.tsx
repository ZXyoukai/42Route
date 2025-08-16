import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, Alert, Platform } from 'react-native';

// Importação condicional do react-native-maps
let MapView: any = null;
let PROVIDER_GOOGLE: any = null;
let Marker: any = null;

try {
  const maps = require('react-native-maps');
  MapView = maps.default;
  PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
  Marker = maps.Marker;
} catch (error) {
  console.warn('react-native-maps não disponível:', error);
}

interface GoogleMapComponentProps {
  latitude: number;
  longitude: number;
  onMapReady?: () => void;
}

export const GoogleMapComponent = ({ 
  latitude, 
  longitude, 
  onMapReady 
}: GoogleMapComponentProps) => {
  const [isMapReady, setIsMapReady] = useState(false);
  
  const initialRegion = {
    latitude,
    longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const handleMapReady = useCallback(() => {
    console.log('Google Maps carregado com sucesso!');
    setIsMapReady(true);
    onMapReady?.();
  }, [onMapReady]);

  // Se o MapView não está disponível, mostrar fallback
  if (!MapView) {
    return (
      <View style={styles.fallbackContainer}>
        <Text style={styles.fallbackText}>
          Google Maps não disponível{'\n'}
          Instalando dependências...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        style={styles.map}
        initialRegion={initialRegion}
        onMapReady={handleMapReady}
        loadingEnabled={true}
        loadingIndicatorColor={'#00babc'}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={true}
        mapType="standard"
      >
        {isMapReady && Marker && (
          <>
            <Marker
              coordinate={{ latitude, longitude }}
              title="Campus 42 Luanda"
              description="42 School Angola"
            />
            <Marker
              coordinate={{ 
                latitude: latitude + 0.002, 
                longitude: longitude + 0.002 
              }}
              title="BUS-001"
              description="Rota Central"
            />
          </>
        )}
      </MapView>
      
      {!isMapReady && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Carregando mapa...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: '100%',
  },
  fallbackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e293b',
  },
  fallbackText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
  },
});
