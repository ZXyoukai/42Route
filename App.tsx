import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

// Componentes originais (para referência)
import { LoginScreen } from 'components/LoginScreen';
import { BottomTabBar } from 'components/BottomTabBar';

// Componentes integrados com API
import { TransportDashboardAPI } from 'components/TransportDashboardAPI';
import { RouteDetailAPI } from 'components/RouteDetailAPI';
import { StudentProfileAPI } from 'components/StudentProfileAPI';
import { DriverProfileAPI } from 'components/DriverProfileAPI';

import './global.css';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      const authValue = await AsyncStorage.getItem('authenticated');
      if (isMounted) {
        setIsAuthenticated(authValue === 'true');
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isAuthenticated === null) {
    return null;
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => {}} />;
  }

  return <>{children}</>;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);

  const handleLogin = async (data: { name: string; email: string }) => {
    const userDataString = await AsyncStorage.getItem('user');
    const parsedUser = userDataString ? JSON.parse(userDataString) : null;

    const nextUser: UserData = {
      id: parsedUser?.id ?? 0,
      name: parsedUser?.username ?? parsedUser?.name ?? data.name,
      email: parsedUser?.email ?? data.email,
      role: parsedUser?.role ?? 'cadete',
    };

    await AsyncStorage.setItem('authenticated', 'true');
    await AsyncStorage.setItem('user', JSON.stringify(nextUser));

    setUserData(nextUser);
    setCurrentScreen('dashboard');
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('authenticated');
    await AsyncStorage.removeItem('user');
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
      case 'dashboard' :
        return (
          <ProtectedRoute>
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
          </ProtectedRoute>
        );

      case 'routeDetail':
        if (selectedRouteId === null) {
          setCurrentScreen('dashboard');
          return null;
        }
        return (
          
          <ProtectedRoute>
          <RouteDetailAPI 
            routeId={selectedRouteId}
            onBack={() => setCurrentScreen('dashboard')}
          />
          </ProtectedRoute>
        );

      case 'profile':
        if (!userData) return null;
        
        // Renderiza perfil baseado no tipo de usuário
        if (userData.role === 'driver') {
          return (
            <ProtectedRoute>
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
            </ProtectedRoute>
          );
        } else if (userData.role === 'cadete') {
          return (
              <ProtectedRoute>
            <View className="flex-1">
              <StudentProfileAPI 
                onBack={() => setCurrentScreen('dashboard')}
                onLogout={handleLogout}
              />
              <BottomTabBar 
                activeTab="profile"
                onTabPress={handleTabPress}
              />
            </View>
            </ProtectedRoute>
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
