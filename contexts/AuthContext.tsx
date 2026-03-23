import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { tripStateService } from '../services/tripStateService';
import { Cadete, MiniBusStop } from '../types/api';

type UserRole = 'cadete' | 'driver' | 'admin';

export interface UserData {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  full_name?: string | null;
  username?: string | null;
  city?: string | null;
  distrit?: string | null;
  phone?: number | null;
  stop_id: number | null;
  stop?: MiniBusStop | null;
  avatar?: {
    link: string;
  };
  course?: string;
  level?: number;
  grade?: string;
  isDBUser?: boolean;
}

interface AuthContextValue {
  user: UserData | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshSession: () => Promise<UserData | null>;
  logout: () => Promise<void>;
  updateCadeteFromOnboarding: (updated: Cadete) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function toUserData(raw: any, role: UserRole): UserData {
  return {
    id: raw?.id ?? 0,
    name: raw?.username ?? raw?.full_name ?? 'Utilizador',
    email: raw?.email ?? '',
    role,
    stop_id: raw?.stop_id ?? null,
    full_name: raw?.full_name ?? null,
    username: raw?.username ?? raw?.full_name ?? null,
    city: raw?.city ?? null,
    distrit: raw?.distrit ?? null,
    phone: raw?.phone ?? null,
    stop: raw?.stop ?? null,
    avatar: raw?.avatar ?? { link: '' },
    course: raw?.course ?? '',
    level: raw?.level ?? 0,
    grade: raw?.grade ?? '',
    isDBUser: raw?.isDBUser ?? false,
  };
}

export function needsCadeteOnboarding(user: UserData): boolean {
  if (user.role !== 'cadete') return false;

  return !user.isDBUser || !user.stop || !user.course || !user.grade || !user.level;
}

export function getHomeRouteForUser(user: UserData): string {
  if (user.role === 'driver') {
    return '/(protected)/dashboard';
  }

  return needsCadeteOnboarding(user) ? '/(protected)/cadete-onboarding' : '/(protected)/dashboard';
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async (): Promise<UserData | null> => {
    try {
      const [authValue, userDataString, driverDataString, savedRole] = await Promise.all([
        AsyncStorage.getItem('authenticated'),
        AsyncStorage.getItem('user'),
        AsyncStorage.getItem('driver_user'),
        AsyncStorage.getItem('user_role'),
      ]);

      if (authValue !== 'true') {
        setUser(null);
        return null;
      }

      const isDriver = savedRole ? savedRole === 'driver' : !!driverDataString;
      const parsedUser = isDriver
        ? driverDataString
          ? JSON.parse(driverDataString)
          : null
        : userDataString
          ? JSON.parse(userDataString)
          : null;

      if (!parsedUser) {
        setUser(null);
        return null;
      }

      const nextUser = toUserData(parsedUser, isDriver ? 'driver' : 'cadete');
      setUser(nextUser);
      return nextUser;
    } catch (err) {
      console.warn('Erro ao carregar sessao:', err);
      setUser(null);
      return null;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove(['authenticated', 'user', 'driver_user', 'user_role', 'token']);
    } catch (err) {
      console.warn('Erro ao limpar sessao no logout:', err);
    }

    tripStateService.reset();
    setUser(null);
  }, []);

  const updateCadeteFromOnboarding = useCallback(async (updated: Cadete) => {
    const normalized: UserData = {
      id: updated.id,
      name: updated.full_name ?? updated.username ?? 'Cadete',
      email: updated.email ?? '',
      role: 'cadete',
      full_name: updated.full_name,
      username: updated.username,
      city: updated.city,
      distrit: updated.distrit,
      phone: updated.phone,
      stop: updated.stop,
      stop_id: updated.stop_id,
      avatar: updated.avatar ?? { link: '' },
      course: updated.course,
      level: updated.level,
      grade: updated.grade,
      isDBUser: updated.isDBUser,
    };

    setUser(normalized);
    await AsyncStorage.multiSet([
      ['authenticated', 'true'],
      ['user_role', 'cadete'],
      ['user', JSON.stringify(updated)],
    ]);
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      await refreshSession();
      if (mounted) {
        setLoading(false);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [refreshSession]);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      refreshSession,
      logout,
      updateCadeteFromOnboarding,
    }),
    [loading, logout, refreshSession, updateCadeteFromOnboarding, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return ctx;
}
