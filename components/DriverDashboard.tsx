import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
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
import { Driver, Route } from '../types/api';
import { BusLoadingScreen } from './BusLoadingScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  /* ── Seleção de Rota ─────────────────────────────────────────── */
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [allRoutes, setAllRoutes] = useState<Route[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [activeRoute, setActiveRoute] = useState<Route | null>(null);
  const [tripLoading, setTripLoading] = useState(false);

  /* ── Animações ──────────────────────────────────────────────── */
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.6)).current;
  const dotAnim = useRef(new Animated.Value(1)).current;

  const locationSubRef = useRef<Location.LocationSubscription | null>(null);

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
      } catch (err) {
        console.error('Erro ao carregar dados do motorista:', err);
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
        { accuracy: Location.Accuracy.High, timeInterval: 10000, distanceInterval: 30 },
        async (loc) => {
          const { latitude, longitude } = loc.coords;
          setLastCoords({ lat: latitude, long: longitude });
          setUpdateCount((c) => c + 1);
          try {
            await driverService.updateLocation(driverId, { lat: latitude, long: longitude });
          } catch { /* silent */ }
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
      await driverService.assignRoute(driverId, { id: route.id });
    } catch (err) {
      console.warn('assignRoute falhou (continua localmente):', err);
    } finally {
      setTripLoading(false);
    }
    setActiveRoute(route);
    setTripActive(true);
    setIsTracking(true);
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
              setTripActive(false);
              setIsTracking(false);
              setLastCoords(null);
              setUpdateCount(0);
              setActiveRoute(null);
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
    <View style={styles.root}>
      <StatusBar style="light" backgroundColor={BG} />

      {/* ── Modal de Seleção de Rota ───────────────────────────── */}
      <Modal
        visible={showRouteModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRouteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <MaterialIcons name="route" size={22} color={ACCENT} />
              <Text style={styles.modalTitle}>Escolher Rota</Text>
              <TouchableOpacity onPress={() => setShowRouteModal(false)} style={styles.modalClose}>
                <Ionicons name="close" size={20} color={MUTED} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>Seleciona a rota que vais percorrer nesta viagem.</Text>

            {loadingRoutes ? (
              <ActivityIndicator color={ACCENT} size="large" style={{ marginVertical: 32 }} />
            ) : allRoutes.length === 0 ? (
              <Text style={[styles.modalSub, { textAlign: 'center', marginTop: 24 }]}>Nenhuma rota disponível.</Text>
            ) : (
              <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                {allRoutes.map((route) => (
                  <TouchableOpacity
                    key={route.id}
                    style={styles.routeOption}
                    onPress={() => handleSelectRoute(route)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.routeOptionLeft}>
                      <Text style={styles.routeOptionName}>{route.route_name}</Text>
                      {route.description ? (
                        <Text style={styles.routeOptionDesc} numberOfLines={1}>{route.description}</Text>
                      ) : null}
                      <View style={styles.routeOptionMeta}>
                        <Ionicons name="location" size={12} color={MUTED} />
                        <Text style={styles.routeOptionMetaText}>{route.stops?.length ?? 0} paragens</Text>
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

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>

        {/* ── Header ──────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.driverName}>{firstName} </Text>
            <Text style={styles.role}>Motorista · 42 Luanda</Text>
          </View>

          {/* Indicador status live */}
          <View style={[styles.statusChip, { borderColor: tripActive ? SUCCESS : BORDER }]}>
            <Animated.View style={[styles.statusDot, { opacity: tripActive ? dotAnim : 1, backgroundColor: tripActive ? SUCCESS : MUTED }]} />
            <Text style={[styles.statusText, { color: tripActive ? SUCCESS : MUTED }]}>
              {tripActive ? 'Em Viagem' : 'Inativo'}
            </Text>
          </View>
        </View>

        {/* ── Botão Principal: Iniciar / Terminar ─────────────── */}
        <View style={styles.actionCenter}>
          {/* Anel pulsante de fundo */}
          <Animated.View
            style={[
              styles.pulseRing,
              {
                transform: [{ scale: pulseAnim }],
                opacity: pulseOpacity,
                borderColor: tripActive ? SUCCESS : ACCENT,
              },
            ]}
          />
          <TouchableOpacity
            style={[styles.bigBtn, { backgroundColor: tripActive ? SUCCESS : ACCENT }]}
            onPress={handleToggleTrip}
            activeOpacity={0.85}
          >
            <FontAwesome5
              name={tripActive ? 'stop-circle' : 'play-circle'}
              size={36}
              color="#fff"
            />
            <Text style={styles.bigBtnText}>
              {tripActive ? 'Terminar Viagem' : 'Iniciar Viagem'}
            </Text>
            <Text style={styles.bigBtnSub}>
              {tripActive ? 'Toca para terminar e parar o GPS' : 'Toca para iniciar e partilhar localização'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── GPS / Localização ───────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="location" size={20} color={ACCENT} />
            <Text style={styles.cardTitle}>Partilha de Localização</Text>
            <Animated.View style={[styles.liveDot, { opacity: isTracking ? dotAnim : 1, backgroundColor: isTracking ? ACCENT : MUTED }]} />
          </View>

          {locationError ? (
            <View style={styles.errorRow}>
              <Ionicons name="warning" size={16} color={DANGER} />
              <Text style={[styles.errorText]}>{locationError}</Text>
            </View>
          ) : isTracking ? (
            <>
              <View style={styles.infoRow}>
                <MaterialIcons name="gps-fixed" size={16} color={SUCCESS} />
                <Text style={styles.infoLabel}>Estado</Text>
                <Text style={[styles.infoValue, { color: SUCCESS }]}>GPS Ativo · A enviar posição</Text>
              </View>
              {lastCoords && (
                <View style={styles.coordBox}>
                  <Text style={styles.coordLabel}>Última posição</Text>
                  <Text style={styles.coordText}>
                    Lat {lastCoords.lat.toFixed(5)} · Long {lastCoords.long.toFixed(5)}
                  </Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.infoRow}>
              <MaterialIcons name="gps-off" size={16} color={MUTED} />
              <Text style={[styles.infoLabel, { color: MUTED }]}>GPS desativado</Text>
              <Text style={[styles.infoValue, { color: MUTED }]}>Inicia a viagem para partilhar localização</Text>
            </View>
          )}
        </View>

        {/* ── Rota da Viagem Atual ──────────────────────────────── */}
        {activeRoute ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="route" size={20} color={ACCENT} />
              <Text style={styles.cardTitle}>Rota em Curso</Text>
              <View style={[styles.metaItem, { backgroundColor: 'rgba(16,185,129,0.12)', borderColor: SUCCESS }]}>
                <FontAwesome5 name="bus" size={11} color={SUCCESS} />
                <Text style={[styles.metaText, { color: SUCCESS }]}>Em Curso</Text>
              </View>
            </View>

            <View style={styles.routeBox}>
              <Text style={styles.routeName}>{activeRoute.route_name}</Text>
              {activeRoute.description && (
                <Text style={styles.routeDesc}>{activeRoute.description}</Text>
              )}
              <View style={styles.routeMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="location" size={14} color={ACCENT} />
                  <Text style={styles.metaText}>{activeRoute.stops?.length ?? 0} paragens</Text>
                </View>
              </View>
            </View>

            {/* Lista de paragens */}
            {activeRoute.stops && activeRoute.stops.length > 0 && (
              <View style={{ marginTop: 12 }}>
                <Text style={styles.stopsLabel}>Paragens</Text>
                {activeRoute.stops.map((stop, i) => (
                  <View key={stop.id} style={styles.stopRow}>
                    <View style={styles.stopBullet}>
                      <Text style={styles.stopBulletText}>{i + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.stopName}>{stop.stop_name ?? 'Paragem'}</Text>
                      {stop.distrit && <Text style={styles.stopDistrit}>{stop.distrit}</Text>}
                    </View>
                    {/* <View style={styles.cadetesBadge}>
                      <Ionicons name="people" size={12} color={ACCENT} />
                      <Text style={styles.cadetesBadgeText}>{stop.cadetes?.length ?? 0}</Text>
                    </View> */}
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="route" size={20} color={MUTED} />
              <Text style={[styles.cardTitle, { color: MUTED }]}>Sem Viagem Ativa</Text>
            </View>
            <Text style={styles.noRoute}>Toca em "Iniciar Viagem" para escolher uma rota e começar.</Text>
          </View>
        )}

        {/* ── Info do Motorista ────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FontAwesome5 name="id-badge" size={18} color={ACCENT} />
            <Text style={styles.cardTitle}>Identificação</Text>
          </View>

          <View style={styles.infoRow}>
            <FontAwesome5 name="user" size={14} color={MUTED} />
            <Text style={styles.infoLabel}>Nome</Text>
            <Text style={styles.infoValue}>{driver?.full_name ?? '—'}</Text>
          </View>
          {driver?.username && (
            <View style={styles.infoRow}>
              <FontAwesome5 name="at" size={14} color={MUTED} />
              <Text style={styles.infoLabel}>Username</Text>
              <Text style={styles.infoValue}>{driver.username}</Text>
            </View>
          )}
          {driver?.email && (
            <View style={styles.infoRow}>
              <Ionicons name="mail" size={14} color={MUTED} />
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{driver.email}</Text>
            </View>
          )}
          {driver?.phone && (
            <View style={styles.infoRow}>
              <Ionicons name="call" size={14} color={MUTED} />
              <Text style={styles.infoLabel}>Telefone</Text>
              <Text style={styles.infoValue}>{driver.phone}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <FontAwesome5 name="id-card" size={14} color={MUTED} />
            <Text style={styles.infoLabel}>ID</Text>
            <Text style={styles.infoValue}>#{driverId}</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

/* ── Styles ─────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    color: MUTED,
    fontSize: 13,
    letterSpacing: 0.4,
  },
  driverName: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '700',
    marginTop: 2,
  },
  role: {
    color: ACCENT,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: CARD,
    marginTop: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },

  /* ── Botão Principal ── */
  actionCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
  },
  pulseRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 3,
  },
  bigBtn: {
    width: 170,
    height: 170,
    borderRadius: 85,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 16,
  },
  bigBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  bigBtnSub: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 10,
    textAlign: 'center',
    paddingHorizontal: 16,
  },

  /* ── Cards ── */
  card: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: CARD,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: BORDER,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  /* ── Rows ── */
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51,65,85,0.5)',
  },
  infoLabel: {
    color: MUTED,
    fontSize: 13,
    flex: 1,
  },
  infoValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    flexShrink: 1,
    textAlign: 'right',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderRadius: 10,
  },
  errorText: {
    color: DANGER,
    fontSize: 13,
    flex: 1,
  },
  coordBox: {
    marginTop: 10,
    backgroundColor: 'rgba(0,186,188,0.08)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,186,188,0.25)',
  },
  coordLabel: {
    color: MUTED,
    fontSize: 11,
    marginBottom: 2,
  },
  coordText: {
    color: ACCENT,
    fontFamily: 'monospace',
    fontSize: 12,
  },

  /* ── Rota ── */
  routeBox: {
    backgroundColor: 'rgba(0,186,188,0.07)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,186,188,0.2)',
  },
  routeName: {
    color: ACCENT,
    fontSize: 17,
    fontWeight: '700',
  },
  routeDesc: {
    color: '#cbd5e1',
    fontSize: 13,
    marginTop: 4,
  },
  routeMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'rgba(0,186,188,0.12)',
    borderColor: ACCENT,
  },
  metaText: {
    color: ACCENT,
    fontSize: 12,
    fontWeight: '500',
  },
  stopsLabel: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  stopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51,65,85,0.4)',
  },
  stopBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,186,188,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopBulletText: {
    color: ACCENT,
    fontSize: 11,
    fontWeight: '700',
  },
  stopName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  stopDistrit: {
    color: MUTED,
    fontSize: 11,
    marginTop: 1,
  },
  cadetesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(0,186,188,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,186,188,0.3)',
  },
  cadetesBadgeText: {
    color: ACCENT,
    fontSize: 11,
    fontWeight: '600',
  },
  noRoute: {
    color: MUTED,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 8,
  },

  /* ── Modal ── */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#334155',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#475569',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  modalClose: {
    padding: 4,
  },
  modalSub: {
    color: MUTED,
    fontSize: 13,
    marginBottom: 16,
  },
  routeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  routeOptionLeft: {
    flex: 1,
    gap: 3,
  },
  routeOptionName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  routeOptionDesc: {
    color: MUTED,
    fontSize: 12,
  },
  routeOptionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  routeOptionMetaText: {
    color: MUTED,
    fontSize: 11,
  },
});
