import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { socketService, DriverLocationPayload, TransportLocationPayload } from '../services/socketService';
import { SCREEN_SUBTITLE } from './screenCopy';

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

const LAST_BUS_COORDS_KEY = 'last_bus_coords';

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
  onBack?: () => void;
}

export const MapScreen = ({ studentName = 'Utilizador', role = 'cadete', onBack }: MapScreenProps) => {
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
    const persistLastBusCoords = async (coords: LatLng) => {
      try {
        await AsyncStorage.setItem(
          LAST_BUS_COORDS_KEY,
          JSON.stringify({ ...coords, updatedAt: Date.now() })
        );
      } catch (err) {
        console.warn('Falha ao guardar ultima localizacao do autocarro:', err);
      }
    };

    const onDriverLoc = (payload: DriverLocationPayload) => {
      console.log(`[MapScreen] 🚗 Driver location update:`, {
        driverId: payload.id_driver,
        latitude: payload.lat,
        longitude: payload.long,
        driverName: payload.driverName,
        routeId: payload.routeId,
        timestamp: new Date().toISOString()
      });
      
      const coords: LatLng = { latitude: payload.lat, longitude: payload.long };
      setLiveDriverCoords(coords);
      void persistLastBusCoords(coords);
      mapRef.current?.animateToRegion(
        { ...coords, latitudeDelta: 0.04, longitudeDelta: 0.04 },
        800
      );
    };

    const onTransportLoc = (payload: TransportLocationPayload) => {
      console.log(`[MapScreen] 🚌 Transport location update:`, {
        cadeteId: payload.cadeteId,
        latitude: payload.lat,
        longitude: payload.long,
        cadeteName: payload.cadeteName,
        routeId: payload.routeId,
        timestamp: new Date().toISOString()
      });
      
      const coords: LatLng = { latitude: payload.lat, longitude: payload.long };
      setLiveDriverCoords(coords);
      void persistLastBusCoords(coords);
    };

    const restoreLastBusCoords = async () => {
      try {
        const raw = await AsyncStorage.getItem(LAST_BUS_COORDS_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (typeof parsed?.latitude === 'number' && typeof parsed?.longitude === 'number') {
          setLiveDriverCoords({ latitude: parsed.latitude, longitude: parsed.longitude });
          console.log(`[MapScreen] Restored last bus coords from cache`);
        }
      } catch (err) {
        console.warn('Falha ao restaurar ultima localizacao do autocarro:', err);
      }
    };

    const getUser = async () => {
      try {
        const raw = await AsyncStorage.getItem('user');
        if (raw) {
          const user = JSON.parse(raw);
          if (user?.id) {
            socketService.cadeteJoinRoute(user.id);
            console.log(`[MapScreen] Cadete ${user.id} joined route`);
          }
        }
      } catch (err) {
        console.error(`[MapScreen] Error loading user:`, err);
      }
    };

    // Setup: restore cache and join route
    restoreLastBusCoords();
    getUser();
    
    // Add Socket.IO listeners
    socketService.onDriverLocation(onDriverLoc);
    socketService.onTransportLocation(onTransportLoc);
    
    console.log(`[MapScreen] 📡 Socket listeners added for cadete mode`);

    //  CRITICAL: Cleanup - Remove listeners when component unmounts
    return () => {
      console.log(`[MapScreen] 🧹 Cleaning up Socket listeners`);
      socketService.offDriverLocation(onDriverLoc);
      socketService.offTransportLocation(onTransportLoc);
    };
  }, [isDriver]);

  useEffect(() => {
    if (isDriver || !mapReady || !liveDriverCoords) return;
    mapRef.current?.animateToRegion(
      { ...liveDriverCoords, latitudeDelta: 0.04, longitudeDelta: 0.04 },
      800
    );
  }, [isDriver, liveDriverCoords, mapReady]);

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
    <View className="flex-1 bg-slate-900">
      <StatusBar style="light" backgroundColor="#0f172a" />

      {/* Header */}
      <View className="flex-row justify-between items-center px-5 pt-14 pb-4 border-b border-slate-700 bg-slate-900 z-10 shadow-sm shadow-black/20">
        <View className="flex-row items-center gap-3 flex-1">
          {onBack && (
            <TouchableOpacity onPress={onBack} className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 items-center justify-center" activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
          )}
          <View>
            <Text className="text-white text-[18px] font-bold tracking-wide">Mapa em Tempo Real</Text>
            <Text numberOfLines={2} className="pr-2 mt-1 text-slate-400 text-[12px] font-medium flex-shrink">
              {SCREEN_SUBTITLE.transportLive}
            </Text>
          </View>
        </View>
        {isDriver && distance !== null && (
          <View className="flex-row items-center gap-1.5 bg-[#00babc]/10 border border-[#00babc]/30 rounded-[20px] px-3 py-1.5">
            <MaterialIcons name="directions" size={14} color="#00babc" />
           
          </View>
        )}
      </View>

      {/* Mapa */}
      <View className="flex-1" style={{ width: '100%', height: '100%' }}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={{ flex: 1, width: '100%', height: '100%' }}
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
                <View className="bg-slate-900 rounded-[10px] border-2 border-[#00babc] px-2 py-1">
                  <Text className="text-[#00babc] font-black text-[14px]">42</Text>
                </View>
              </Marker>

              {driverCoords && (
                <Marker coordinate={driverCoords} title="A sua posição" description="Localização em tempo real">
                  <View className="bg-[#00babc] rounded-[20px] w-10 h-10 items-center justify-center border-2 border-white">
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
                  <View className="bg-[#00babc] rounded-[20px] w-10 h-10 items-center justify-center border-2 border-white">
                    <FontAwesome5 name="bus" size={16} color="white" />
                  </View>
                </Marker>
              ) : (
                /* Marcador fixo na 42 enquanto sem sinal */
                <Marker coordinate={LUANDA_42} title="Campus 42 Luanda" description="Aguardando localização do autocarro">
                  <View className="bg-slate-900 rounded-[10px] border-2 border-[#00babc] px-2 py-1">
                    <Text className="text-[#00babc] font-black text-[14px]">42</Text>
                  </View>
                </Marker>
              )}
            </>
          )}
        </MapView>

        {/* Overlay: aguardar GPS */}
        {isDriver && !driverCoords && (
          <View className="absolute bottom-4 self-center flex-row items-center gap-2 bg-slate-900/90 rounded-[20px] px-4 py-2.5 border border-[#00babc]/30">
            <Ionicons name="locate" size={22} color="#00babc" />
            <Text className="text-[#00babc] text-[13px] font-medium">A obter localização GPS...</Text>
          </View>
        )}
        {/* Overlay: a calcular rota OSRM */}
        {isDriver && driverCoords && routeStatus === 'loading' && routeCoords.length === 0 && (
          <View className="absolute bottom-4 self-center flex-row items-center gap-2 bg-slate-900/90 rounded-[20px] px-4 py-2.5 border border-[#00babc]/30">
            <MaterialIcons name="directions" size={20} color="#00babc" />
            <Text className="text-[#00babc] text-[13px] font-medium">A calcular rota...</Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View className="flex-row justify-between items-center px-5 py-2 border-t border-slate-700 bg-slate-800">
        <View className="flex-row items-center gap-1 flex-1">
          <Ionicons name="radio" size={12} color="#10b981" />
          <Text className="text-slate-300 text-[12px] flex-1" numberOfLines={1}>
            {isDriver
              ? routeStatus === 'loading'
                ? 'A recalcular...'
                : routeStatus === 'error'
                  ? 'Sem rede'
                  : 'GPS ativo'
              : liveDriverCoords
                ? 'Autocarro em rota'
                : 'Aguardando localização...'}
          </Text>
        </View>
        {isDriver && distance !== null && (
          <Text className="text-[#00babc] font-bold text-[12px] ml-2">
            {distance < 1
              ? `${Math.round(distance * 1000)}m`
              : `${distance.toFixed(1)}km`}
          </Text>
        )}
        {!isDriver && (
          <Text className="text-[#00babc] font-bold text-[12px] ml-2">
            {liveDriverCoords ? 'Em rota' : 'Offline'}
          </Text>
        )}
      </View>
    </View>
  );
};


