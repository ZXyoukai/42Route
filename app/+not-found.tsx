import { Link, Stack } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Página não encontrada' }} />
      <View className="flex-1 items-center justify-center bg-slate-900 px-6">
        <Text className="text-white text-xl font-bold mb-2">Página não encontrada</Text>
        <Text className="text-slate-400 text-center mb-4">A rota solicitada não existe neste aplicativo.</Text>
        <Link href="/(protected)/dashboard" className="text-cyan-400 font-semibold">
          Voltar para o início
        </Link>
      </View>
    </>
  );
}
