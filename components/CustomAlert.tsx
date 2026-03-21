import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
        alertBorder: 'border-[#00babc]/30',
        iconBg: 'bg-[#00babc]/10',
        iconBorder: 'border-[#00babc]/20',
        titleColor: 'text-[#00babc]',
        btnBg: 'bg-[#00babc]',
        btnShadow: 'shadow-[#00babc]/30',
        btnBorder: 'border-[#00babc]',
      };
    case 'error':
      return {
        icon: 'close-circle',
        iconColor: '#f87171',
        alertBorder: 'border-red-500/30',
        iconBg: 'bg-red-500/10',
        iconBorder: 'border-red-500/20',
        titleColor: 'text-red-400',
        btnBg: 'bg-red-500',
        btnShadow: 'shadow-red-500/30',
        btnBorder: 'border-red-500',
      };
    case 'warning':
      return {
        icon: 'warning',
        iconColor: '#fbbf24',
        alertBorder: 'border-amber-500/30',
        iconBg: 'bg-amber-500/10',
        iconBorder: 'border-amber-500/20',
        titleColor: 'text-amber-400',
        btnBg: 'bg-amber-500',
        btnShadow: 'shadow-amber-500/30',
        btnBorder: 'border-amber-500',
      };
    case 'info':
      return {
        icon: 'information-circle',
        iconColor: '#60a5fa',
        alertBorder: 'border-blue-500/30',
        iconBg: 'bg-blue-500/10',
        iconBorder: 'border-blue-500/20',
        titleColor: 'text-blue-400',
        btnBg: 'bg-blue-500',
        btnShadow: 'shadow-blue-500/30',
        btnBorder: 'border-blue-500',
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
      <View className="flex-1 bg-slate-900/80 justify-center items-center px-6">
        {/* Alert Container */}
        <View 
          className={`bg-slate-800 rounded-[28px] p-6 w-full max-w-sm border-2 ${config.alertBorder} shadow-2xl shadow-black/40`}
        >
          {/* Header com Ícone */}
          <View className="items-center mb-6">
            <View 
              className={`w-16 h-16 rounded-[20px] items-center justify-center mb-5 border-2 ${config.iconBg} ${config.iconBorder}`}
            >
              <Ionicons 
                name={config.icon as any} 
                size={34} 
                color={config.iconColor} 
              />
            </View>
            
            <Text 
              className={`text-[20px] font-bold text-center mb-2 tracking-wide ${config.titleColor}`}
            >
              {title}
            </Text>
            
            <Text className="text-slate-400 text-center text-[15px] leading-relaxed">
              {message}
            </Text>
          </View>

          {/* Botões */}
          <View className="mt-2">
            {/* Botão Primário */}
            <TouchableOpacity
              className={`rounded-2xl py-4 items-center justify-center shadow-md ${config.btnBg} ${config.btnShadow} ${secondaryButton ? 'mb-3' : ''}`}
              onPress={primaryButton.onPress}
              activeOpacity={0.85}
            >
              <Text className="text-white font-bold text-[16px] tracking-wide">
                {primaryButton.text}
              </Text>
            </TouchableOpacity>

            {/* Botão Secundário (opcional) */}
            {secondaryButton && (
              <TouchableOpacity
                className={`rounded-2xl py-4 items-center justify-center border-2 bg-transparent ${config.btnBorder}`}
                onPress={secondaryButton.onPress}
                activeOpacity={0.85}
              >
                <Text 
                  className={`font-bold text-[16px] tracking-wide ${config.titleColor}`}
                >
                  {secondaryButton.text}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Botão de Fechar Top-Right */}
          <TouchableOpacity
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-700/50 items-center justify-center"
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color="#94a3b8" />
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
