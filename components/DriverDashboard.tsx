import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { driverService } from '../services/driverService';
import { routeService } from '../services/routeService';
import { socketService, ConnectionState, BroadcastAck } from '../services/socketService';
import { tripStateService } from '../services/tripStateService';
import { Driver, Route } from '../types/api';
import { BusLoadingScreen } from './BusLoadingScreen';
import { AttendanceQRDisplay } from './AttendanceQRDisplay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDistance } from '../utils/location';

const ACCENT = '#00babc';
const BG = '#0f172a';
const CARD = '#1e293b';
const BORDER = '#334155';
const MUTED = '#64748b';
const SUCCESS = '#10b981';
const DANGER = '#ef4444';

interface DriverDashboardProps {
  driverId: number;
  driverName: string;
}

export const DriverDashboard = ({ driverId, driverName }: DriverDashboardProps) => {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [tripActive, setTripActive] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [lastCoords, setLastCoords] = useState<{ lat: number; long: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [updateCount, setUpdateCount] = useState(0);
  
  /* ── Current Stop ────────────────────────────────────────────── */
  const [currentStopId, setCurrentStopId] = useState<number | null>(null);
  const [nearestStop, setNearestStop] = useState<any>(null);

  /* ── Sonar / Estado da Conexão (FUNC-01) ──────────────────── */
  const [connectionState, setConnectionState] = useState<ConnectionState>(socketService.getConnectionState());
  const [listenersCount, setListenersCount] = useState<number>(0);
  const [lastUpdateAgo, setLastUpdateAgo] = useState<string>('');

  /* ── Seleção de Rota ─────────────────────────────────────────── */
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [allRoutes, setAllRoutes] = useState<Route[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [activeRoute, setActiveRoute] = useState<Route | null>(null);
  const [tripLoading, setTripLoading] = useState(false);

  /* ── Presença por QR ─────────────────────────────────────────── */
  const [showQrModal, setShowQrModal] = useState(false);
  const [tripId, setTripId] = useState<string | null>(tripStateService.getState().tripId);

  /* ── Animações ──────────────────────────────────────────────── */
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.6)).current;
  const dotAnim = useRef(new Animated.Value(1)).current;

  const locationSubRef = useRef<Location.LocationSubscription | null>(null);

  /* ── Sincronizar com estado global da viagem ─────────────── */
  useEffect(() => {
    // Recuperar estado anterior ao montar
    const globalState = tripStateService.getState();
    if (globalState.tripActive && globalState.driverId === driverId) {
      setTripActive(true);
      setActiveRoute(globalState.activeRoute);
      setIsTracking(globalState.isTracking);
      setTripId(globalState.tripId);
    }

    // Inscrever-se a mudanças no estado global
    const unsubscribe = tripStateService.subscribe((state) => {
      if (state.driverId === driverId) {
        setTripActive(state.tripActive);
        setActiveRoute(state.activeRoute);
        setIsTracking(state.isTracking);
        setTripId(state.tripId);
      } else if (!state.tripActive) {
        // Se outro motorista ou ninguém tem viagem ativa, limpar
        setTripActive(false);
        setActiveRoute(null);
        setIsTracking(false);
        setTripId(null);
      }
    });

    return unsubscribe;
  }, [driverId]);

  /* ── FUNC-01: Sonar — rastrear estado da conexão socket ────── */
  useEffect(() => {
    const handleState = (state: ConnectionState) => setConnectionState(state);
    const handleAck = (ack: BroadcastAck) => setListenersCount(ack.listenersCount);

    socketService.onConnectionStateChange(handleState);
    socketService.onBroadcastAck(handleAck);

    // Update "last update ago" every second
    const intervalId = setInterval(() => {
      const ts = socketService.getLastUpdateTimestamp();
      if (ts === 0 || !isTracking) {
        setLastUpdateAgo('');
        return;
      }
      const secs = Math.floor((Date.now() - ts) / 1000);
      if (secs < 5) setLastUpdateAgo('agora');
      else if (secs < 60) setLastUpdateAgo(`há ${secs}s`);
      else setLastUpdateAgo(`há ${Math.floor(secs / 60)}min`);
    }, 1000);

    return () => {
      socketService.offConnectionStateChange(handleState);
      socketService.offBroadcastAck(handleAck);
      clearInterval(intervalId);
    };
  }, [isTracking]);

  /* ── Pulso quando viagem ativa ──────────────────────────────── */
  useEffect(() => {
    let pulseLoop: Animated.CompositeAnimation | null = null;
    if (tripActive) {
      pulseLoop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, { toValue: 1.35, duration: 900, easing: Easing.out(Easing.ease), useNativeDriver: true }),
            Animated.timing(pulseAnim, { toValue: 1, duration: 900, easing: Easing.in(Easing.ease), useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(pulseOpacity, { toValue: 0, duration: 900, useNativeDriver: true }),
            Animated.timing(pulseOpacity, { toValue: 0.6, duration: 900, useNativeDriver: true }),
          ]),
        ])
      );
      pulseLoop.start();
    } else {
      pulseAnim.setValue(1);
      pulseOpacity.setValue(0);
    }
    return () => { pulseLoop?.stop(); };
  }, [tripActive]);

  /* ── Pisca ponto GPS ────────────────────────────────────────── */
  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, { toValue: 0.2, duration: 600, useNativeDriver: true }),
        Animated.timing(dotAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    if (isTracking) blink.start();
    else { blink.stop(); dotAnim.setValue(1); }
    return () => blink.stop();
  }, [isTracking]);

  /* ── Carrega dados do motorista ─────────────────────────────── */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const LocalDriver = await AsyncStorage.getItem('driver_user');
        if (LocalDriver) {
          const parsed = JSON.parse(LocalDriver);
          setDriver(parsed);
        } else if (!driverId) {
          throw new Error('ID do motorista não fornecido');
        } else {
          const data = await driverService.getById(driverId);
          console.log('Dados do motorista carregados:', data);
          setDriver(data);
        }
      } catch (err: any) {
        // Silent — UI shows fallback. Avoid console.error to prevent Expo crashes.
        console.log('[DriverDashboard] Erro ao carregar dados:', err?.message ?? err);
        /* silent – UI shows fallback */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [driverId]);

  /* ── Tracking de localização ───────────────────────────────── */
  useEffect(() => {
    if (!isTracking) {
      locationSubRef.current?.remove();
      locationSubRef.current = null;
      return;
    }

    const start = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permissão de localização negada.');
        setIsTracking(false);
        return;
      }
      setLocationError(null);
      locationSubRef.current = await Location.watchPositionAsync(
        // BUG-05 FIX: Reduced distanceInterval from 30m to 5m for smoother tracking
        { accuracy: Location.Accuracy.Balanced, timeInterval: 4000, distanceInterval: 5 },
        async (loc) => {
          const { latitude, longitude } = loc.coords;
          setLastCoords({ lat: latitude, long: longitude });
          setUpdateCount((c) => c + 1);
          
          // Calcular paragem mais próxima se tiver rota ativa
          if (activeRoute?.stops) {
            let minDistance = Infinity;
            let nearest = null;
            
            for (const stop of activeRoute.stops) {
              if (stop.latitude && stop.longitude) {
                const distance = getDistance(latitude, longitude, stop.latitude, stop.longitude);
                // Considerar paragem próxima se < 300 metros
                if (distance < minDistance) {
                  minDistance = distance;
                  nearest = { ...stop, distance };
                }
              }
            }
            
            if (nearest && nearest.distance < 300) {
              setNearestStop(nearest);
            } else {
              setNearestStop(null);
            }
          }

          try {
            // REST API – persiste coordenadas no DB
            await driverService.updateLocation(driverId, { lat: latitude, long: longitude });
          } catch (err) {
            console.warn('updateLocation REST falhou:', err);
          }
          // WebSocket – emite localização em tempo real para os cadetes da rota
          socketService.driverUpdateLocation(driverId, latitude, longitude);
        }
      );
    };
    start();

    return () => {
      locationSubRef.current?.remove();
      locationSubRef.current = null;
    };
  }, [isTracking, driverId]);

  /* ── Abrir modal de seleção de rota ─────────────────────────── */
  const openRouteModal = async () => {
    setLoadingRoutes(true);
    setShowRouteModal(true);
    try {
      const routes = await routeService.getAll();
      setAllRoutes(routes);
    } catch {
      setAllRoutes([]);
    } finally {
      setLoadingRoutes(false);
    }
  };

  const handleSelectRoute = async (route: Route) => {
    setShowRouteModal(false);
    setTripLoading(true);
    try {
      await driverService.assignRoute(driverId, { current_route_id: route.id });
    } catch (err) {
      console.warn('assignRoute falhou (continua localmente):', err);
    } finally {
      setTripLoading(false);
    }
    // Entra no room WebSocket da rota escolhida
    socketService.driverJoinRoute(driverId);
    // Guardar estado global para persistir entre telas
    tripStateService.startTrip(driverId, route);
    setActiveRoute(route);
    setTripActive(true);
    setIsTracking(true);
    setCurrentStopId(null);
    setNearestStop(null);
    setUpdateCount(0);
  };

  /* ── Iniciar / Terminar Viagem ─────────────────────────────── */
  const handleToggleTrip = () => {
    if (!tripActive) {
      openRouteModal();
    } else {
      Alert.alert(
        'Terminar Viagem',
        'Tens a certeza que queres terminar a viagem e parar o rastreamento?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Terminar',
            style: 'destructive',
            onPress: async () => {
              setTripLoading(true);
              try {
                await driverService.leaveRoute(driverId);
              } catch (err) {
                console.warn('leaveRoute falhou (continua localmente):', err);
              } finally {
                setTripLoading(false);
              }
              // Terminar viagem no serviço global
              tripStateService.endTrip();
              socketService.driverLeaveRoute(driverId);
              setTripActive(false);
              setIsTracking(false);
              setLastCoords(null);
              setUpdateCount(0);
              setActiveRoute(null);
              setCurrentStopId(null);
              setNearestStop(null);
            },
          },
        ]
      );
    }
  };

  if (loading) return <BusLoadingScreen msg="A carregar dados do motorista..." />;
  if (tripLoading) return <BusLoadingScreen msg={tripActive ? 'A terminar viagem...' : 'A iniciar viagem...'} />;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const displayName = driver?.full_name ?? driver?.username ?? driverName;
  const firstName = displayName.split(' ')[0];

  return (
    <View className="flex-1 bg-slate-900">
      <StatusBar style="light" backgroundColor={BG} />

      {/* ── Modal de Seleção de Rota ───────────────────────────── */}
      <Modal
        visible={showRouteModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRouteModal(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-slate-800 rounded-t-[24px] px-5 pb-9 pt-3 border-t border-slate-700">
            <View className="w-10 h-1 rounded-full bg-slate-600 self-center mb-4" />

            <View className="flex-row items-center gap-2 mb-1.5">
              <MaterialIcons name="route" size={22} color={ACCENT} />
              <Text className="text-white text-[18px] font-bold flex-1">Escolher Rota</Text>
              <TouchableOpacity onPress={() => setShowRouteModal(false)} className="p-1">
                <Ionicons name="close" size={20} color={MUTED} />
              </TouchableOpacity>
            </View>

            <Text className="text-slate-400 text-[13px] mb-4">Seleciona a rota que vais percorrer nesta viagem.</Text>

            {loadingRoutes ? (
              <ActivityIndicator color={ACCENT} size="large" className="my-8" />
            ) : allRoutes.length === 0 ? (
              <Text className="text-slate-400 text-[13px] text-center mt-6 mb-4">Nenhuma rota disponível.</Text>
            ) : (
              <ScrollView className="max-h-[400px]" showsVerticalScrollIndicator={false}>
                {allRoutes.map((route) => (
                  <TouchableOpacity
                    key={route.id}
                    className="flex-row items-center bg-slate-900 rounded-[14px] p-3.5 mb-2.5 border border-slate-700"
                    onPress={() => handleSelectRoute(route)}
                    activeOpacity={0.8}
                  >
                    <View className="flex-1 gap-1">
                      <Text className="text-white text-[15px] font-semibold">{route.route_name}</Text>
                      {route.description ? (
                        <Text className="text-slate-400 text-[12px]" numberOfLines={1}>{route.description}</Text>
                      ) : null}
                      <View className="flex-row items-center gap-1 mt-1">
                        <Ionicons name="location" size={12} color={MUTED} />
                        <Text className="text-slate-400 text-[11px]">{route.stops?.length ?? 0} paragens</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={ACCENT} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ── Modal QR de Presença ───────────────────────────────── */}
      {tripActive && tripId && activeRoute && (
        <AttendanceQRDisplay
          visible={showQrModal}
          tripId={tripId}
          driverId={driverId}
          routeId={activeRoute.id}
          routeName={activeRoute.route_name}
          onClose={() => setShowQrModal(false)}
        />
      )}

      <ScrollView className="flex-1 pb-7" showsVerticalScrollIndicator={false}>

        {/* ── Header ──────────────────────────────────────────── */}
        <View className="flex-row justify-between items-start pt-[56px] px-5 pb-5 border-b border-slate-700">
          <View className="flex-1">
            <Text className="text-slate-400 text-[13px] tracking-wide">{greeting},</Text>
            <Text className="text-white text-[26px] font-bold mt-0.5">{firstName} </Text>
            <Text className="text-[#00babc] text-[12px] mt-1 font-medium">Motorista · 42 Luanda</Text>
          </View>

          {/* Indicador status live */}
          <View className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-[20px] border bg-slate-800 mt-1.5 ${tripActive ? "border-emerald-500" : "border-slate-700"}`}>
            <Animated.View style={{ opacity: tripActive ? dotAnim : 1 }} className={`w-2 h-2 rounded-full ${tripActive ? "bg-emerald-500" : "bg-slate-400"}`} />
            <Text className={`text-[12px] font-semibold ${tripActive ? "text-emerald-500" : "text-slate-400"}`}>
              {tripActive ? 'Em Viagem' : 'Inativo'}
            </Text>
          </View>
        </View>

        {/* ── Botão Principal: Iniciar / Terminar ─────────────── */}
        <View className="items-center justify-center py-9">
          {/* Anel pulsante de fundo */}
          <Animated.View
            className="absolute w-[180px] h-[180px] rounded-full border-4" style={{ transform: [{ scale: pulseAnim }], opacity: pulseOpacity, borderColor: tripActive ? "#10b981" : "#00babc" }}
          />
          <TouchableOpacity
            className={`w-[170px] h-[170px] rounded-[85px] items-center justify-center gap-1.5 shadow-xl shadow-emerald-500/40 ${tripActive ? "bg-emerald-500" : "bg-[#00babc]" }`}
            onPress={handleToggleTrip}
            activeOpacity={0.85}
          >
            <FontAwesome5
              name={tripActive ? 'stop-circle' : 'play-circle'}
              size={36}
              color="#fff"
            />
            <Text className="text-white text-[15px] font-bold text-center">
              {tripActive ? 'Terminar Viagem' : 'Iniciar Viagem'}
            </Text>
            <Text className="text-white/65 text-[10px] text-center px-4">
              {tripActive ? 'Toca para terminar e parar o GPS' : 'Toca para iniciar e partilhar localização'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── GPS / Localização + Sonar (FUNC-01, FUNC-02) ──── */}
        <View className="mx-4 mb-3.5  rounded-[20px] p-[18px]">
          <View className="flex-row items-center gap-2 mb-3.5">
            <Ionicons name="location" size={20} color={ACCENT} />
            <Text className="text-white text-[16px] font-bold flex-1">Partilha de Localização</Text>
            {/* FUNC-01: Sonar with 3 states */}
            <View className={`flex-row items-center gap-1.5 px-2.5 py-1 rounded-[20px] border ${
              connectionState === 'connected' && isTracking
                ? 'border-emerald-500 bg-emerald-500/10'
                : connectionState === 'reconnecting'
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-slate-600 bg-slate-700/30'
            }`}>
              <Animated.View
                style={{ opacity: isTracking ? dotAnim : 1 }}
                className={`w-2 h-2 rounded-full ${
                  connectionState === 'connected' && isTracking
                    ? 'bg-emerald-500'
                    : connectionState === 'reconnecting'
                      ? 'bg-amber-500'
                      : 'bg-slate-400'
                }`}
              />
              <Text className={`text-[11px] font-semibold ${
                connectionState === 'connected' && isTracking
                  ? 'text-emerald-500'
                  : connectionState === 'reconnecting'
                    ? 'text-amber-500'
                    : 'text-slate-400'
              }`}>
                {connectionState === 'connected' && isTracking
                  ? 'Online'
                  : connectionState === 'reconnecting'
                    ? 'Reconectando...'
                    : 'Offline'}
              </Text>
            </View>
          </View>

          {locationError ? (
            <View className="flex-row items-center gap-2 p-2.5 bg-red-500/10 rounded-[10px]">
              <Ionicons name="warning" size={16} color={DANGER} />
              <Text className="text-red-500 text-[13px] flex-1">{locationError}</Text>
            </View>
          ) : isTracking ? (
            <>
              <View className="flex-row items-center gap-2 py-1.5 border-b border-slate-700/50">
                <MaterialIcons name="gps-fixed" size={16} color={SUCCESS} />
                <Text className="text-slate-400 text-[13px] flex-1">Estado</Text>
                <Text className="text-emerald-500 text-[13px] font-medium shrink text-right">GPS Ativo · A enviar posição</Text>
              </View>
              {/* FUNC-01: Listeners count + last update */}
              <View className="flex-row items-center gap-2 py-1.5 border-b border-slate-700/50">
                <Ionicons name="people" size={16} color={ACCENT} />
                <Text className="text-slate-400 text-[13px] flex-1">A acompanhar</Text>
                <Text className="text-[#00babc] text-[13px] font-medium">{listenersCount} cadete{listenersCount !== 1 ? 's' : ''}</Text>
              </View>
              {lastUpdateAgo ? (
                <View className="flex-row items-center gap-2 py-1.5 border-b border-slate-700/50">
                  <MaterialIcons name="update" size={16} color={ACCENT} />
                  <Text className="text-slate-400 text-[13px] flex-1">Último envio</Text>
                  <Text className="text-[#00babc] text-[13px] font-medium">{lastUpdateAgo}</Text>
                </View>
              ) : null}
              {lastCoords && (
                <View className="mt-2.5 bg-[#00babc]/10 rounded-[10px] p-2.5 border border-[#00babc]/25">
                  <Text className="text-slate-400 text-[11px] mb-0.5">Última posição</Text>
                  <Text className="text-[#00babc] font-mono text-[12px]">
                    Lat {lastCoords.lat.toFixed(5)} · Long {lastCoords.long.toFixed(5)}
                  </Text>
                </View>
              )}
            </>
          ) : (
            <View className="flex-row items-center gap-2 py-1.5 border-b border-slate-700/50">
              <MaterialIcons name="gps-off" size={16} color={MUTED} />
              <Text className="text-slate-400 text-[13px] flex-1">GPS desativado</Text>
              <Text className="text-slate-400 text-[13px] font-medium shrink text-right">Inicia a viagem para partilhar localização</Text>
            </View>
          )}
        </View>

        {/* ── Rota da Viagem Atual ──────────────────────────────── */}
        {activeRoute ? (
          <View className="mx-4 mb-3.5 rounded-[20px] p-[18px]">
            <View className="flex-row items-center gap-2 mb-3.5">
              <MaterialIcons name="route" size={20} color={ACCENT} />
              <Text className="text-white text-[16px] font-bold flex-1">Rota em Curso</Text>
              <View className="flex-row items-center gap-1 px-2.5 py-1 rounded-[20px] border border-emerald-500 bg-emerald-500/10">
                <FontAwesome5 name="bus" size={11} color={SUCCESS} />
                <Text className="text-emerald-500 text-[12px] font-medium">Em Curso</Text>
              </View>
            </View>

            <View className="bg-[#00babc]/10 rounded-[12px] p-[14px] border border-[#00babc]/20">
              <Text className="text-[#00babc] text-[17px] font-bold">{activeRoute.route_name}</Text>
              {activeRoute.description && (
                <Text className="text-slate-300 text-[13px] mt-1">{activeRoute.description}</Text>
              )}
              <View className="flex-row gap-2 mt-2.5 flex-wrap">
                <View className="flex-row items-center gap-1 px-2.5 py-1 rounded-[20px] border border-[#00babc] bg-[#00babc]/10">
                  <Ionicons name="location" size={14} color={ACCENT} />
                  <Text className="text-[#00babc] text-[12px] font-medium">{activeRoute.stops?.length ?? 0} paragens</Text>
                </View>
              </View>
            </View>

            {/* QR de Presença */}
            {tripActive && tripId && (
              <TouchableOpacity
                className="mt-4 flex-row items-center justify-center gap-2 py-3 rounded-xl border border-[#00babc]/40 bg-[#00babc]/10"
                onPress={() => setShowQrModal(true)}
                activeOpacity={0.8}
              >
                <MaterialIcons name="qr-code-2" size={20} color={ACCENT} />
                <Text className="text-[#00babc] font-bold">Mostrar QR de Presença</Text>
              </TouchableOpacity>
            )}

            {/* Fazer Paragem */}
            {tripActive && (
              <View className="mt-4 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                <Text className="text-white font-bold mb-1">Ponto de Situação</Text>
                {nearestStop ? (
                  <View>
                    <Text className="text-slate-300 text-[13px] mb-3">
                      Estás perto de <Text className="font-bold text-white">{nearestStop.stop_name}</Text> ({Math.round(nearestStop.distance)}m)
                    </Text>
                    <TouchableOpacity
                      className={`py-3 rounded-xl items-center justify-center ${currentStopId === nearestStop.id ? 'bg-slate-700' : 'bg-emerald-500'}`}
                      disabled={currentStopId === nearestStop.id}
                      onPress={() => {
                        setCurrentStopId(nearestStop.id);
                        socketService.driverSetCurrentStop(driverId, nearestStop.id);
                        Alert.alert('Sucesso', 'Cadetes foram notificados da tua chegada à paragem.');
                      }}
                    >
                      <Text className={`font-bold ${currentStopId === nearestStop.id ? 'text-slate-400' : 'text-white'}`}>
                        {currentStopId === nearestStop.id ? 'Paragem Registada' : 'Confirmar Paragem Aqui'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text className="text-slate-400 text-[13px]">
                    Nenhuma paragem próxima (raio de 300m).
                  </Text>
                )}
              </View>
            )}

            {/* Lista de paragens */}
            {activeRoute.stops && activeRoute.stops.length > 0 && (
              <View className="mt-5">
                <Text className="text-slate-400 text-[12px] font-semibold uppercase tracking-widest mb-2">Paragens</Text>
                {activeRoute.stops.map((stop, i) => {
                  const isCurrentStop = stop.id === currentStopId;
                  return (
                    <View key={stop.id} className={`flex-row items-center gap-2.5 py-3 border-b border-slate-700/40 ${isCurrentStop ? 'bg-emerald-500/10 px-2 rounded-lg' : ''}`}>
                      <View className={`w-7 h-7 rounded-full items-center justify-center ${isCurrentStop ? 'bg-emerald-500' : 'bg-[#00babc]/20'}`}>
                        <Text className={`text-[12px] font-bold ${isCurrentStop ? 'text-white' : 'text-[#00babc]'}`}>{i + 1}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className={`text-[14px] font-medium ${isCurrentStop ? 'text-emerald-400' : 'text-white'}`}>{stop.stop_name ?? 'Paragem'}</Text>
                        {stop.distrit && <Text className="text-slate-400 text-[12px] mt-px">{stop.distrit}</Text>}
                      </View>
                      {isCurrentStop && (
                        <View className="flex-row items-center gap-1">
                          <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                          <Text className="text-emerald-500 text-[11px] font-bold">AQUI</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        ) : (
          <View className="mx-4 mb-3.5 rounded-[20px] p-[18px]">
            <View className="flex-row items-center gap-2 mb-3.5">
              <MaterialIcons name="route" size={20} color={MUTED} />
              <Text className="text-slate-400 text-[16px] font-bold flex-1">Sem Viagem Ativa</Text>
            </View>
            <Text className="text-slate-400 text-[13px] text-center py-2">Toca em "Iniciar Viagem" para escolher uma rota e começar.</Text>
          </View>
        )}

        {/* ── Info do Motorista ────────────────────────────────── */}
        <View className="mx-4 mb-3.5  rounded-[20px] p-[18px]">
          <View className="flex-row items-center gap-2 mb-3.5">
            <FontAwesome5 name="id-badge" size={18} color={ACCENT} />
            <Text className="text-white text-[16px] font-bold flex-1">Identificação</Text>
          </View>

          <View className="flex-row items-center gap-2 py-1.5 border-b border-slate-700/50">
            <FontAwesome5 name="user" size={14} color={MUTED} />
            <Text className="text-slate-400 text-[13px] flex-1">Nome</Text>
            <Text className="text-white text-[13px] font-medium shrink text-right">{driver?.full_name ?? '—'}</Text>
          </View>
          {driver?.username && (
            <View className="flex-row items-center gap-2 py-1.5 border-b border-slate-700/50">
              <FontAwesome5 name="at" size={14} color={MUTED} />
              <Text className="text-slate-400 text-[13px] flex-1">Username</Text>
              <Text className="text-white text-[13px] font-medium shrink text-right">{driver.username}</Text>
            </View>
          )}
          {driver?.email && (
            <View className="flex-row items-center gap-2 py-1.5 border-b border-slate-700/50">
              <Ionicons name="mail" size={14} color={MUTED} />
              <Text className="text-slate-400 text-[13px] flex-1">Email</Text>
              <Text className="text-white text-[13px] font-medium shrink text-right">{driver.email}</Text>
            </View>
          )}
          {driver?.phone && (
            <View className="flex-row items-center gap-2 py-1.5 border-b border-slate-700/50">
              <Ionicons name="call" size={14} color={MUTED} />
              <Text className="text-slate-400 text-[13px] flex-1">Telefone</Text>
              <Text className="text-white text-[13px] font-medium shrink text-right">{driver.phone}</Text>
            </View>
          )}
          <View className="flex-row items-center gap-2 py-1.5 border-b border-slate-700/50">
            <FontAwesome5 name="id-card" size={14} color={MUTED} />
            <Text className="text-slate-400 text-[13px] flex-1">ID</Text>
            <Text className="text-white text-[13px] font-medium shrink text-right">#{driverId}</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

/* ── Styles ─────────────────────────────────────────────────────── */

