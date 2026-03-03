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
import { DriverDashboard } from 'components/DriverDashboard';
import { MapScreen } from 'components/MapScreen';
import { TransportSchedule } from 'components/TransportSchedule';
import { CadeteOnboarding } from 'components/CadeteOnboarding';
import { Cadete, MiniBusStop } from 'types/api';

import './global.css';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Screen = 
  | 'login' 
  | 'dashboard' 
  | 'routeDetail' 
  | 'profile' 
  | 'driverProfile'
  | 'map'
  | 'schedule'
  | 'cadeteOnboarding';

interface UserData {
  id: number;
  name: string;
  email: string;
  role: 'cadete' | 'driver' | 'admin';
  full_name?: string | null;
  username?: string | null;
  city?: string | null;
  distrit?: string | null;
  phone?: number | null;
  stop?: MiniBusStop | null;
  avatar?: {
    link: string;
  };
  course?: string;
  level?: number;
  grade?: string;
  isDBUser?: boolean;
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
    try {
    // Detecta o tipo de utilizador pelo papel guardado no login
    const [userDataString, driverDataString, savedRole] = await Promise.all([
      AsyncStorage.getItem('user'),
      AsyncStorage.getItem('driver_user'),
      AsyncStorage.getItem('user_role'),
    ]);

    const isDriver = savedRole === 'driver' || !!driverDataString;
    const parsedUser = isDriver
      ? (driverDataString ? JSON.parse(driverDataString) : null)
      : (userDataString ? JSON.parse(userDataString) : null);

    const role: 'driver' | 'cadete' = isDriver ? 'driver' : 'cadete';

    const nextUser: UserData = {
      id: parsedUser?.id ?? 0,
      name: parsedUser?.username ?? parsedUser?.full_name ?? data.name,
      email: parsedUser?.email ?? data.email,
      role,
      full_name: parsedUser?.full_name ?? null,
      username: parsedUser?.username ?? parsedUser?.full_name ?? data.name,
      city: parsedUser?.city ?? null,
      distrit: parsedUser?.distrit ?? null,
      phone: parsedUser?.phone ?? null,
      stop: parsedUser?.stop ?? null,
      avatar: parsedUser?.avatar ?? { link: '' },
      course: parsedUser?.course ?? '',
      level: parsedUser?.level ?? 0,
      grade: parsedUser?.grade ?? '',
      isDBUser: parsedUser?.isDBUser ?? false,
    };

    await AsyncStorage.setItem('authenticated', 'true');

    setUserData(nextUser);

    if (role === 'driver') {
      // Motorista vai direto para o dashboard do motorista
      setCurrentScreen('dashboard');
    } else {
      // Cadete pode precisar de onboarding
      const shouldGoToOnboarding =
        !nextUser.isDBUser || !nextUser.stop || !nextUser.course || !nextUser.grade || !nextUser.level;
      setCurrentScreen(shouldGoToOnboarding ? 'cadeteOnboarding' : 'dashboard');
    }
    } catch (e: any) {
      console.error('Erro em handleLogin:', e?.message ?? e);
      // Re-throw so LoginScreen's catch block can handle it and clear the spinner
      throw e;
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove([
        'authenticated',
        'user',
        'driver_user',
        'user_role',
        'token',
      ]);
    } catch (err) {
      console.warn('Erro ao limpar AsyncStorage no logout:', err);
    }
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
        if (userData?.role === 'driver') {
          return (
            <ProtectedRoute>
              <View className="flex-1">
                <DriverDashboard
                  driverId={userData.id}
                  driverName={userData.name}
                />
                <BottomTabBar
                  activeTab="dashboard"
                  onTabPress={handleTabPress}
                  role="driver"
                  onLogout={handleLogout}
                />
              </View>
            </ProtectedRoute>
          );
        }
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

        // Motoristas não têm tab de perfil — redireciona
        if (userData.role === 'driver') {
          setCurrentScreen('dashboard');
          return null;
        }

        if (userData.role === 'cadete') {
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

      case 'map':
        return (
          <ProtectedRoute>
            <View className="flex-1">
              <MapScreen
                studentName={userData?.name || 'Utilizador'}
                role={userData?.role === 'driver' ? 'driver' : 'cadete'}
              />
              <BottomTabBar
                activeTab="map"
                onTabPress={handleTabPress}
                role={userData?.role === 'driver' ? 'driver' : 'cadete'}
                onLogout={userData?.role === 'driver' ? handleLogout : undefined}
              />
            </View>
          </ProtectedRoute>
        );

      case 'schedule':
        return (
          <ProtectedRoute>
            <View className="flex-1">
              <TransportSchedule />
              <BottomTabBar
                activeTab="schedule"
                onTabPress={handleTabPress}
                role={userData?.role === 'driver' ? 'driver' : 'cadete'}
                onLogout={userData?.role === 'driver' ? handleLogout : undefined}
              />
            </View>
          </ProtectedRoute>
        );

      case 'cadeteOnboarding': {
        if (!userData) return null;
        const onboardingCadete: Cadete = {
          id: userData.id,
          full_name: userData.full_name ?? userData.name ?? null,
          username: userData.username ?? userData.name ?? null,
          email: userData.email ?? null,
          city: userData.city ?? null,
          distrit: userData.distrit ?? null,
          phone: userData.phone ?? null,
          stop: userData.stop ?? null,
          avatar: userData.avatar ?? { link: '' },
          course: userData.course ?? '',
          level: userData.level ?? 0,
          grade: userData.grade ?? '',
          isDBUser: userData.isDBUser ?? false,
        };
        return (
          <ProtectedRoute>
            <CadeteOnboarding
              initialUser={onboardingCadete}
              onComplete={(updatedUser) => {
                const normalizedUser: UserData = {
                  id: updatedUser.id,
                  name: updatedUser.full_name ?? updatedUser.username ?? 'Cadete',
                  email: updatedUser.email ?? '',
                  role: 'cadete',
                  full_name: updatedUser.full_name,
                  username: updatedUser.username,
                  city: updatedUser.city,
                  distrit: updatedUser.distrit,
                  phone: updatedUser.phone,
                  stop: updatedUser.stop,
                  avatar: updatedUser.avatar,
                  course: updatedUser.course,
                  level: updatedUser.level,
                  grade: updatedUser.grade,
                  isDBUser: updatedUser.isDBUser,
                };
                setUserData(normalizedUser);
                setCurrentScreen('dashboard');
              }}
            />
          </ProtectedRoute>
        );
      }

      default:
        // Fallback - respeita o papel do utilizador
        if (userData?.role === 'driver') {
          return (
            <View className="flex-1">
              <DriverDashboard
                driverId={userData.id}
                driverName={userData.name}
              />
              <BottomTabBar
                activeTab="dashboard"
                onTabPress={handleTabPress}
              />
            </View>
          );
        }
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
