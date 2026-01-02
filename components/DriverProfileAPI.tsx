import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { Driver } from '../types/api';
import { driverService } from '../services/driverService';

interface DriverProfileAPIProps {
  driverId: number;
  onBack?: () => void;
}

export const DriverProfileAPI = ({ driverId, onBack }: DriverProfileAPIProps) => {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    loadDriverData();
  }, [driverId]);

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    const startLocationTracking = async () => {
      if (!isTracking) return;

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        setIsTracking(false);
        return;
      }

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 50, // Update every 50 meters
        },
        (location) => {
          updateDriverLocation(location.coords.latitude, location.coords.longitude);
        }
      );
    };

    startLocationTracking();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [isTracking]);

  const loadDriverData = async () => {
    try {
      setLoading(true);
      const data = await driverService.getById(driverId);
      setDriver(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados do motorista');
    } finally {
      setLoading(false);
    }
  };

  const updateDriverLocation = async (lat: number, long: number) => {
    try {
      await driverService.updateLocation(driverId, { lat, long });
      console.log('Location updated:', lat, long);
    } catch (err) {
      console.error('Error updating location:', err);
    }
  };

  const toggleTracking = () => {
    setIsTracking(!isTracking);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center">
        <ActivityIndicator size="large" color="#00babc" />
        <Text className="text-white mt-4">Carregando perfil...</Text>
      </View>
    );
  }

  if (error || !driver) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center px-6">
        <Ionicons name="alert-circle" size={64} color="#ef4444" />
        <Text className="text-white text-xl font-bold mt-4 text-center">Erro ao carregar perfil</Text>
        <Text className="text-slate-400 mt-2 text-center">{error}</Text>
        <TouchableOpacity 
          onPress={loadDriverData}
          className="bg-cyan-600 px-6 py-3 rounded-xl mt-6"
          style={{ backgroundColor: '#00babc' }}
        >
          <Text className="text-white font-bold">Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const lastLocation = driver.coordinates && driver.coordinates.length > 0 
    ? driver.coordinates[driver.coordinates.length - 1] 
    : null;

  return (
    <View className="flex-1 bg-slate-900">
      <StatusBar style="light" backgroundColor="#0f172a" />
      
      {/* Header */}
      <View className="border-b-2 border-[#00babc] pt-12 pb-6 px-6">
        <TouchableOpacity onPress={onBack} className="flex-row items-center mb-6">
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text className="text-white text-lg font-medium ml-2">Voltar</Text>
        </TouchableOpacity>
        
        <View className="items-center">
          <View className="w-24 h-24 bg-slate-800 rounded-full items-center justify-center mb-4 shadow-lg border-2 border-cyan-600">
            {driver.photo ? (
              <Text className="text-cyan-600 text-3xl">📷</Text>
            ) : (
              <Text className="text-cyan-600 text-3xl font-bold" style={{ color: '#00babc' }}>
                {driver.full_name?.split(' ').map(n => n[0]).join('') || 'DR'}
              </Text>
            )}
          </View>
          <Text className="text-white text-2xl font-bold">{driver.full_name || 'Motorista'}</Text>
          <Text className="text-cyan-100 text-sm">ID: {driver.id}</Text>
          {driver.email && (
            <Text className="text-slate-400 text-sm mt-1">{driver.email}</Text>
          )}
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Location Tracking Status */}
        <View className="bg-slate-800 rounded-2xl p-6 mb-6 shadow-lg border border-slate-700">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-xl font-bold">Rastreamento GPS</Text>
            <TouchableOpacity 
              onPress={toggleTracking}
              className={`px-4 py-2 rounded-full ${isTracking ? 'bg-emerald-900/30 border border-emerald-600' : 'bg-red-900/30 border border-red-600'}`}
            >
              <Text className={`text-xs font-bold ${isTracking ? 'text-emerald-400' : 'text-red-400'}`}>
                {isTracking ? 'ATIVO' : 'INATIVO'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {lastLocation && (
            <View className="bg-slate-700 rounded-xl p-3">
              <Text className="text-slate-400 text-xs mb-1">Última Localização</Text>
              <Text className="text-white font-mono text-sm">
                Lat: {lastLocation.lat.toFixed(6)}, Long: {lastLocation.long.toFixed(6)}
              </Text>
            </View>
          )}
        </View>

        {/* Current Route */}
        {driver.current_route && (
          <View className="bg-slate-800 rounded-2xl p-6 mb-6 shadow-lg border border-slate-700">
            <Text className="text-white text-xl font-bold mb-4">Rota Atual</Text>
            <View className="bg-cyan-900/30 rounded-xl p-4 border border-cyan-600" style={{ backgroundColor: 'rgba(0, 186, 188, 0.1)', borderColor: '#00babc' }}>
              <Text className="text-cyan-400 text-lg font-bold" style={{ color: '#00babc' }}>
                {driver.current_route.route_name}
              </Text>
              {driver.current_route.description && (
                <Text className="text-slate-300 text-sm mt-2">{driver.current_route.description}</Text>
              )}
              <Text className="text-slate-400 text-sm mt-2">
                {driver.current_route.stops?.length || 0} paragens
              </Text>
            </View>
          </View>
        )}

        {/* Contact Info */}
        <View className="bg-slate-800 rounded-2xl p-6 mb-6 shadow-lg border border-slate-700">
          <Text className="text-white text-xl font-bold mb-4">Informações de Contacto</Text>
          
          {driver.phone && (
            <View className="p-3 bg-slate-700 rounded-xl mb-2">
              <Text className="text-slate-400 text-sm font-medium">Telefone</Text>
              <Text className="text-white font-bold">{driver.phone}</Text>
            </View>
          )}
          
          {driver.username && (
            <View className="p-3 bg-slate-700 rounded-xl">
              <Text className="text-slate-400 text-sm font-medium">Username</Text>
              <Text className="text-white font-bold">{driver.username}</Text>
            </View>
          )}
        </View>

        {/* Messages */}
        {driver.messages && driver.messages.length > 0 && (
          <View className="bg-slate-800 rounded-2xl p-6 mb-6 shadow-lg border border-slate-700">
            <Text className="text-white text-xl font-bold mb-4">Mensagens Recentes</Text>
            {driver.messages.slice(0, 3).map((msg, idx) => (
              <View key={idx} className="bg-slate-700 rounded-xl p-3 mb-2">
                <Text className="text-white">{msg.message}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};
