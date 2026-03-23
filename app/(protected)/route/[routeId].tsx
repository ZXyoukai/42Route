import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { RouteDetailAPI } from '../../../components/RouteDetailAPI';
import { useAuth } from '../../../contexts/AuthContext';

export default function RouteDetailPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ routeId?: string }>();
  const { user } = useAuth();

  const parsedRouteId = Number(params.routeId);

  if (!user) {
    return null;
  }

  if (user.role !== 'cadete') {
    return <Redirect href="/(protected)/dashboard" />;
  }

  if (!Number.isFinite(parsedRouteId) || parsedRouteId <= 0) {
    return <Redirect href="/(protected)/dashboard" />;
  }

  return <RouteDetailAPI routeId={parsedRouteId} onBack={() => router.replace('/(protected)/dashboard')} />;
}
