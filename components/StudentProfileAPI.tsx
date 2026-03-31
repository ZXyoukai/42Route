import React, { useEffect, useState } from 'react';
import { Image, Text, View, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useCustomAlert } from './CustomAlert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Cadete } from 'types/api';

interface StudentProfileProps {
  onBack?: () => void;
  onLogout?: () => void;
}

export const StudentProfileAPI = ({ onBack, onLogout }: StudentProfileProps) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [autoAlerts, setAutoAlerts] = useState(false);
  const [userData, setUserData] = useState<Cadete | null>(null);
  const { AlertComponent, showSuccess, showError, showWarning, showInfo } = useCustomAlert();

  useEffect(() => {
    let isMounted = true;

    const loadUserData = async () => {
      const data = await AsyncStorage.getItem('user');
      const parsedData = data ? JSON.parse(data) as Cadete : null;
      console.log('Loaded user data:', parsedData);

      if (isMounted) {
        setUserData(parsedData);
      }
    };

    loadUserData();

    return () => {
      isMounted = false;
    };
  }, []);

  const name = (userData ? (userData.full_name || userData.username) : null) ?? '42routeStudent';
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase() ?? '')
    .join('');

  const studentInfo = {
    name,
    initials,
    studentId: userData ? String(userData.id) : '42LUANDA1234',
    username: userData?.username || userData?.full_name || 'cadete42',
    email: userData ? userData.email : 'joao.silva@student.42luanda.ao',
    phone: userData?.phone ? String(userData.phone) : '+244 000 000 000',
    course: userData?.course || 'Common Core',
    level: userData?.level ?? 0,
    grade: userData?.grade || 'N/D',
    city: userData?.city || 'N/D',
    distrit: userData?.distrit || 'N/D',
    selectedStop: userData?.stop?.stop_name || 'Sem paragem definida',
    preferredRoute: userData?.stop?.route?.route_name || 'Rota Central',
    isComplete: !!userData?.isDBUser,
  };

  const handleNotificationChange = (value: boolean) => {
    setNotificationsEnabled(value);
    if (value) {
      showSuccess(
        'Notificações Ativadas',
        'Agora receberá alertas sobre os seus autocarros e horários.'
      );
    } else {
      showWarning(
        'Desativar Notificações',
        'Não receberá mais alertas sobre os autocarros. Pode perder informações importantes.',
        () => {
          showInfo('Notificações Desativadas', 'Pode reativar nas configurações a qualquer momento.');
        },
        () => {
          setNotificationsEnabled(true);
        }
      );
    }
  };

  const handleLocationChange = (value: boolean) => {
    setLocationEnabled(value);
    if (value) {
      showSuccess(
        'Localização Ativada',
        'Agora pode usar funcionalidades baseadas em localização.'
      );
    } else {
      showError(
        'Localização Desativada',
        'Algumas funcionalidades podem não funcionar corretamente sem acesso à localização.'
      );
    }
  };

  const handleRouteChange = () => {
    showInfo(
      'Alterar Rota Preferida',
      'Esta funcionalidade estará disponível em breve. Poderá escolher a sua rota preferida.'
    );
  };

  const handleScheduleCustom = () => {
    showInfo(
      'Horários Personalizados',
      'Em breve poderá criar horários personalizados com alertas específicos.'
    );
  };

  const handleAchievements = () => {
    showSuccess(
      'Conquistas Desbloqueadas!',
      'Você tem 3 badges: Utilizador Frequente, Pontual e Eco-Friendly!'
    );
  };

  const handleSupport = () => {
    showWarning(
      'Contactar Suporte',
      'Será redirecionado para o canal de suporte. Pretende continuar?',
      () => {
        showSuccess('Suporte Contactado', 'Em breve receberá ajuda da nossa equipa.');
      }
    );
  };

  const handleEditProfile = () => {
    showInfo(
      'Editar perfil',
      'A edição direta de perfil estará disponível em breve.'
    );
  };

  const handleAccessCode = () => {
    showInfo(
      'Código de acesso',
      'Em breve poderá definir um código de entrada para o aplicativo.'
    );
  };

  const handleLanguage = () => {
    showInfo(
      'Idioma',
      'A seleção de idioma estará disponível em breve.'
    );
  };

  const handleLogout = () => {
    showWarning(
      'Terminar Sessão',
      'Tem certeza que deseja sair da aplicação?',
      () => {
        showSuccess('Sessão Terminada', 'Até breve!', () => {
          onLogout?.();
        });
      }
    );
  };

  return (
    <View className="flex-1 bg-slate-900">
      <StatusBar style="light" backgroundColor="#0f172a" />

      <ScrollView className="flex-1 bg-slate-900" contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-[58px] pb-5">
          <View className="items-center mb-6 relative">
            <TouchableOpacity
              onPress={onBack}
              className="absolute left-0 top-0 w-10 h-10 rounded-full bg-slate-900 border border-slate-800 items-center justify-center"
              activeOpacity={0.75}
            >
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <Text className="text-white text-[31px] font-bold leading-[36px] text-center">Minha Conta</Text>
          </View>

          <View className="items-center mb-5">
            <View className="relative">
              {userData?.avatar?.link ? (
                <Image source={{ uri: userData.avatar.link }} className="w-[96px] h-[96px] rounded-full" />
              ) : (
                <View className="w-[96px] h-[96px] rounded-full bg-[#0f172a] border border-slate-700 items-center justify-center">
                  <Text className="text-cyan-400 text-3xl font-black">{studentInfo.initials}</Text>
                </View>
              )}

              <TouchableOpacity
                onPress={handleEditProfile}
                className="absolute -right-1 -bottom-1 w-12 h-12 rounded-full bg-slate-800 border border-slate-700 items-center justify-center"
                activeOpacity={0.8}
              >
                <Ionicons name="pencil" size={18} color="#e2e8f0" />
              </TouchableOpacity>

              <View className={`absolute top-1 right-1 w-3 h-3 rounded-full ${studentInfo.isComplete ? 'bg-emerald-500' : 'bg-amber-400'}`} />
            </View>
            <Text className="text-slate-300 text-sm mt-3">@{studentInfo.username}</Text>
        </View>

          <View className="bg-slate-950 border border-slate-800 rounded-[26px] overflow-hidden">
            <SectionLabel title="Informações pessoais" />

            <InfoSettingRow
              icon={<Ionicons name="person-outline" size={22} color="#f8fafc" />}
              label="Nome"
              value={studentInfo.name}
            />
            <InfoSettingRow
              icon={<Ionicons name="call-outline" size={21} color="#f8fafc" />}
              label="Telefone"
              value={studentInfo.phone}
            />
            <InfoSettingRow
              icon={<Ionicons name="mail-outline" size={21} color="#f8fafc" />}
              label="Email"
              value={studentInfo.email || 'Sem email'}
              isLast
            />

            <SectionLabel title="Definições" />

            <ToggleSettingRow
              icon={<MaterialIcons name="notifications-none" size={22} color="#f8fafc" />}
              label="Receber notificações"
              subtitle="Alertas e novidades do transporte"
              value={notificationsEnabled}
              onChange={handleNotificationChange}
            />

            <ToggleSettingRow
              icon={<MaterialIcons name="location-on" size={22} color="#f8fafc" />}
              label="Localização"
              subtitle="Usar GPS para funcionalidades em tempo real"
              value={locationEnabled}
              onChange={handleLocationChange}
            />

            <ToggleSettingRow
              icon={<MaterialIcons name="visibility-off" size={22} color="#f8fafc" />}
              label="Modo discreto"
              subtitle="Ocultar detalhes sensíveis"
              value={autoAlerts}
              onChange={setAutoAlerts}
              isLast
            />

            <View className="h-px bg-slate-800 mx-5 my-2" />

            <ActionSettingRow
              icon={<MaterialIcons name="password" size={22} color="#f8fafc" />}
              label="Código para entrar"
              subtitle="Alterar código de acesso"
              onPress={handleAccessCode}
            />

            <ActionSettingRow
              icon={<Ionicons name="language-outline" size={22} color="#f8fafc" />}
              label="Idioma"
              subtitle="Português"
              onPress={handleLanguage}
            />

            <ActionSettingRow
              icon={<MaterialIcons name="route" size={22} color="#f8fafc" />}
              label="Rota preferida"
              subtitle={studentInfo.preferredRoute}
              onPress={handleRouteChange}
            />

            <ActionSettingRow
              icon={<MaterialIcons name="schedule" size={22} color="#f8fafc" />}
              label="Horários"
              subtitle="Personalizar alertas"
              onPress={handleScheduleCustom}
            />

            <ActionSettingRow
              icon={<MaterialIcons name="emoji-events" size={22} color="#f8fafc" />}
              label="Conquistas"
              subtitle={`Nível ${studentInfo.level} • Nota ${studentInfo.grade}`}
              onPress={handleAchievements}
            />

            <ActionSettingRow
              icon={<MaterialIcons name="support-agent" size={22} color="#f8fafc" />}
              label="Suporte"
              subtitle="Contactar equipa"
              onPress={handleSupport}
              isLast
            />
          </View>

          <TouchableOpacity
            className="flex-row items-center justify-center gap-2.5 bg-red-500/10 rounded-2xl py-3.5 mt-5 "
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <MaterialIcons name="logout" size={18} color="#ef4444" />
            <Text className="text-red-500 text-[15px] font-bold">Sair</Text>
          </TouchableOpacity>

          <Text className="text-slate-500 text-xs text-center mt-6">42Routes v1.0.0 · © 2024 42 Luanda</Text>
        </View>
      </ScrollView>

      {AlertComponent}
    </View>
  );
};

const SectionLabel = ({ title }: { title: string }) => (
  <View className="px-5 pt-6 pb-2">
    <Text className="text-slate-300 text-[18px] font-semibold text-center">{title}</Text>
  </View>
);

const InfoSettingRow = ({
  icon,
  label,
  value,
  isLast,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  isLast?: boolean;
}) => (
  <TouchableOpacity
    className={`flex-row items-center px-5 py-4 ${!isLast ? 'border-b border-slate-800' : ''}`}
    activeOpacity={0.75}
  >
    <View className="w-10 items-start">{icon}</View>
    <View className="flex-1 pr-2">
      <Text className="text-slate-300 text-[13px] mb-0.5">{label}</Text>
      <Text className="text-white text-[15px] font-medium leading-5" numberOfLines={1}>{value}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
  </TouchableOpacity>
);

const ToggleSettingRow = ({
  icon,
  label,
  subtitle,
  value,
  onChange,
  isLast,
}: {
  icon: React.ReactNode;
  label: string;
  subtitle: string;
  value: boolean;
  onChange: (value: boolean) => void;
  isLast?: boolean;
}) => (
  <View className={`flex-row items-center px-5 py-4 ${!isLast ? 'border-b border-slate-800' : ''}`}>
    <View className="w-10 items-start">{icon}</View>
    <View className="flex-1">
      <Text className="text-white text-[16px] font-medium leading-5">{label}</Text>
      <Text className="text-slate-400 text-[14px] mt-0.5">{subtitle}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: '#475569', true: '#00babc' }}
      thumbColor="#ffffff"
      ios_backgroundColor="#475569"
    />
  </View>
);

const ActionSettingRow = ({
  icon,
  label,
  subtitle,
  onPress,
  isLast,
}: {
  icon: React.ReactNode;
  label: string;
  subtitle: string;
  onPress: () => void;
  isLast?: boolean;
}) => (
  <TouchableOpacity
    className={`flex-row items-center px-5 py-4 ${!isLast ? 'border-b border-slate-800' : ''}`}
    onPress={onPress}
    activeOpacity={0.75}
  >
    <View className="w-10 items-start">{icon}</View>
    <View className="flex-1">
      <Text className="text-white text-[16px] font-medium leading-5">{label}</Text>
      <Text className="text-slate-400 text-[14px] mt-0.5">{subtitle}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
  </TouchableOpacity>
);
