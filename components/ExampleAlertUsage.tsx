// Exemplo de como usar o CustomAlert em qualquer componente da aplicação

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useCustomAlert } from './CustomAlert';

export const ExampleUsage = () => {
  const { AlertComponent, showSuccess, showError, showWarning, showInfo } = useCustomAlert();

  const handleSuccessAlert = () => {
    showSuccess(
      'Operação Realizada!', 
      'A sua solicitação foi processada com sucesso.',
      () => {
        console.log('Alert de sucesso fechado');
      }
    );
  };

  const handleErrorAlert = () => {
    showError(
      'Erro na Conexão', 
      'Não foi possível conectar ao servidor. Verifique a sua conexão.',
      () => {
        console.log('Alert de erro fechado');
      }
    );
  };

  const handleWarningAlert = () => {
    showWarning(
      'Confirmação Necessária', 
      'Esta ação não pode ser desfeita. Deseja continuar?',
      () => {
        console.log('Usuário confirmou');
      },
      () => {
        console.log('Usuário cancelou');
      }
    );
  };

  const handleInfoAlert = () => {
    showInfo(
      'Nova Funcionalidade', 
      'Agora você pode acompanhar o autocarro em tempo real no mapa!',
      () => {
        console.log('Info alert fechado');
      }
    );
  };

  return (
    <View className="flex-1 justify-center items-center p-6 bg-slate-900">
      <Text className="text-white text-xl font-bold mb-8">Teste dos Alerts</Text>
      
      <TouchableOpacity 
        className="bg-green-600 p-4 rounded-xl mb-4 w-full"
        onPress={handleSuccessAlert}
      >
        <Text className="text-white text-center font-bold">Mostrar Alert de Sucesso</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        className="bg-red-600 p-4 rounded-xl mb-4 w-full"
        onPress={handleErrorAlert}
      >
        <Text className="text-white text-center font-bold">Mostrar Alert de Erro</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        className="bg-yellow-600 p-4 rounded-xl mb-4 w-full"
        onPress={handleWarningAlert}
      >
        <Text className="text-white text-center font-bold">Mostrar Alert de Aviso</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        className="bg-blue-600 p-4 rounded-xl mb-4 w-full"
        onPress={handleInfoAlert}
      >
        <Text className="text-white text-center font-bold">Mostrar Alert de Info</Text>
      </TouchableOpacity>

      {/* Componente de Alert */}
      {AlertComponent}
    </View>
  );
};
