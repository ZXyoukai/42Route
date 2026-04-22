import { Redirect, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { LoginScreen } from '../components/LoginScreen';
import { getHomeRouteForUser, useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginPage() {
  const router = useRouter();
  const { user, refreshSession } = useAuth();

  const handleLogin = useCallback(
    async (_data: { name: string; email: string }) => {
      // Tentar múltiplas vezes em caso de race condition
      let nextUser = null;
      let retries = 0;
      const maxRetries = 5;
      
      while (!nextUser && retries < maxRetries) {
        nextUser = await refreshSession();
        if (!nextUser) {
          // Aguardar um pouco antes de tentar novamente
          await new Promise(resolve => setTimeout(resolve, 200));
          retries++;
        }
      }
      
      if (nextUser) {
        const homeRoute = getHomeRouteForUser(nextUser);
        console.log('[LOGIN] Redirecionando para:', homeRoute, 'User role:', nextUser.role);
        router.replace(homeRoute as any);
      } else {
        console.error('[LOGIN] Falha ao carregar dados de utilizador após login');
        // Fazer logout se não conseguir carregar dados
        await AsyncStorage.multiRemove(['authenticated', 'user', 'driver_user', 'user_role', 'token']);
      }
    },
    [refreshSession, router]
  );

  if (user) {
    return <Redirect href={getHomeRouteForUser(user) as any} />;
  }

  return <LoginScreen onLogin={handleLogin} />;
}
