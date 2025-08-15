import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface CustomAlertProps {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
  primaryButton: {
    text: string;
    onPress: () => void;
  };
  secondaryButton?: {
    text: string;
    onPress: () => void;
  };
  onClose: () => void;
}

const getAlertConfig = (type: AlertType) => {
  switch (type) {
    case 'success':
      return {
        icon: 'checkmark-circle',
        iconColor: '#00babc',
        titleColor: '#00babc',
        borderColor: '#00babc',
        backgroundColor: 'rgba(0, 186, 188, 0.1)',
      };
    case 'error':
      return {
        icon: 'close-circle',
        iconColor: '#ef4444',
        titleColor: '#ef4444',
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
      };
    case 'warning':
      return {
        icon: 'warning',
        iconColor: '#f59e0b',
        titleColor: '#f59e0b',
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
      };
    case 'info':
      return {
        icon: 'information-circle',
        iconColor: '#3b82f6',
        titleColor: '#3b82f6',
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
      };
  }
};

export const CustomAlert = ({
  visible,
  type,
  title,
  message,
  primaryButton,
  secondaryButton,
  onClose,
}: CustomAlertProps) => {
  const config = getAlertConfig(type);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        {/* Alert Container */}
        <View 
          className="bg-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl border"
          style={{ 
            borderColor: config.borderColor,
            backgroundColor: '#1e293b',
          }}
        >
          {/* Header com Ícone */}
          <View className="items-center mb-6">
            <View 
              className="w-16 h-16 rounded-full items-center justify-center mb-4"
              style={{ 
                backgroundColor: config.backgroundColor,
                borderWidth: 2,
                borderColor: config.borderColor,
              }}
            >
              <Ionicons 
                name={config.icon as any} 
                size={32} 
                color={config.iconColor} 
              />
            </View>
            
            <Text 
              className="text-xl font-bold text-center mb-2"
              style={{ color: config.titleColor }}
            >
              {title}
            </Text>
            
            <Text className="text-slate-300 text-center text-base leading-relaxed">
              {message}
            </Text>
          </View>

          {/* Botões */}
          <View className="space-y-3">
            {/* Botão Primário */}
            <TouchableOpacity
              className="rounded-2xl py-4 px-6 items-center shadow-lg"
              style={{
                backgroundColor: config.iconColor,
                shadowColor: config.iconColor,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
              onPress={primaryButton.onPress}
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-lg">
                {primaryButton.text}
              </Text>
            </TouchableOpacity>

            {/* Botão Secundário (opcional) */}
            {secondaryButton && (
              <TouchableOpacity
                className="rounded-2xl py-4 px-6 items-center border-2"
                style={{
                  borderColor: config.borderColor,
                  backgroundColor: 'transparent',
                }}
                onPress={secondaryButton.onPress}
                activeOpacity={0.7}
              >
                <Text 
                  className="font-bold text-lg"
                  style={{ color: config.iconColor }}
                >
                  {secondaryButton.text}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Botão de Fechar */}
          <TouchableOpacity
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-700 items-center justify-center"
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={16} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Hook personalizado para facilitar o uso
export const useCustomAlert = () => {
  const [alertConfig, setAlertConfig] = React.useState<{
    visible: boolean;
    type: AlertType;
    title: string;
    message: string;
    primaryButton: { text: string; onPress: () => void };
    secondaryButton?: { text: string; onPress: () => void };
  }>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    primaryButton: { text: 'OK', onPress: () => {} },
  });

  const showAlert = (config: Omit<typeof alertConfig, 'visible'>) => {
    setAlertConfig({ ...config, visible: true });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  const showSuccess = (title: string, message: string, onConfirm?: () => void) => {
    showAlert({
      type: 'success',
      title,
      message,
      primaryButton: {
        text: 'Perfeito!',
        onPress: () => {
          hideAlert();
          onConfirm?.();
        }
      }
    });
  };

  const showError = (title: string, message: string, onConfirm?: () => void) => {
    showAlert({
      type: 'error',
      title,
      message,
      primaryButton: {
        text: 'Entendi',
        onPress: () => {
          hideAlert();
          onConfirm?.();
        }
      }
    });
  };

  const showWarning = (title: string, message: string, onConfirm?: () => void, onCancel?: () => void) => {
    showAlert({
      type: 'warning',
      title,
      message,
      primaryButton: {
        text: 'Continuar',
        onPress: () => {
          hideAlert();
          onConfirm?.();
        }
      },
      secondaryButton: onCancel ? {
        text: 'Cancelar',
        onPress: () => {
          hideAlert();
          onCancel();
        }
      } : undefined
    });
  };

  const showInfo = (title: string, message: string, onConfirm?: () => void) => {
    showAlert({
      type: 'info',
      title,
      message,
      primaryButton: {
        text: 'OK',
        onPress: () => {
          hideAlert();
          onConfirm?.();
        }
      }
    });
  };

  return {
    AlertComponent: (
      <CustomAlert
        {...alertConfig}
        onClose={hideAlert}
      />
    ),
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideAlert,
  };
};
