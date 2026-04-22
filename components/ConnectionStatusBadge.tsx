import React, { useEffect, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { socketService } from '../services/socketService';

interface ConnectionStatusBadgeProps {
  showLabel?: boolean;
}

export const ConnectionStatusBadge = ({ showLabel = false }: ConnectionStatusBadgeProps) => {
  const [isConnected, setIsConnected] = useState(socketService.isConnected());
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Listen to connection changes
    const handleConnectionChange = (connected: boolean) => {
      console.log(`[ConnectionStatusBadge] Connection status: ${connected}`);
      setIsConnected(connected);
    };

    socketService.onConnectionChange(handleConnectionChange);

    return () => {
      socketService.offConnectionChange(handleConnectionChange);
    };
  }, []);

  // Pulsing animation for disconnected state
  useEffect(() => {
    if (!isConnected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isConnected, pulseAnim]);

  return (
    <Animated.View
      style={{
        transform: [{ scale: pulseAnim }],
      }}
      className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border ${
        isConnected
          ? 'bg-emerald-500/10 border-emerald-500/30'
          : 'bg-red-500/10 border-red-500/30'
      }`}
    >
      <View
        className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-emerald-500' : 'bg-red-500'
        }`}
      />
      {showLabel && (
        <Text
          className={`text-xs font-medium ${
            isConnected ? 'text-emerald-400' : 'text-red-400'
          }`}
        >
          {isConnected ? 'Online' : 'Offline'}
        </Text>
      )}
    </Animated.View>
  );
};

// Alternative: Full status bar component
interface ConnectionStatusBarProps {
  position?: 'top' | 'bottom';
}

export const ConnectionStatusBar = ({ position = 'top' }: ConnectionStatusBarProps) => {
  const [isConnected, setIsConnected] = useState(socketService.isConnected());
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  useEffect(() => {
    const handleConnectionChange = (connected: boolean) => {
      setIsConnected(connected);
      if (!connected) {
        setReconnectAttempts(0);
      }
    };

    socketService.onConnectionChange(handleConnectionChange);

    return () => {
      socketService.offConnectionChange(handleConnectionChange);
    };
  }, []);

  if (isConnected) {
    return null; // Hide when connected
  }

  return (
    <View
      className={`bg-red-600 px-4 py-2.5 flex-row items-center justify-center gap-2 ${
        position === 'top' ? 'absolute top-0 left-0 right-0 z-50' : 'absolute bottom-0 left-0 right-0'
      }`}
    >
      <Ionicons name="warning-outline" size={16} color="white" />
      <Text className="text-white text-sm font-medium">
        Sem conexão. Reconectando...
      </Text>
    </View>
  );
};
