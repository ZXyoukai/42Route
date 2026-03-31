import React from 'react';
import { View, TouchableOpacity, Text, Alert } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export type TabName = 'dashboard' | 'map' | 'schedule' | 'profile';

interface BottomTabBarProps {
  activeTab: TabName;
  onTabPress?: (tab: TabName) => void;
  role?: 'driver' | 'cadete';
  onLogout?: () => void;
}

export const BottomTabBar = ({ activeTab, onTabPress, role, onLogout }: BottomTabBarProps) => {
  const router = useRouter();
  const isDriver = role === 'driver';

  const navigateByTab = (tab: TabName) => {
    if (tab === activeTab) {
      return;
    }

    if (onTabPress) {
      onTabPress(tab);
      return;
    }

    switch (tab) {
      case 'dashboard':
        router.replace('/(protected)/dashboard');
        break;
      case 'map':
        router.replace('/(protected)/map');
        break;
      case 'schedule':
        router.replace('/(protected)/schedule');
        break;
      case 'profile':
        router.replace('/(protected)/profile');
        break;
      default:
        router.replace('/(protected)/dashboard');
    }
  };

  const tabs = [
    {
      name: 'dashboard' as TabName,
      label: 'Início',
      icon: 'home',
      iconType: 'Ionicons' as const,
    },
    {
      name: 'map' as TabName,
      label: 'Mapa',
      icon: 'map',
      iconType: 'Ionicons' as const,
    },
    {
      name: 'schedule' as TabName,
      label: 'Horários',
      icon: 'schedule',
      iconType: 'MaterialIcons' as const,
    },
    ...(!isDriver
      ? [
          {
            name: 'profile' as TabName,
            label: 'Perfil',
            icon: 'person',
            iconType: 'Ionicons' as const,
          },
        ]
      : []),
  ];

  const renderIcon = (iconType: 'Ionicons' | 'MaterialIcons' | 'FontAwesome5', iconName: string, isActive: boolean) => {
    const color = isActive ? '#00babc' : '#64748b';
    const size = 22;

    switch (iconType) {
      case 'Ionicons':
        return <Ionicons name={iconName as any} size={size} color={color} />;
      case 'MaterialIcons':
        return <MaterialIcons name={iconName as any} size={size} color={color} />;
      case 'FontAwesome5':
        return <FontAwesome5 name={iconName as any} size={size} color={color} />;
      default:
        return <Ionicons name={iconName as any} size={size} color={color} />;
    }
  };

  return (
    <View className="bg-slate-800 border-t border-slate-700 px-2 py-2 flex-row justify-between items-center">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.name;
        return (
          <TouchableOpacity
            key={tab.name}
            className={`flex-1 items-center py-2 px-1 rounded-xl mx-1 ${
              isActive ? '' : ''
            }`}
            onPress={() => navigateByTab(tab.name)}
            activeOpacity={0.7}
          >
            <View
              className={`absolute h-1 w-full rounded-xl ${isActive ? 'bg-[#00babc]' : ''}`}
              style={{ top: -8 }}
            />
            <View className="rounded-lg p-1">
              {renderIcon(tab.iconType, tab.icon, isActive)}
            </View>
            <Text
              className={`mt-1 text-xs font-medium ${isActive ? 'text-cyan-400' : 'text-slate-400'}`}
              style={isActive ? { color: '#00babc' } : {}}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}

      {isDriver && onLogout && (
        <TouchableOpacity
          className="flex-1 items-center py-2 px-1 rounded-xl mx-1"
          onPress={() =>
            Alert.alert(
              'Terminar Sessão',
              'Tens a certeza que queres sair?',
              [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Sair', style: 'destructive', onPress: onLogout },
              ]
            )
          }
          activeOpacity={0.7}
        >
          <View className="p-1 rounded-lg">
            <Ionicons name="log-out-outline" size={22} color="#ef4444" />
          </View>
          <Text className="text-xs font-medium mt-1" style={{ color: '#ef4444' }}>
            Sair
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
