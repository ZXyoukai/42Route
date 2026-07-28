import { Redirect, useRouter } from 'expo-router';
import React from 'react';
import { AttendanceScanner } from '../../components/AttendanceScanner';
import { useAuth } from '../../contexts/AuthContext';

export default function AttendanceScanPage() {
  const router = useRouter();
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  if (user.role === 'driver') {
    return <Redirect href="/(protected)/dashboard" />;
  }

  return <AttendanceScanner onBack={() => router.replace('/(protected)/dashboard')} />;
}
