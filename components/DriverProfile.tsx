import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

interface DriverProfileProps {
  onBack?: () => void;
}

export const DriverProfile = ({ onBack }: DriverProfileProps) => {
  const driverInfo = {
    name: 'António Mateus',
    id: 'MT001',
    license: 'C123456789',
    experience: '8 anos',
    rating: 4.8,
    totalTrips: 1247,
    route: 'Rota Central',
    phone: '+244 923 456 789',
    emergencyContact: '+244 912 345 678'
  };

  const todayStats = {
    trips: 6,
    passengers: 167,
    distance: '142 km',
    onTime: '94%'
  };

  const recentFeedback = [
    { rating: 5, comment: "Motorista muito profissional e pontual!", date: "14 Ago 2025" },
    { rating: 5, comment: "Condução suave e segura. Recomendo!", date: "13 Ago 2025" },
    { rating: 4, comment: "Bom serviço, sempre no horário.", date: "12 Ago 2025" }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Ionicons
        key={i}
        name={i < rating ? "star" : "star-outline"}
        size={14}
        color={i < rating ? "#f59e0b" : "#64748b"}
      />
    ));
  };

  return (
    <View className="flex-1 bg-slate-900">
      <StatusBar style="light" backgroundColor="#0f172a" />
      
      {/* Header */}
      <View className="bg-gradient-to-br from-purple-600 to-indigo-700 pt-12 pb-6 px-6">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={onBack} className="flex-row items-center">
            <Ionicons name="arrow-back" size={24} color="white" />
            <Text className="text-white text-lg font-medium ml-2">Voltar</Text>
          </TouchableOpacity>
          <Image
            source={require('../assets/route_logo-w.png')}
            className="h-10"
            resizeMode="contain"
          />
        </View>
        
        <View className="items-center">
          <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-4 shadow-lg">
            <FontAwesome5 name="user-tie" size={32} color="#7c3aed" />
          </View>
          <Text className="text-white text-2xl font-bold">{driverInfo.name}</Text>
          <Text className="text-purple-100 text-sm">Motorista Profissional • {driverInfo.id}</Text>
          <View className="flex-row items-center mt-2">
            {renderStars(Math.floor(driverInfo.rating))}
            <Text className="text-purple-100 text-sm ml-2">{driverInfo.rating} • {driverInfo.totalTrips} viagens</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Informações do Motorista */}
        <View className="bg-slate-800 rounded-2xl p-6 mb-6 shadow-lg border border-slate-700">
          <Text className="text-white text-xl font-bold mb-4">Informações do Motorista</Text>
          
          <View className="space-y-4">
            <View className="flex-row justify-between items-center p-3 bg-slate-700 rounded-xl">
              <View className="flex-row items-center">
                <FontAwesome5 name="id-card" size={16} color="#94a3b8" />
                <Text className="text-slate-300 font-medium ml-3">Carta de Condução:</Text>
              </View>
              <Text className="text-white font-bold">{driverInfo.license}</Text>
            </View>
            
            <View className="flex-row justify-between items-center p-3 bg-slate-700 rounded-xl">
              <View className="flex-row items-center">
                <MaterialIcons name="work" size={16} color="#94a3b8" />
                <Text className="text-slate-300 font-medium ml-3">Experiência:</Text>
              </View>
              <Text className="text-white font-bold">{driverInfo.experience}</Text>
            </View>
            
            <View className="flex-row justify-between items-center p-3 bg-purple-900/30 rounded-xl border border-purple-600">
              <View className="flex-row items-center">
                <FontAwesome5 name="route" size={16} color="#a855f7" />
                <Text className="text-slate-300 font-medium ml-3">Rota Atual:</Text>
              </View>
              <Text className="text-purple-400 font-bold">{driverInfo.route}</Text>
            </View>
            
            <View className="flex-row justify-between items-center p-3 bg-slate-700 rounded-xl">
              <View className="flex-row items-center">
                <MaterialIcons name="phone" size={16} color="#94a3b8" />
                <Text className="text-slate-300 font-medium ml-3">Telefone:</Text>
              </View>
              <Text className="text-white font-bold">{driverInfo.phone}</Text>
            </View>
          </View>
        </View>

        {/* Estatísticas de Hoje */}
        <View className="bg-slate-800 rounded-2xl p-6 mb-6 shadow-lg border border-slate-700">
          <Text className="text-white text-xl font-bold mb-4">Desempenho de Hoje</Text>
          
          <View className="flex-row justify-between mb-4">
            <View className="items-center flex-1">
              <View className="w-16 h-16 bg-emerald-900/50 rounded-2xl items-center justify-center mb-2 border border-emerald-700">
                <FontAwesome5 name="bus" size={18} color="#10b981" />
              </View>
              <Text className="text-2xl font-bold text-emerald-400">{todayStats.trips}</Text>
              <Text className="text-slate-400 text-sm font-medium">Viagens</Text>
            </View>
            <View className="items-center flex-1">
              <View className="w-16 h-16 bg-blue-900/50 rounded-2xl items-center justify-center mb-2 border border-blue-700">
                <MaterialIcons name="people" size={20} color="#3b82f6" />
              </View>
              <Text className="text-2xl font-bold text-blue-400">{todayStats.passengers}</Text>
              <Text className="text-slate-400 text-sm font-medium">Passageiros</Text>
            </View>
            <View className="items-center flex-1">
              <View className="w-16 h-16 bg-purple-900/50 rounded-2xl items-center justify-center mb-2 border border-purple-700">
                <FontAwesome5 name="road" size={16} color="#a855f7" />
              </View>
              <Text className="text-2xl font-bold text-purple-400">{todayStats.distance}</Text>
              <Text className="text-slate-400 text-sm font-medium">Distância</Text>
            </View>
            <View className="items-center flex-1">
              <View className="w-16 h-16 bg-amber-900/50 rounded-2xl items-center justify-center mb-2 border border-amber-700">
                <MaterialIcons name="schedule" size={20} color="#f59e0b" />
              </View>
              <Text className="text-2xl font-bold text-amber-400">{todayStats.onTime}</Text>
              <Text className="text-slate-400 text-sm font-medium">Pontualidade</Text>
            </View>
          </View>
        </View>

        {/* Avaliações Recentes */}
        <View className="bg-slate-800 rounded-2xl p-6 mb-6 shadow-lg border border-slate-700">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white text-xl font-bold">Avaliações Recentes</Text>
            <View className="flex-row items-center">
              <Ionicons name="star" size={16} color="#f59e0b" />
              <Text className="text-amber-400 font-bold ml-1">{driverInfo.rating}</Text>
            </View>
          </View>
          
          {recentFeedback.map((feedback, index) => (
            <View key={index} className="bg-slate-700 rounded-xl p-4 mb-3 last:mb-0">
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-row">
                  {renderStars(feedback.rating)}
                </View>
                <Text className="text-slate-400 text-xs">{feedback.date}</Text>
              </View>
              <Text className="text-slate-300 text-sm">{feedback.comment}</Text>
            </View>
          ))}
        </View>

        {/* Ações */}
        <View className="flex-row justify-between mb-6">
          <TouchableOpacity className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl p-4 flex-1 mr-3 items-center shadow-lg">
            <View className="flex-row items-center">
              <MaterialIcons name="phone" size={20} color="white" />
              <Text className="text-white font-bold text-sm ml-2">Contactar</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-4 flex-1 ml-3 items-center shadow-lg">
            <View className="flex-row items-center">
              <MaterialIcons name="feedback" size={20} color="white" />
              <Text className="text-white font-bold text-sm ml-2">Avaliar</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};
