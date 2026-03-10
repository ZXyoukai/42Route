import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { socketService, DriverLocationPayload, TransportLocationPayload } from '../services/socketService';

// Coordenadas da 42 Luanda
const LUANDA_42 = { latitude: -8.838333, longitude: 13.234444 };

// Recalcular rota quando o motorista se afasta mais de 50 m do ponto de origem
const RECALC_THRESHOLD_M = 1;

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

type LatLng = { latitude: number; longitude: number };

function decodePolyline(encoded: string): LatLng[] {
  const points: LatLng[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  while (index < encoded.length) {
    let shift = 0, result = 0, byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0; result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return points;
}

/** Chama a API OSRM e devolve os pontos da polyline da rota de condução */
async function fetchOSRMRoute(
  origin: LatLng,
  destination: LatLng
): Promise<LatLng[]> {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${origin.longitude},${origin.latitude};` +
    `${destination.longitude},${destination.latitude}` +
    `?overview=full`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`);
  const json = await res.json();
  if (json.code !== 'Ok' || !json.routes?.length) {
    throw new Error('OSRM: sem rota disponível');
  }
  return decodePolyline(json.routes[0].geometry);
}

interface MapScreenProps {
  studentName?: string;
  role?: 'driver' | 'cadete';
}

export const MapScreen = ({ studentName = 'Utilizador', role = 'cadete' }: MapScreenProps) => {
  const isDriver = role === 'driver';

  const [mapReady, setMapReady] = useState(false);
  const [driverCoords, setDriverCoords] = useState<LatLng | null>(null);
  // live bus position received via WebSocket (cadete mode)
  const [liveDriverCoords, setLiveDriverCoords] = useState<LatLng | null>(null);
  const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);
  const [distance, setDistance] = useState<number | null>(null);
  const [routeStatus, setRouteStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');

  const mapRef = useRef<MapView>(null);
  const locationSubRef = useRef<Location.LocationSubscription | null>(null);
  const lastFetchOriginRef = useRef<LatLng | null>(null);
  const isFetchingRef = useRef(false);

  const calcRoute = useCallback(async (origin: LatLng) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setRouteStatus('loading');
    try {
      const points = await fetchOSRMRoute(origin, LUANDA_42);
      setRouteCoords(points);
      lastFetchOriginRef.current = origin;
      setRouteStatus('ok');
    } catch (e) {
      console.warn('OSRM erro:', e);
      setRouteStatus('error');
      setRouteCoords([origin, LUANDA_42]);
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  // ── Cadete: ouvir localização do motorista via WebSocket ──────────────────
  useEffect(() => {
    if (isDriver) return;

    const onDriverLoc = (payload: DriverLocationPayload) => {
      const coords: LatLng = { latitude: payload.lat, longitude: payload.long };
      setLiveDriverCoords(coords);
      mapRef.current?.animateToRegion(
        { ...coords, latitudeDelta: 0.04, longitudeDelta: 0.04 },
        800
      );
    };

    const onTransportLoc = (payload: TransportLocationPayload) => {
      const coords: LatLng = { latitude: payload.lat, longitude: payload.long };
      setLiveDriverCoords(coords);
    };

    // Entrar na sala via cadete id guardado
    AsyncStorage.getItem('user').then((raw) => {
      if (raw) {
        const user = JSON.parse(raw);
        if (user?.id) socketService.cadeteJoinRoute(user.id);
      }
    });

    socketService.onDriverLocation(onDriverLoc);
    socketService.onTransportLocation(onTransportLoc);

    return () => {
      socketService.offDriverLocation(onDriverLoc);
      socketService.offTransportLocation(onTransportLoc);
    };
  }, [isDriver]);

  useEffect(() => {
    if (!isDriver) return;
    let mounted = true;

    const start = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      locationSubRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 1000, distanceInterval: 1 },
        (loc) => {
          if (!mounted) return;
          const coords: LatLng = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
          setDriverCoords(coords);

          const d = haversineKm(coords.latitude, coords.longitude, LUANDA_42.latitude, LUANDA_42.longitude);
          setDistance(d);

          mapRef.current?.animateToRegion(
            { ...coords, latitudeDelta: 0.025, longitudeDelta: 0.025 },
            800
          );

          // Recalcular rota se ainda não calculou OU se moveu mais de 50 m
          const prev = lastFetchOriginRef.current;
          const movedEnough = !prev ||
            haversineKm(prev.latitude, prev.longitude, coords.latitude, coords.longitude) * 1000 >= RECALC_THRESHOLD_M;
          if (movedEnough) {
            calcRoute(coords);
          }
        }
      );
    };
    start();

    return () => {
      mounted = false;
      locationSubRef.current?.remove();
    };
  }, [isDriver, calcRoute]);

  /* ── Ponto de origem inicial para o mapa ── */
  const initialRegion: Region = {
    latitude: LUANDA_42.latitude,
    longitude: LUANDA_42.longitude,
    latitudeDelta: 0.04,
    longitudeDelta: 0.04,
  };

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
              <Marker coordinate={LUANDA_42} title="42 Luanda" description="Campus 42 School Angola">
                <View style={styles.schoolMarker}>
                  <Text style={styles.schoolMarkerText}>42</Text>
                </View>
              </Marker>

              {driverCoords && (
                <Marker coordinate={driverCoords} title="A sua posição" description="Localização em tempo real">
                  <View style={styles.driverMarker}>
                    <FontAwesome5 name="bus" size={16} color="white" />
                  </View>
                </Marker>
              )}

              {/* Polyline calculada pela API OSRM */}
              {routeCoords.length >= 2 && (
                <Polyline
                  coordinates={routeCoords}
                  strokeColor="#0f172a"
                  fillColor='#00babc'
                  strokeWidth={4}
                  lineDashPattern={routeStatus === 'error' ? [8, 6] : undefined}
                />
              )}
            </>
          )}

          {/* ── MODO ESTUDANTE ── */}
          {!isDriver && mapReady && (
            <>
              {/* Linha da rota OSRM se disponível */}
              {routeCoords.length >= 2 && (
                <Polyline coordinates={routeCoords} strokeColor="#00babc" fillColor="#00babc" strokeWidth={4} />
              )}
              {/* Posição do autocarro recebida via WebSocket */}
              {liveDriverCoords ? (
                <Marker coordinate={liveDriverCoords} title="Autocarro 42" description="Localização em tempo real">
                  <View style={styles.driverMarker}>
                    <FontAwesome5 name="bus" size={16} color="white" />
                  </View>
                </Marker>
              ) : (
                /* Marcador fixo na 42 enquanto sem sinal */
                <Marker coordinate={LUANDA_42} title="Campus 42 Luanda" description="Aguardando localização do autocarro">
                  <View style={styles.schoolMarker}>
                    <Text style={styles.schoolMarkerText}>42</Text>
                  </View>
                </Marker>
              )}
            </>
          )}
        </MapView>

        {/* Overlay: aguardar GPS */}
        {isDriver && !driverCoords && (
          <View style={styles.gpsWait}>
            <Ionicons name="locate" size={22} color="#00babc" />
            <Text style={styles.gpsWaitText}>A obter localização GPS...</Text>
          </View>
        )}
        {/* Overlay: a calcular rota OSRM */}
        {isDriver && driverCoords && routeStatus === 'loading' && routeCoords.length === 0 && (
          <View style={styles.gpsWait}>
            <MaterialIcons name="directions" size={20} color="#00babc" />
            <Text style={styles.gpsWaitText}>A calcular rota...</Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <Ionicons name="radio" size={14} color="#10b981" />
          <Text style={styles.footerLabel}>
            {isDriver
              ? routeStatus === 'loading'
                ? 'A recalcular rota...'
                : routeStatus === 'error'
                  ? 'Rota directa (sem rede)'
                  : 'GPS ativo · recalcula cada 1 m'
              : liveDriverCoords
                ? 'Autocarro em tempo real · WebSocket ativo'
                : 'Aguardando localização do autocarro...'}
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
          <Text style={styles.footerAccent}>
            {liveDriverCoords ? 'Autocarro 42 · em rota' : 'Autocarro 42'}
          </Text>
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
