import { Redirect, useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { BottomTabBar } from '../../components/BottomTabBar';
import { StudentProfileAPI } from '../../components/StudentProfileAPI';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  if (user.role === 'driver') {
    return <Redirect href="/(protected)/dashboard" />;
  }

  return (
    <View className="flex-1">
      <StudentProfileAPI
        onBack={() => router.replace('/(protected)/dashboard')}
        onLogout={async () => {
          await logout();
          router.replace('/login');
        }}
      />
      <BottomTabBar activeTab="profile" role="cadete" />
    </View>
  );
}
