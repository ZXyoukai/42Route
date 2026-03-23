import { Redirect, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { LoginScreen } from '../components/LoginScreen';
import { getHomeRouteForUser, useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { user, refreshSession } = useAuth();

  const handleLogin = useCallback(
    async (_data: { name: string; email: string }) => {
      const nextUser = await refreshSession();
      if (nextUser) {
        router.replace(getHomeRouteForUser(nextUser) as any);
      }
    },
    [refreshSession, router]
  );

  if (user) {
    return <Redirect href={getHomeRouteForUser(user) as any} />;
  }

  return <LoginScreen onLogin={handleLogin} />;
}
