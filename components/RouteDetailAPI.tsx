import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Route, MiniBusStop, Driver } from '../types/api';
import { routeService } from '../services/routeService';
import polyline from '@mapbox/polyline';
import { getCurrentPositionAsync } from 'expo-location';

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
          setMsg(`Calculando rota... (${i + 1}/${route.stops.length - 1})`);

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
    return (
      <View className="flex-1  bg-slate-900 justify-center items-center">
        <ActivityIndicator size="large" color="#00babc" />
        <Text className="text-white mt-4">{msg}</Text>
      </View>
    );
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

  return (
    <View className="flex-1 bg-slate-900">
      <StatusBar style="light" backgroundColor="#0f172a" />
      
      {/* Header */}
      <View className="border-b-2 border-[#00babc] pt-12 pb-4 px-6">
        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity onPress={onBack} className="flex-row items-center">
            <Ionicons name="arrow-back" size={24} color="white" />
            <Text className="text-white text-lg font-medium ml-2">Voltar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={loadRouteData}>
            <Ionicons name="refresh" size={24} color="#00babc" />
          </TouchableOpacity>
        </View>
        
        <Text className="text-white text-2xl font-bold">{route.route_name}</Text>
        {route.description && (
          <Text className="text-slate-400 text-sm mt-1">{route.description}</Text>
        )}
        
        {/* Quick Stats */}
        <View className="flex-row justify-between mt-4">
          <View className="flex-1 bg-slate-800 rounded-xl p-3 mr-2 border border-slate-700">
            <FontAwesome5 name="map-marker-alt" size={16} color="#00babc" />
            <Text className="text-slate-400 text-xs mt-1">Paragens</Text>
            <Text className="text-cyan-400 text-xl font-bold" style={{ color: '#00babc' }}>
              {route.stops?.length || 0}
            </Text>
          </View>
          <View className="flex-1 bg-slate-800 rounded-xl p-3 ml-2 border border-slate-700">
            <FontAwesome5 name="bus" size={16} color="#10b981" />
            <Text className="text-slate-400 text-xs mt-1">Motoristas</Text>
            <Text className="text-emerald-400 text-xl font-bold">
              {activeDrivers.length}
            </Text>
          </View>
        </View>
      </View>

      {/* Map */}
      {validStops.length > 0 && (
        <View className="h-96 border-b border-slate-700">
          <MapView
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            initialRegion={initialRegion}
          >
            {/* Route line */}
            {routeCoords.length > 1 && (
              <Polyline
                coordinates={routeCoords}
                strokeColor="#00babc"
                strokeWidth={3}
              />
            )}
            
            {/* Stop markers */}
            {validStops.map((stop, index) => (
              <Marker
                key={stop.id}
                coordinate={{
                  latitude: stop.latitude!,
                  longitude: stop.longitude!,
                }}
                title={stop.stop_name || `Paragem ${index + 1}`}
                description={stop.distrit || ''}
                onPress={() => setSelectedStop(stop)}
              >
                <View className="bg-cyan-600 rounded-full w-8 h-8 items-center justify-center border-2 border-white">
                  <Text className="text-white font-bold text-xs">{index + 1}</Text>
                </View>
              </Marker>
            ))}
          </MapView>
        </View>
      )}

      {/* Content */}
      <ScrollView className="flex-1 px-6 py-4">
        {/* Active Drivers */}
        {activeDrivers.length > 0 && (
          <View className="bg-slate-800 rounded-2xl p-6 mb-6 shadow-lg border border-slate-700">
            <Text className="text-white text-xl font-bold mb-4">Motoristas Ativos</Text>
            {activeDrivers.map((driver) => (
              <View key={driver.id} className="bg-slate-700 rounded-xl p-4 mb-2">
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-white font-bold">{driver.full_name || 'Motorista'}</Text>
                    <Text className="text-slate-400 text-sm">ID: {driver.id}</Text>
                  </View>
                  <View className="bg-emerald-900/30 px-3 py-1 rounded-full border border-emerald-600">
                    <Text className="text-emerald-400 text-xs font-bold">ATIVO</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Stops List */}
        <View className="bg-slate-800 rounded-2xl p-6 mb-6 shadow-lg border border-slate-700">
          <Text className="text-white text-xl font-bold mb-4">Paragens da Rota</Text>
          
          {route.stops && route.stops.length > 0 ? (
            route.stops.map((stop, index) => (
              <TouchableOpacity
                key={stop.id}
                onPress={() => setSelectedStop(stop)}
                className={`p-4 rounded-xl mb-2 ${selectedStop?.id === stop.id ? 'bg-cyan-900/30 border border-cyan-600' : 'bg-slate-700'}`}
                style={selectedStop?.id === stop.id ? { backgroundColor: 'rgba(0, 186, 188, 0.1)', borderColor: '#00babc' } : {}}
              >
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-cyan-600 rounded-full items-center justify-center mr-3" style={{ backgroundColor: '#00babc' }}>
                    <Text className="text-white font-bold text-sm">{index + 1}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold">{stop.stop_name || `Paragem ${index + 1}`}</Text>
                    {stop.distrit && (
                      <Text className="text-slate-400 text-sm">{stop.distrit}</Text>
                    )}
                    {stop.latitude && stop.longitude && (
                      <Text className="text-slate-500 text-xs font-mono mt-1">
                        {stop.latitude.toFixed(6)}, {stop.longitude.toFixed(6)}
                      </Text>
                    )}
                    {stop.cadetes && stop.cadetes.length > 0 && (
                      <Text className="text-cyan-400 text-xs mt-1" style={{ color: '#00babc' }}>
                        {stop.cadetes.length} cadete(s)
                      </Text>
                    )}
                  </View>
                  <Ionicons 
                    name={selectedStop?.id === stop.id ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#94a3b8" 
                  />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="bg-slate-700 rounded-xl p-6 items-center">
              <FontAwesome5 name="map-marked-alt" size={32} color="#64748b" />
              <Text className="text-slate-400 text-center mt-3">
                Nenhuma paragem cadastrada nesta rota
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};
