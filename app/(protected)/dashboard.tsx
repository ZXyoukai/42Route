import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { BottomTabBar } from '../../components/BottomTabBar';
import { DriverDashboard } from '../../components/DriverDashboard';
import { TransportDashboardAPI } from '../../components/TransportDashboardAPI';
import { useAuth } from '../../contexts/AuthContext';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  if (user.role === 'driver') {
    return (
      <View className="flex-1">
        <DriverDashboard driverId={user.id} driverName={user.name} />
        <BottomTabBar activeTab="dashboard" role="driver" onLogout={logout} />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <TransportDashboardAPI
        studentName={user.name || 'Estudante'}
        onRouteSelect={(route) => {
          router.push(`/(protected)/route/${route.id}` as any);
        }}
        onMarkAttendance={() => {
          router.push('/(protected)/attendance-scan' as any);
        }}
      />
      <BottomTabBar activeTab="dashboard" role="cadete" />
    </View>
  );
}
