import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

export type TabName = 'dashboard' | 'map' | 'schedule' | 'profile';

interface BottomTabBarProps {
  activeTab: TabName;
  onTabPress: (tab: TabName) => void;
}

export const BottomTabBar = ({ activeTab, onTabPress }: BottomTabBarProps) => {
  const tabs = [
    {
      name: 'dashboard' as TabName,
      label: 'Início',
      icon: 'home',
      iconType: 'Ionicons' as const
    },
    {
      name: 'map' as TabName,
      label: 'Mapa',
      icon: 'map',
      iconType: 'Ionicons' as const
    },
    {
      name: 'schedule' as TabName,
      label: 'Horários',
      icon: 'schedule',
      iconType: 'MaterialIcons' as const
    },
    {
      name: 'profile' as TabName,
      label: 'Perfil',
      icon: 'person',
      iconType: 'Ionicons' as const
    }
  ];

  const renderIcon = (iconType: 'Ionicons' | 'MaterialIcons' | 'FontAwesome5', iconName: string, isActive: boolean) => {
    const color = isActive ? '#a855f7' : '#64748b';
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
              isActive ? 'bg-purple-900/30' : ''
            }`}
            onPress={() => onTabPress(tab.name)}
            activeOpacity={0.7}
          >
            <View className={`p-1 rounded-lg ${isActive ? 'bg-purple-600/20' : ''}`}>
              {renderIcon(tab.iconType, tab.icon, isActive)}
            </View>
            <Text className={`text-xs font-medium mt-1 ${
              isActive ? 'text-purple-400' : 'text-slate-400'
            }`}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
