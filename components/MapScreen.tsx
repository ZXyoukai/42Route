import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Animated, Easing } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region, AnimatedRegion } from 'react-native-maps';
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

  // UI-02: ETA calculation for cadete mode
  const [eta, setEta] = useState<number | null>(null); // minutes
  // UI-04: Driver info received via socket
  const [liveDriverName, setLiveDriverName] = useState<string | null>(null);
  const [driverOffline, setDriverOffline] = useState(false);
  // Recenter state
  const [userPanned, setUserPanned] = useState(false);

  const mapRef = useRef<MapView>(null);
  const locationSubRef = useRef<Location.LocationSubscription | null>(null);
  const lastFetchOriginRef = useRef<LatLng | null>(null);

  // UI-01: AnimatedRegion for smooth marker interpolation (cadete mode)
  const animatedBusCoord = useRef(
    new AnimatedRegion({
      latitude: LUANDA_42.latitude,
      longitude: LUANDA_42.longitude,
      latitudeDelta: 0.04,
      longitudeDelta: 0.04,
    })
  ).current;
  const busMarkerRef = useRef<any>(null);

  // Pulse animation for live bus marker
  const pulseAnim = useRef(new Animated.Value(0)).current;
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
      const coords: LatLng = { latitude: payload.lat, longitude: payload.long };
      setLiveDriverCoords(coords);
      setLiveDriverName(payload.driverName ?? null);
      setDriverOffline(false);
      void persistLastBusCoords(coords);

      // UI-01: Smooth marker interpolation using AnimatedRegion.timing()
      if (Platform.OS === 'android') {
        // On Android, use animateMarkerToCoordinate for native performance
        busMarkerRef.current?.animateMarkerToCoordinate(coords, 1500);
      } else {
        // On iOS, use AnimatedRegion.timing()
        animatedBusCoord.timing({
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
          duration: 1500,
          useNativeDriver: false,
        }).start();
      }

      // UI-02: Calculate ETA based on distance to campus (avg 30km/h in Luanda traffic)
      const distKm = haversineKm(coords.latitude, coords.longitude, LUANDA_42.latitude, LUANDA_42.longitude);
      const avgSpeedKmH = 30;
      const etaMinutes = Math.round((distKm / avgSpeedKmH) * 60);
      setEta(etaMinutes > 0 ? etaMinutes : 1);

      if (!userPanned) {
        mapRef.current?.animateToRegion(
          { ...coords, latitudeDelta: 0.04, longitudeDelta: 0.04 },
          800
        );
      }
    };

    const onTransportLoc = (payload: TransportLocationPayload) => {
      const coords: LatLng = { latitude: payload.lat, longitude: payload.long };
      setLiveDriverCoords(coords);
      setDriverOffline(false);
      void persistLastBusCoords(coords);
    };

    // Listen for driver going offline
    const onOffline = () => {
      setDriverOffline(true);
      setEta(null);
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
    socketService.onDriverOffline(onOffline);

    return () => {
      socketService.offDriverLocation(onDriverLoc);
      socketService.offTransportLocation(onTransportLoc);
      socketService.offDriverOffline(onOffline);
    };
  }, [isDriver, userPanned]);

  // UI-01: Pulse animation for the live bus marker
  useEffect(() => {
    if (isDriver || !liveDriverCoords || driverOffline) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isDriver, !!liveDriverCoords, driverOffline]);

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

  // FUNC-05: Recenter handler
  const handleRecenter = () => {
    setUserPanned(false);
    const target = isDriver ? driverCoords : liveDriverCoords;
    if (target) {
      mapRef.current?.animateToRegion(
        { ...target, latitudeDelta: 0.025, longitudeDelta: 0.025 },
        600
      );
    }
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
            <Text className="text-[#00babc] text-[12px] font-bold">
              {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}
            </Text>
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
          onPanDrag={() => setUserPanned(true)}
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
              {/* Marcador fixo campus */}
              <Marker coordinate={LUANDA_42} title="Campus 42 Luanda">
                <View className="bg-slate-900 rounded-[10px] border-2 border-[#00babc] px-2 py-1">
                  <Text className="text-[#00babc] font-black text-[14px]">42</Text>
                </View>
              </Marker>

              {/* Linha da rota OSRM se disponível */}
              {routeCoords.length >= 2 && (
                <Polyline coordinates={routeCoords} strokeColor="#00babc" fillColor="#00babc" strokeWidth={4} />
              )}
              {/* Posição do autocarro recebida via WebSocket — UI-01: Animated Marker */}
              {liveDriverCoords && (
                <Marker.Animated
                  ref={busMarkerRef}
                  coordinate={animatedBusCoord}
                  title="Autocarro 42"
                  description="Localização em tempo real"
                  anchor={{ x: 0.5, y: 0.5 }}
                >
                  <View style={{ alignItems: 'center', justifyContent: 'center', width: 56, height: 56 }}>
                    {/* Pulse ring */}
                    <Animated.View
                      style={{
                        position: 'absolute',
                        width: 52,
                        height: 52,
                        borderRadius: 26,
                        borderWidth: 2,
                        borderColor: '#00babc',
                        opacity: pulseAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.6, 0],
                        }),
                        transform: [{
                          scale: pulseAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1.8],
                          }),
                        }],
                      }}
                    />
                    {/* Bus icon */}
                    <View className="bg-[#00babc] rounded-[20px] w-10 h-10 items-center justify-center border-2 border-white">
                      <FontAwesome5 name="bus" size={16} color="white" />
                    </View>
                  </View>
                </Marker.Animated>
              )}
            </>
          )}
        </MapView>

        {/* FUNC-05: Recenter FAB button */}
        <TouchableOpacity
          onPress={handleRecenter}
          className="absolute bottom-4 right-4 w-11 h-11 rounded-full bg-slate-900/90 border border-slate-700 items-center justify-center shadow-lg"
          activeOpacity={0.7}
        >
          <MaterialIcons name="my-location" size={22} color="#00babc" />
        </TouchableOpacity>

        {/* Overlay: aguardar GPS */}
        {isDriver && !driverCoords && (
          <View className="absolute bottom-20 self-center flex-row items-center gap-2 bg-slate-900/90 rounded-[20px] px-4 py-2.5 border border-[#00babc]/30">
            <Ionicons name="locate" size={22} color="#00babc" />
            <Text className="text-[#00babc] text-[13px] font-medium">A obter localização GPS...</Text>
          </View>
        )}
        {/* Overlay: a calcular rota OSRM */}
        {isDriver && driverCoords && routeStatus === 'loading' && routeCoords.length === 0 && (
          <View className="absolute bottom-20 self-center flex-row items-center gap-2 bg-slate-900/90 rounded-[20px] px-4 py-2.5 border border-[#00babc]/30">
            <MaterialIcons name="directions" size={20} color="#00babc" />
            <Text className="text-[#00babc] text-[13px] font-medium">A calcular rota...</Text>
          </View>
        )}

        {/* UI-04: Driver info card for cadete mode */}
        {!isDriver && liveDriverCoords && !driverOffline && (
          <View className="absolute top-3 left-4 right-4 bg-slate-900/95 rounded-[16px] px-4 py-3 border border-slate-700 flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-[#00babc]/20 border border-[#00babc]/40 items-center justify-center">
              <FontAwesome5 name="bus" size={16} color="#00babc" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-[14px] font-bold">
                {liveDriverName ? `Motorista: ${liveDriverName}` : 'Autocarro 42'}
              </Text>
              <Text className="text-slate-400 text-[12px] mt-0.5">
                {eta !== null ? `Chegada estimada: ~${eta} min` : 'Em rota'}
              </Text>
            </View>
            <View className="flex-row items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30">
              <View className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <Text className="text-emerald-500 text-[10px] font-bold">LIVE</Text>
            </View>
          </View>
        )}

        {/* Cadete: Driver offline warning */}
        {!isDriver && driverOffline && (
          <View className="absolute top-3 left-4 right-4 bg-slate-900/95 rounded-[16px] px-4 py-3 border border-amber-500/40 flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 items-center justify-center">
              <Ionicons name="warning" size={20} color="#f59e0b" />
            </View>
            <View className="flex-1">
              <Text className="text-amber-400 text-[14px] font-bold">Motorista offline</Text>
              <Text className="text-slate-400 text-[12px] mt-0.5">Última posição conhecida no mapa</Text>
            </View>
          </View>
        )}
      </View>

      {/* Footer — UI-03: Improved with ETA */}
      <View className="flex-row justify-between items-center px-5 py-2.5 border-t border-slate-700 bg-slate-800">
        <View className="flex-row items-center gap-1.5 flex-1">
          <Ionicons
            name="radio"
            size={12}
            color={isDriver
              ? '#10b981'
              : liveDriverCoords && !driverOffline
                ? '#10b981'
                : '#f59e0b'
            }
          />
          <Text className="text-slate-300 text-[12px] flex-1" numberOfLines={1}>
            {isDriver
              ? routeStatus === 'loading'
                ? 'A recalcular...'
                : routeStatus === 'error'
                  ? 'Sem rede'
                  : 'GPS ativo'
              : driverOffline
                ? 'Motorista offline'
                : liveDriverCoords
                  ? `Autocarro em rota${eta !== null ? ` · ~${eta} min` : ''}`
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
        {!isDriver && eta !== null && !driverOffline && (
          <View className="flex-row items-center gap-1 bg-[#00babc]/10 rounded-full px-2.5 py-1 border border-[#00babc]/30">
            <Ionicons name="time" size={12} color="#00babc" />
            <Text className="text-[#00babc] font-bold text-[12px]">~{eta} min</Text>
          </View>
        )}
        {!isDriver && !liveDriverCoords && (
          <Text className="text-slate-400 font-bold text-[12px] ml-2">Offline</Text>
        )}
      </View>
    </View>
  );
};
