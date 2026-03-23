import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { BottomTabBar } from '../../components/BottomTabBar';
import { TransportSchedule } from '../../components/TransportSchedule';
import { useAuth } from '../../contexts/AuthContext';

export default function SchedulePage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const role = user.role === 'driver' ? 'driver' : 'cadete';

  return (
    <View className="flex-1">
      <TransportSchedule onBack={() => router.replace('/(protected)/dashboard')} />
      <BottomTabBar activeTab="schedule" role={role} onLogout={role === 'driver' ? logout : undefined} />
    </View>
  );
}
