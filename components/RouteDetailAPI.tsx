import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity, Animated, Easing } from 'react-native';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Route, MiniBusStop } from '../types/api';
import { routeService } from '../services/routeService';
import polyline from '@mapbox/polyline';

const BusLoadingScreen = ({ msg }: { msg: string }) => {
  const fillAnim = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Infinite fill loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(fillAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(fillAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.in(Easing.quad),
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Staggered dots
    const makeDot = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.3, duration: 350, useNativeDriver: true }),
          Animated.delay(700),
        ])
      );

    makeDot(dot1, 0).start();
    makeDot(dot2, 200).start();
    makeDot(dot3, 400).start();
  }, []);

  const fillWidth = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
      {/* Bus silhouette */}
      <View style={{ width: 200, height: 90, marginBottom: 32 }}>
        {/* Bus body */}
        <View style={{
          width: 200, height: 72, backgroundColor: '#1e293b',
          borderRadius: 14, borderWidth: 2, borderColor: '#334155',
          overflow: 'hidden', justifyContent: 'flex-end',
        }}>
          {/* Fill */}
          <Animated.View style={{
            position: 'absolute', bottom: 0, left: 0,
            height: '100%', width: fillWidth,
            backgroundColor: '#00babc', opacity: 0.85,
            borderRadius: 12,
          }} />

          {/* Windows row */}
          <View style={{ flexDirection: 'row', paddingHorizontal: 12, paddingTop: 10, position: 'absolute', top: 0, left: 0, right: 0 }}>
            {[0,1,2,3].map(i => (
              <View key={i} style={{
                flex: 1, height: 26, marginHorizontal: 3,
                backgroundColor: 'rgba(15,23,42,0.55)',
                borderRadius: 5, borderWidth: 1, borderColor: '#475569',
              }} />
            ))}
          </View>

          {/* Door */}
          <View style={{
            position: 'absolute', bottom: 0, right: 14,
            width: 16, height: 30,
            backgroundColor: 'rgba(15,23,42,0.6)',
            borderRadius: 4, borderWidth: 1, borderColor: '#475569',
          }} />

          {/* Front light */}
          <View style={{
            position: 'absolute', top: 24, left: 6,
            width: 8, height: 8, borderRadius: 4,
            backgroundColor: '#fbbf24',
          }} />
        </View>

        {/* Wheels */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 22, marginTop: 2 }}>
          {[0,1].map(i => (
            <View key={i} style={{
              width: 26, height: 26, borderRadius: 13,
              backgroundColor: '#1e293b', borderWidth: 3, borderColor: '#334155',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#475569' }} />
            </View>
          ))}
        </View>
      </View>

      {/* Message */}
      <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 16, textAlign: 'center', marginBottom: 6 }}>
        {msg}
      </Text>

      {/* Dots */}
      <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
        {[dot1, dot2, dot3].map((d, i) => (
          <Animated.View key={i} style={{
            width: 8, height: 8, borderRadius: 4,
            backgroundColor: '#00babc', opacity: d,
          }} />
        ))}
      </View>
    </View>
  );
};

interface RouteDetailAPIProps {
  routeId: number;
  onBack?: () => void;
}



export const RouteDetailAPI = ({ routeId, onBack }: RouteDetailAPIProps) => {

  const [route, setRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ msg, setMsg] = useState<string>('Carregando dados da rota...');
  const [selectedStop, setSelectedStop] = useState<MiniBusStop | null>(null);
  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
  const [estimatedDistance, setEstimatedDistance] = useState<number | null>(null);
  const [estimatedDuration, setEstimatedDuration] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'stops' | 'driver'>('stops');

useEffect(() => {
  const fetchData = async () => {
    await loadRouteData();
  };
  fetchData();
}, [routeId]);

useEffect(() => {
  if (route?.stops && route.stops.length >= 2) {
    const calculateRoute = async () => {
      setLoading(true);
      setMsg('Calculando rota e estimativas...');

      try {
        let allCoords: { latitude: number; longitude: number }[] = [];
        let totalDistance = 0;
        let totalDuration = 0;

        for (let i = 0; i < route.stops.length - 1; i++) {
          setMsg(`Calculando rota... `);

          const origin = {
            latitude: route.stops[i].latitude!,
            longitude: route.stops[i].longitude!,
          };
          const destination = {
            latitude: route.stops[i + 1].latitude!,
            longitude: route.stops[i + 1].longitude!,
          };
          const url = `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full`;

          const response = await fetch(url);
          const data = await response.json();

          if (data.routes?.[0]) {
            const points = polyline.decode(data.routes[0].geometry);
            const coords = points.map((point: any) => ({
              latitude: point[0],
              longitude: point[1],
            }));

            allCoords = [...allCoords, ...coords];
            totalDistance += data.routes[0].distance / 1000;
            totalDuration += data.routes[0].duration / 60;
          }
        }

        setRouteCoords(allCoords);
        setEstimatedDistance(totalDistance);
        setEstimatedDuration(totalDuration);
      } catch (error) {
        console.log('Erro ao calcular rota:', error);
      } finally {
        setLoading(false);
      }
    };

    calculateRoute();
  }
}, [route]);

  const loadRouteData = async () => {
    try {
      setLoading(true);
      const data = await routeService.getById(routeId);
      console.log('Dados da rota carregados:', JSON.stringify(data, null, 2));
      setRoute(data);
      // setRoute(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados da rota');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <BusLoadingScreen msg={msg} />;
  }

  if (error || !route) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center px-6">
        <Ionicons name="alert-circle" size={64} color="#ef4444" />
        <Text className="text-white text-xl font-bold mt-4 text-center">Erro ao carregar rota</Text>
        <Text className="text-slate-400 mt-2 text-center">{error}</Text>
        <TouchableOpacity 
          onPress={loadRouteData}
          className="bg-cyan-600 px-6 py-3 rounded-xl mt-6"
          style={{ backgroundColor: '#00babc' }}
        >
          <Text className="text-white font-bold">Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const validStops = route?.stops?.filter(
    stop => stop.latitude !== null && stop.longitude !== null
  ) || [];

  const initialRegion = routeCoords.length > 0 ? {
    latitude: routeCoords[0].latitude,
    longitude: routeCoords[0].longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  } : {
    latitude: -8.8383, // Luanda default
    longitude: 13.2344,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  const activeDrivers = route?.drivers?.filter(d => d.current_route?.id === route.id) || [];
  const primaryDriver = activeDrivers[0] || route.drivers?.[0] || null;

  const firstStop = validStops[0];
  const lastStop = validStops[validStops.length - 1];

  return (
    <View className="flex-1 bg-slate-900">
      <StatusBar style="light" backgroundColor="transparent" translucent />

      {/* ── Map (full top half) ── */}
      <View style={{ height: '52%' }}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={{ flex: 1 }}
          initialRegion={initialRegion}
        >
          {routeCoords.length > 1 && (
            <Polyline coordinates={routeCoords} strokeColor="#2563eb" strokeWidth={5} />
          )}
          {validStops.map((stop, index) => (
            <Marker
              key={stop.id}
              coordinate={{ latitude: stop.latitude!, longitude: stop.longitude! }}
              title={stop.stop_name || `Paragem ${index + 1}`}
              description={stop.distrit || ''}
              onPress={() => setSelectedStop(stop)}
            >
              {index === 0 || index === validStops.length - 1 ? (
                <View
                  className="w-5 h-5 rounded-full border-2 border-white"
                  style={{ backgroundColor: '#0f172a' }}
                />
              ) : (
                <View
                  className="w-7 h-7 rounded-full items-center justify-center border-2 border-white"
                  style={{ backgroundColor: '#00babc' }}
                >
                  <Text className="text-white font-bold" style={{ fontSize: 10 }}>{index}</Text>
                </View>
              )}
            </Marker>
          ))}
        </MapView>

        {/* Floating back + refresh */}
        <View className="absolute top-14 left-4 right-4 flex-row justify-between">
          <TouchableOpacity
            onPress={onBack}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(15,23,42,0.9)', borderWidth: 1, borderColor: '#334155', alignItems: 'center', justifyContent: 'center' }}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={loadRouteData}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: 'rgba(15,23,42,0.85)' }}
          >
            <Ionicons name="refresh" size={20} color="#00babc" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Bottom sheet ── */}
      <View className="flex-1 bg-slate-900 rounded-t-3xl" style={{ marginTop: -20 }}>
        {/* Handle */}
        <View className="items-center pt-3 pb-2">
          <View className="w-10 h-1 rounded-full bg-slate-600" />
        </View>

        {/* Route title + stats */}
        <View className="px-5 pb-3 border-b border-slate-700">
          <Text className="text-white text-xl font-bold">{route.route_name}</Text>
          {route.description && (
            <Text className="text-slate-400 text-sm mt-1">{route.description}</Text>
          )}

          <View className="flex-row mt-3 gap-x-3">
            {/* Paragens */}
            <View className="flex-row items-center bg-slate-800 rounded-xl px-3 py-2 border border-slate-700">
              <FontAwesome5 name="map-marker-alt" size={13} color="#00babc" />
              <Text className="text-slate-300 text-xs ml-2">
                <Text className="text-white font-bold">{route.stops?.length || 0}</Text> paragens
              </Text>
            </View>

            {/* Distância */}
            {estimatedDistance !== null && (
              <View className="flex-row items-center bg-slate-800 rounded-xl px-3 py-2 border border-slate-700">
                <MaterialIcons name="straighten" size={13} color="#00babc" />
                <Text className="text-slate-300 text-xs ml-2">
                  <Text className="text-white font-bold">{estimatedDistance.toFixed(1)} km</Text>
                </Text>
              </View>
            )}

            {/* Duração */}
            {estimatedDuration !== null && (
              <View className="flex-row items-center bg-slate-800 rounded-xl px-3 py-2 border border-slate-700">
                <Ionicons name="time-outline" size={13} color="#00babc" />
                <Text className="text-slate-300 text-xs ml-2">
                  <Text className="text-white font-bold">{Math.round(estimatedDuration)} min</Text>
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row mx-5 mt-3 bg-slate-800 rounded-xl p-1 border border-slate-700">
          <TouchableOpacity
            onPress={() => setActiveTab('stops')}
            className="flex-1 py-2 rounded-lg items-center"
            style={activeTab === 'stops' ? { backgroundColor: '#00babc' } : {}}
          >
            <Text className={`text-sm font-bold ${activeTab === 'stops' ? 'text-white' : 'text-slate-400'}`}>
              Paragens
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('driver')}
            className="flex-1 py-2 rounded-lg items-center"
            style={activeTab === 'driver' ? { backgroundColor: '#00babc' } : {}}
          >
            <Text className={`text-sm font-bold ${activeTab === 'driver' ? 'text-white' : 'text-slate-400'}`}>
              Motorista
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab content */}
        <ScrollView className="flex-1 px-5 mt-3" showsVerticalScrollIndicator={false}>
          {activeTab === 'stops' ? (
            <>
              {/* Origin → Destination bar */}
              {firstStop && lastStop && (
                <View className="bg-slate-800 rounded-2xl p-4 mb-3 border border-slate-700 flex-row items-center">
                  <View className="items-center mr-3">
                    <View className="w-3 h-3 rounded-full bg-slate-400" />
                    <View className="w-0.5 h-8 bg-slate-600 my-1" />
                    <View className="w-3 h-3 rounded-full" style={{ backgroundColor: '#00babc' }} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-slate-400 text-xs">Origem</Text>
                    <Text className="text-white font-bold text-sm">{firstStop.stop_name}</Text>
                    <View className="h-3" />
                    <Text className="text-slate-400 text-xs">Destino</Text>
                    <Text className="text-white font-bold text-sm">{lastStop.stop_name}</Text>
                  </View>
                </View>
              )}

              {route.stops?.map((stop, index) => (
                <TouchableOpacity
                  key={stop.id}
                  onPress={() => setSelectedStop(selectedStop?.id === stop.id ? null : stop)}
                  className="flex-row items-start mb-1"
                >
                  {/* Timeline */}
                  <View className="items-center mr-3 pt-1">
                    <View
                      className="w-7 h-7 rounded-full items-center justify-center"
                      style={{ backgroundColor: selectedStop?.id === stop.id ? '#00babc' : '#1e293b', borderWidth: 2, borderColor: selectedStop?.id === stop.id ? '#00babc' : '#334155' }}
                    >
                      <Text className="text-white font-bold" style={{ fontSize: 10 }}>{index + 1}</Text>
                    </View>
                    {index < route.stops.length - 1 && (
                      <View className="w-0.5 h-8 bg-slate-700 mt-1" />
                    )}
                  </View>

                  {/* Card */}
                  <View
                    className="flex-1 rounded-xl p-3 mb-2"
                    style={selectedStop?.id === stop.id
                      ? { backgroundColor: 'rgba(0,186,188,0.1)', borderWidth: 1, borderColor: '#00babc' }
                      : { backgroundColor: '#1e293b' }}
                  >
                    <Text className="text-white font-bold">{stop.stop_name || `Paragem ${index + 1}`}</Text>
                    {stop.distrit && <Text className="text-slate-400 text-xs mt-0.5">{stop.distrit}</Text>}
                    {selectedStop?.id === stop.id && stop.cadetes && stop.cadetes.length > 0 && (
                      <View className="flex-row items-center mt-1">
                        <Ionicons name="people" size={12} color="#00babc" />
                        <Text className="text-cyan-400 text-xs ml-1" style={{ color: '#00babc' }}>
                          {stop.cadetes.length} cadete(s) embarcam aqui
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
              <View className="h-6" />
            </>
          ) : (
            <>
              {primaryDriver ? (
                <View className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
                  {/* Avatar placeholder */}
                  <View className="flex-row items-center mb-4">
                    <View
                      className="w-16 h-16 rounded-full items-center justify-center mr-4"
                      style={{ backgroundColor: 'rgba(0,186,188,0.15)', borderWidth: 2, borderColor: '#00babc' }}
                    >
                      <FontAwesome5 name="user" size={28} color="#00babc" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-bold text-lg">
                        {primaryDriver.full_name || primaryDriver.username || 'Motorista'}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <View className="w-2 h-2 rounded-full bg-emerald-400 mr-2" />
                        <Text className="text-emerald-400 text-xs font-bold">ATIVO</Text>
                      </View>
                    </View>
                  </View>

                  <View className="gap-y-2">
                    <View className="flex-row items-center bg-slate-700 rounded-xl px-4 py-3">
                      <Ionicons name="mail-outline" size={16} color="#00babc" />
                      <Text className="text-slate-300 text-sm ml-3">{primaryDriver.email || 'N/D'}</Text>
                    </View>
                    <View className="flex-row items-center bg-slate-700 rounded-xl px-4 py-3">
                      <Ionicons name="call-outline" size={16} color="#00babc" />
                      <Text className="text-slate-300 text-sm ml-3">
                        {primaryDriver.phone ? String(primaryDriver.phone) : 'N/D'}
                      </Text>
                    </View>
                    <View className="flex-row items-center bg-slate-700 rounded-xl px-4 py-3">
                      <FontAwesome5 name="id-card" size={14} color="#00babc" />
                      <Text className="text-slate-300 text-sm ml-3">ID #{primaryDriver.id}</Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View className="bg-slate-800 rounded-2xl p-10 border border-slate-700 items-center">
                  <FontAwesome5 name="user-slash" size={36} color="#475569" />
                  <Text className="text-slate-400 mt-3 text-center">
                    Nenhum motorista associado a esta rota
                  </Text>
                </View>
              )}
              <View className="h-6" />
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
};
