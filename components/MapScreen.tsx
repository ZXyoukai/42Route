import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Platform, Animated, Easing } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';

const GOOGLE_MAPS_APIKEY = 'AIzaSyAlm3Es35ecfHTp4-gb7MjAfoqEcWuKXX0';

// Coordenadas da 42 Luanda
const LUANDA_42 = { latitude: -8.838333, longitude: 13.234444 };

const BUS_ROUTE_POINTS = [
  { latitude: -8.8386, longitude: 13.2347 },
  { latitude: -8.8369, longitude: 13.2389 },
  { latitude: -8.8352, longitude: 13.2441 },
  { latitude: -8.8338, longitude: 13.2482 },
  { latitude: -8.832, longitude: 13.2524 },
];

function haversineKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface MapScreenProps {
  studentName?: string;
  role?: 'driver' | 'cadete';
}

export const MapScreen = ({ studentName = 'Utilizador', role = 'cadete' }: MapScreenProps) => {
  const isDriver = role === 'driver';

  /* ── Estado ── */
  const [mapReady, setMapReady] = useState(false);
  const [driverCoords, setDriverCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const mapRef = useRef<MapView>(null);
  const locationSubRef = useRef<Location.LocationSubscription | null>(null);

  /* ── Student mock ── */
  const [busPointIndex, setBusPointIndex] = useState(0);
  useEffect(() => {
    if (isDriver) return;
    const id = setInterval(() => setBusPointIndex(i => (i + 1) % BUS_ROUTE_POINTS.length), 2500);
    return () => clearInterval(id);
  }, [isDriver]);

  /* ── Driver GPS ── */
  useEffect(() => {
    if (!isDriver) return;
    let mounted = true;

    const start = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      locationSubRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
        (loc) => {
          if (!mounted) return;
          const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
          setDriverCoords(coords);
          const d = haversineKm(coords.latitude, coords.longitude, LUANDA_42.latitude, LUANDA_42.longitude);
          setDistance(d);
          // Segue suavemente o motorista no mapa
          mapRef.current?.animateToRegion(
            { ...coords, latitudeDelta: 0.025, longitudeDelta: 0.025 },
            800
          );
        }
      );
    };
    start();

    return () => {
      mounted = false;
      locationSubRef.current?.remove();
    };
  }, [isDriver]);

  /* ── Ponto de origem inicial para o mapa ── */
  const initialRegion: Region = {
    latitude: LUANDA_42.latitude,
    longitude: LUANDA_42.longitude,
    latitudeDelta: 0.04,
    longitudeDelta: 0.04,
  };

  const busPosition = BUS_ROUTE_POINTS[busPointIndex];

  return (
    <View style={styles.root}>
      <StatusBar style="light" backgroundColor="#0f172a" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Mapa em Tempo Real</Text>
          <Text style={styles.headerSub}>
            {isDriver ? 'A sua posição · direção à 42 Luanda' : `${studentName}, rastreio automático ativo`}
          </Text>
        </View>
        {isDriver && distance !== null && (
          <View style={styles.distanceBadge}>
            <MaterialIcons name="directions" size={14} color="#00babc" />
            <Text style={styles.distanceText}>
              {distance < 1
                ? `${Math.round(distance * 1000)} m`
                : `${distance.toFixed(1)} km`}
            </Text>
            <Text style={styles.distanceLabel}>da 42</Text>
          </View>
        )}
      </View>

      {/* Mapa */}
      <View style={{ flex: 1 }}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={{ flex: 1 }}
          initialRegion={initialRegion}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={Platform.OS === 'ios'}
          loadingEnabled
          loadingIndicatorColor="#00babc"
          onMapReady={() => setMapReady(true)}
        >
          {/* ── MODO MOTORISTA ── */}
          {isDriver && mapReady && (
            <>
              {/* Marcador da 42 Luanda */}
              <Marker coordinate={LUANDA_42} title="42 Luanda" description="Campus 42 School Angola">
                <View style={styles.schoolMarker}>
                  <Text style={styles.schoolMarkerText}>42</Text>
                </View>
              </Marker>

              {/* Marcador do motorista (posição atual) */}
              {driverCoords && (
                <Marker coordinate={driverCoords} title="A sua posição" description="Localização em tempo real">
                  <View style={styles.driverMarker}>
                    <FontAwesome5 name="bus" size={16} color="white" />
                  </View>
                </Marker>
              )}

              {/* Polyline via Directions API (como no InteractiveMap) */}
              {driverCoords && (
                <MapViewDirections
                  origin={driverCoords}
                  destination={LUANDA_42}
                  apikey={GOOGLE_MAPS_APIKEY}
                  strokeWidth={4}
                  strokeColor="#00babc"
                  optimizeWaypoints
                  onError={(msg) => console.warn('Directions error:', msg)}
                />
              )}
            </>
          )}

          {/* ── MODO ESTUDANTE ── */}
          {!isDriver && mapReady && (
            <>
              <Polyline coordinates={BUS_ROUTE_POINTS} strokeColor="#00babc" strokeWidth={4} />
              <Marker coordinate={busPosition} title="Autocarro 42" description="Rastreio automático em tempo real">
                <View style={styles.driverMarker}>
                  <FontAwesome5 name="bus" size={16} color="white" />
                </View>
              </Marker>
            </>
          )}
        </MapView>

        {/* Loading overlay enquanto aguarda GPS (driver sem coords) */}
        {isDriver && !driverCoords && (
          <View style={styles.gpsWait}>
            <Ionicons name="locate" size={22} color="#00babc" />
            <Text style={styles.gpsWaitText}>A obter localização GPS...</Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <Ionicons name="radio" size={14} color="#10b981" />
          <Text style={styles.footerLabel}>
            {isDriver ? 'GPS ativo · atualiza a cada 5 s' : 'Rastreio automático ativo'}
          </Text>
        </View>
        {isDriver && distance !== null && (
          <Text style={styles.footerDist}>
            {distance < 1
              ? `${Math.round(distance * 1000)} m até à 42`
              : `${distance.toFixed(1)} km até à 42`}
          </Text>
        )}
        {!isDriver && (
          <Text style={styles.footerAccent}>Autocarro 42</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f172a' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#00babc',
    marginTop: 56,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  headerSub: { color: '#a5f3fc', fontSize: 13, marginTop: 2 },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,186,188,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,186,188,0.35)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  distanceText: { color: '#00babc', fontWeight: '700', fontSize: 15 },
  distanceLabel: { color: '#64748b', fontSize: 11 },
  schoolMarker: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#00babc',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  schoolMarkerText: { color: '#00babc', fontWeight: '900', fontSize: 14 },
  driverMarker: {
    backgroundColor: '#00babc',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  gpsWait: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(15,23,42,0.88)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,186,188,0.3)',
  },
  gpsWaitText: { color: '#00babc', fontSize: 13, fontWeight: '500' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    backgroundColor: '#1e293b',
  },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerLabel: { color: '#cbd5e1', fontSize: 13 },
  footerDist: { color: '#00babc', fontWeight: '700', fontSize: 13 },
  footerAccent: { color: '#00babc', fontWeight: '700', fontSize: 13 },
});
