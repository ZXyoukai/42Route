import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { BottomTabBar } from '../../components/BottomTabBar';
import { MapScreen } from '../../components/MapScreen';
import { useAuth } from '../../contexts/AuthContext';

export default function MapPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const role = user.role === 'driver' ? 'driver' : 'cadete';

  return (
    <View className="flex-1">
      <MapScreen
        studentName={user.name || 'Utilizador'}
        role={role}
        onBack={() => router.replace('/(protected)/dashboard')}
      />
      <BottomTabBar activeTab="map" role={role} onLogout={role === 'driver' ? logout : undefined} />
    </View>
  );
}
