import React, { useState } from 'react';
import { View } from 'react-native';

// Componentes originais (para referência)
import { LoginScreen } from 'components/LoginScreen';
import { TransportDashboard } from 'components/TransportDashboard';
import { RouteDetail } from 'components/RouteDetail';
import { DriverProfile } from 'components/DriverProfile';
import { BottomTabBar } from 'components/BottomTabBar';

// Componentes integrados com API
import { TransportDashboardAPI } from 'components/TransportDashboardAPI';
import { RouteDetailAPI } from 'components/RouteDetailAPI';
import { StudentProfileAPI } from 'components/StudentProfileAPI';
import { DriverProfileAPI } from 'components/DriverProfileAPI';

import './global.css';

type Screen = 
  | 'login' 
  | 'dashboard' 
  | 'routeDetail' 
  | 'profile' 
  | 'driverProfile'
  | 'map'
  | 'schedule';

interface UserData {
  id: number;
  name: string;
  email: string;
  role: 'cadete' | 'driver' | 'admin';
}

type TabName = 'dashboard' | 'map' | 'schedule' | 'profile';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);

  const handleLogin = (data: { name: string; email: string }) => {
    // Simulação: em produção, obter do backend
    const userData: UserData = {
      id: 1,
      name: data.name,
      email: data.email,
      role: 'cadete', // Definir baseado na resposta da API
    };
    setUserData(userData);
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setUserData(null);
    setSelectedRouteId(null);
    setCurrentScreen('login');
  };

  const handleTabPress = (tab: TabName) => {
    if (tab === 'dashboard' || tab === 'profile' || tab === 'map' || tab === 'schedule') {
      setCurrentScreen(tab);
    }
  };

  const renderScreen = () => {
    // Tela de Login
    if (currentScreen === 'login') {
      return <LoginScreen onLogin={handleLogin} />;
    }

    // Telas autenticadas
    switch (currentScreen) {
      case 'dashboard':
        return (
          <View className="flex-1">
            <TransportDashboardAPI 
              studentName={userData?.name || 'Estudante'}
              onRouteSelect={(route) => {
                setSelectedRouteId(route.id);
                setCurrentScreen('routeDetail');
              }}
            />
            <BottomTabBar 
              activeTab="dashboard"
              onTabPress={handleTabPress}
            />
          </View>
        );

      case 'routeDetail':
        if (selectedRouteId === null) {
          setCurrentScreen('dashboard');
          return null;
        }
        return (
          <RouteDetailAPI 
            routeId={selectedRouteId}
            onBack={() => setCurrentScreen('dashboard')}
          />
        );

      case 'profile':
        if (!userData) return null;
        
        // Renderiza perfil baseado no tipo de usuário
        if (userData.role === 'driver') {
          return (
            <View className="flex-1">
              <DriverProfileAPI 
                driverId={userData.id}
                onBack={() => setCurrentScreen('dashboard')}
              />
              <BottomTabBar 
                activeTab="profile"
                onTabPress={handleTabPress}
              />
            </View>
          );
        } else if (userData.role === 'cadete') {
          return (
            <View className="flex-1">
              <StudentProfileAPI 
                cadeteId={userData.id}
                onBack={() => setCurrentScreen('dashboard')}
                onLogout={handleLogout}
              />
              <BottomTabBar 
                activeTab="profile"
                onTabPress={handleTabPress}
              />
            </View>
          );
        }
        return null;

      default:
        return (
          <View className="flex-1">
            <TransportDashboardAPI 
              studentName={userData?.name || 'Estudante'}
              onRouteSelect={(route) => {
                setSelectedRouteId(route.id);
                setCurrentScreen('routeDetail');
              }}
            />
            <BottomTabBar 
              activeTab="dashboard"
              onTabPress={handleTabPress}
            />
          </View>
        );
    }
  };

  return (
    <View className="flex-1">
      {renderScreen()}
    </View>
  );
}
