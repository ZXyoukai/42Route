import { Redirect, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { CadeteOnboarding } from '../../components/CadeteOnboarding';
import { useAuth } from '../../contexts/AuthContext';
import { Cadete } from '../../types/api';

export default function CadeteOnboardingPage() {
  const router = useRouter();
  const { user, updateCadeteFromOnboarding } = useAuth();

  const initialUser = useMemo<Cadete | null>(() => {
    if (!user || user.role !== 'cadete') return null;

    return {
      id: user.id,
      full_name: user.full_name ?? user.name ?? null,
      username: user.username ?? user.name ?? null,
      email: user.email ?? null,
      city: user.city ?? null,
      distrit: user.distrit ?? null,
      phone: user.phone ?? null,
      stop: user.stop ?? null,
      stop_id: user.stop_id ?? null,
      avatar: user.avatar ?? { link: '' },
      course: user.course ?? '',
      level: user.level ?? 0,
      grade: user.grade ?? '',
      isDBUser: user.isDBUser ?? false,
    };
  }, [user]);

  if (!user) {
    return null;
  }

  if (user.role !== 'cadete' || !initialUser) {
    return <Redirect href="/(protected)/dashboard" />;
  }

  return (
    <CadeteOnboarding
      initialUser={initialUser}
      onComplete={async (updatedUser) => {
        await updateCadeteFromOnboarding(updatedUser);
        router.replace('/(protected)/dashboard');
      }}
    />
  );
}
