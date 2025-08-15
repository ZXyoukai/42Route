import React, { useState } from 'react';
import { View } from 'react-native';
import { LoginScreen } from 'components/LoginScreen';
import { TransportDashboard } from 'components/TransportDashboard';
import { RouteDetail } from 'components/RouteDetail';
import { StudentProfile } from 'components/StudentProfile';
import { TransportSchedule } from 'components/TransportSchedule';
import { MapScreen } from 'components/MapScreen';
import { DriverProfile } from 'components/DriverProfile';
import { BottomTabBar } from 'components/BottomTabBar';

import './global.css';

type Screen = 'login' | 'dashboard' | 'routeDetail' | 'profile' | 'schedule' | 'map' | 'driverProfile';

interface UserData {
  name: string;
  email: string;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);

  const handleLogin = (data: UserData) => {
    setUserData(data);
    setCurrentScreen('dashboard');
  };

  const handleTabPress = (tab: 'dashboard' | 'map' | 'schedule' | 'profile') => {
    setCurrentScreen(tab);
  };

  const renderScreen = () => {
    if (currentScreen === 'login') {
      return <LoginScreen onLogin={handleLogin} />;
    }

    switch (currentScreen) {
      case 'dashboard':
        return (
          <TransportDashboard 
            studentName={userData?.name || 'Estudante'}
            onRouteSelect={() => setCurrentScreen('routeDetail')}
            onProfileSelect={() => setCurrentScreen('profile')}
            onScheduleSelect={() => setCurrentScreen('schedule')}
          />
        );
      case 'routeDetail':
        return (
          <RouteDetail 
            routeId="RT001"
            routeName="Rota Central"
            onBack={() => setCurrentScreen('dashboard')}
          />
        );
      case 'profile':
        return (
          <StudentProfile 
            onBack={() => setCurrentScreen('dashboard')}
          />
        );
      case 'schedule':
        return (
          <TransportSchedule 
            onBack={() => setCurrentScreen('dashboard')}
          />
        );
      case 'map':
        return (
          <MapScreen />
        );
      case 'driverProfile':
        return (
          <DriverProfile 
            onBack={() => setCurrentScreen('routeDetail')}
          />
        );
      default:
        return <TransportDashboard studentName={userData?.name || 'Estudante'} />;
    }
  };

  const showBottomTab = userData && !['routeDetail', 'driverProfile'].includes(currentScreen);

  return (
    <View className="flex-1">
      <View className="flex-1">
        {renderScreen()}
      </View>
      {showBottomTab && (
        <BottomTabBar
          activeTab={(['dashboard', 'map', 'schedule', 'profile'].includes(currentScreen) ? currentScreen : 'dashboard') as 'dashboard' | 'map' | 'schedule' | 'profile'}
          onTabPress={handleTabPress}
        />
      )}
    </View>
  );
}
