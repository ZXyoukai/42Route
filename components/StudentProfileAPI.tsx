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
  const [expandedSection, setExpandedSection] = useState<string | null>('info');
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
    studentId: userData ? userData.id : '42LUANDA1234',
    email: userData ? userData.email : 'joao.silva@student.42luanda.ao',
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
    <View className="flex-1 bg-slate-950">
      <StatusBar style="light" backgroundColor="#0f172a" />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <View className="bg-slate-800 items-center pt-[60px] pb-6 px-5 border-b border-slate-700">
        {/* Back */}
        <TouchableOpacity onPress={onBack} className="absolute top-14 left-5 w-10 h-10 rounded-full bg-slate-950/90 border border-slate-700 items-center justify-center" activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Avatar */}
        <View className="relative mb-[14px]">
          {userData?.avatar?.link ? (
            <Image source={{ uri: userData.avatar.link }} className="w-[88px] h-[88px] rounded-full border-4 border-cyan-500" />
          ) : (
            <View className="w-[88px] h-[88px] rounded-full bg-cyan-500/20 border-4 border-cyan-500 items-center justify-center">
              <Text className="text-cyan-500 text-3xl font-black">{studentInfo.initials}</Text>
            </View>
          )}
          {/* Status dot */}
          <View className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-slate-800 ${studentInfo.isComplete ? 'bg-green-500' : 'bg-amber-400'}`} />
        </View>

        <Text className="text-white text-2xl font-black text-center">{studentInfo.name}</Text>
        <Text className="text-slate-600 text-xs mt-0.5 mb-3">{studentInfo.email}</Text>

        {/* Badges row */}
        <View className="flex-row gap-2 flex-wrap justify-center">
          <View className="flex-row items-center gap-1 px-2.5 py-1 rounded-full ">
            <FontAwesome5 name="graduation-cap" size={10} color="#00babc" />
            <Text className="text-cyan-500 text-[11px] font-semibold">Cadete</Text>
          </View>
          <View className="flex-row items-center gap-1 px-2.5 py-1 rounded-full ">
            <MaterialIcons name="directions-bus" size={11} color="#00babc" />
            <Text className="text-cyan-500 text-[11px] font-semibold">{studentInfo.preferredRoute}</Text>
          </View>
          <View className={`flex-row items-center gap-1 px-2.5 py-1 rounded-full ${studentInfo.isComplete ? '' : ''}`}>
            <Ionicons
              name={studentInfo.isComplete ? 'checkmark-circle' : 'time-outline'}
              size={11}
              color={studentInfo.isComplete ? '#22c55e' : '#f59e0b'}
            />
            <Text className={`text-[11px] font-semibold ${studentInfo.isComplete ? 'text-green-500' : 'text-amber-400'}`}>
              {studentInfo.isComplete ? 'Perfil completo' : 'Cadastro pendente'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-3.5" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* ── Stats grid ───────────────────────────────────────── */}
        <View className="flex-row gap-2.5 mb-6">
          <StatCard value={`Lv. ${studentInfo.level}`} label="Nível" icon={<FontAwesome5 name="layer-group" size={16} color="#00babc" />} />
          <StatCard value={studentInfo.grade} label="Nota" icon={<MaterialIcons name="grade" size={18} color="#00babc" />} />
          <StatCard value="42" label="Viagens" icon={<MaterialIcons name="directions-bus" size={18} color="#00babc" />} />
          <StatCard value="98%" label="Pontualidade" icon={<Ionicons name="checkmark-circle" size={17} color="#00babc" />} />
        </View>

        {/* ── Expandable Sections ──────────────────────────── */}
        <ExpandableSection
          title="Informações"
          icon={<Ionicons name="person-circle-outline" size={18} color="#00babc" />}
          isExpanded={expandedSection === 'info'}
          onPress={() => setExpandedSection(expandedSection === 'info' ? null : 'info')}
        >
          <InfoRow icon={<MaterialIcons name="school" size={16} color="#00babc" />} label="Curso" value={studentInfo.course} />
          <InfoRow icon={<Ionicons name="location-outline" size={16} color="#00babc" />} label="Cidade / Distrito" value={`${studentInfo.city} / ${studentInfo.distrit}`} />
          <InfoRow icon={<MaterialIcons name="place" size={16} color="#00babc" />} label="Paragem" value={studentInfo.selectedStop} accent />
          <InfoRow icon={<MaterialIcons name="route" size={16} color="#00babc" />} label="Rota" value={studentInfo.preferredRoute} accent />
        </ExpandableSection>

        <ExpandableSection
          title="Notificações"
          icon={<Ionicons name="notifications-outline" size={18} color="#00babc" />}
          isExpanded={expandedSection === 'notif'}
          onPress={() => setExpandedSection(expandedSection === 'notif' ? null : 'notif')}
        >
          <ToggleRow
            icon={<Ionicons name="notifications" size={15} color="#00babc" />}
            label="Push"
            sub="Alertas dos autocarros"
            value={notificationsEnabled}
            onChange={handleNotificationChange}
          />
          <ToggleRow
            icon={<Ionicons name="location" size={15} color="#00babc" />}
            label="Localização"
            sub="Funcionalidades GPS"
            value={locationEnabled}
            onChange={handleLocationChange}
          />
          <ToggleRow
            icon={<MaterialIcons name="alarm" size={15} color="#00babc" />}
            label="Alertas"
            sub="10 min antes da chegada"
            value={autoAlerts}
            onChange={setAutoAlerts}
            isLast
          />
        </ExpandableSection>

        <ExpandableSection
          title="Ações"
          icon={<MaterialIcons name="tune" size={18} color="#00babc" />}
          isExpanded={expandedSection === 'actions'}
          onPress={() => setExpandedSection(expandedSection === 'actions' ? null : 'actions')}
        >
          <ActionRow icon={<MaterialIcons name="route" size={17} color="#00babc" />} label="Alterar Rota" onPress={handleRouteChange} />
          <ActionRow icon={<MaterialIcons name="schedule" size={17} color="#00babc" />} label="Horários" onPress={handleScheduleCustom} />
          <ActionRow icon={<MaterialIcons name="emoji-events" size={17} color="#00babc" />} label="Conquistas" onPress={handleAchievements} />
          <ActionRow icon={<MaterialIcons name="help-outline" size={17} color="#00babc" />} label="Suporte" onPress={handleSupport} isLast />
        </ExpandableSection>

        {/* ── Logout ────────────────────────────────────────────── */}
        <TouchableOpacity className="flex-row items-center justify-center gap-2.5 bg-red-500/10 rounded-2xl py-3.5 mt-6 border border-red-500/30" onPress={handleLogout} activeOpacity={0.8}>
          <MaterialIcons name="logout" size={18} color="#ef4444" />
          <Text className="text-red-500 text-[15px] font-bold">Sair</Text>
        </TouchableOpacity>

        <Text className="text-slate-700 text-xs text-center mt-6">42Routes v1.0.0 · © 2024 42 Luanda</Text>
      </ScrollView>

      {AlertComponent}
    </View>
  );
};

// ── Sub-components ──────────────────────────────────────────────────────────

const StatCard = ({
  value,
  label,
  icon,
}: {
  value: string;
  label: string;
  icon: React.ReactNode;
}) => (
  <View className="flex-1 rounded-xl p-3 items-center gap-1">
    <View className="w-[34px] h-[34px] rounded-lg bg-cyan-500/10 items-center justify-center mb-0.5">{icon}</View>
    <Text className="text-white text-sm font-black">{value}</Text>
    <Text className="text-slate-600 text-[9px] text-center">{label}</Text>
  </View>
);

const ExpandableSection = ({
  title,
  icon,
  isExpanded,
  onPress,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) => (
  <View className="mb-3 bg-slate-800/50 rounded-xl  overflow-hidden">
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between px-4 py-3.5"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center gap-3 flex-1">
        <View className="w-8 h-8 rounded-lg bg-cyan-500/10 items-center justify-center">{icon}</View>
        <Text className="text-white font-semibold text-[15px]">{title}</Text>
      </View>
      <Ionicons
        name={isExpanded ? 'chevron-up' : 'chevron-down'}
        size={20}
        color="#64748b"
      />
    </TouchableOpacity>
    {isExpanded && (
      <View className="border-t border-slate-700/50 bg-slate-900/30">
        {children}
      </View>
    )}
  </View>
);

const InfoRow = ({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) => (
  <View className="flex-row items-center gap-3 px-4 py-3 border-b border-slate-700/30 last:border-b-0">
    <View className={`w-[28px] h-[28px] rounded-lg items-center justify-center ${accent ? 'bg-cyan-500/15' : 'bg-cyan-500/8'}`}>{icon}</View>
    <View className="flex-1">
      <Text className="text-slate-600 text-xs mb-0.5 font-medium">{label}</Text>
      <Text className={`text-sm font-semibold ${accent ? 'text-cyan-400' : 'text-slate-100'}`}>{value}</Text>
    </View>
  </View>
);

const ToggleRow = ({
  icon,
  label,
  sub,
  value,
  onChange,
  isLast,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  value: boolean;
  onChange: (v: boolean) => void;
  isLast?: boolean;
}) => (
  <View className={`flex-row items-center gap-3 px-4 py-3 ${!isLast ? 'border-b border-slate-700/30' : ''}`}>
    <View className="w-[28px] h-[28px] rounded-lg bg-cyan-500/8 items-center justify-center flex-shrink-0">{icon}</View>
    <View className="flex-1">
      <Text className="text-sm font-semibold text-slate-100">{label}</Text>
      <Text className="text-xs text-slate-600 mt-0.5">{sub}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: '#334155', true: '#00babc' }}
      thumbColor={value ? '#ffffff' : '#64748b'}
    />
  </View>
);

const ActionRow = ({
  icon,
  label,
  onPress,
  isLast,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  isLast?: boolean;
}) => (
  <TouchableOpacity
    className={`flex-row items-center gap-3 px-4 py-3 ${!isLast ? 'border-b border-slate-700/30' : ''}`}
    onPress={onPress}
    activeOpacity={0.6}
  >
    <View className="w-[28px] h-[28px] rounded-lg bg-cyan-500/8 items-center justify-center flex-shrink-0">{icon}</View>
    <Text className="flex-1 text-sm font-semibold text-slate-100">{label}</Text>
    <Ionicons name="chevron-forward" size={16} color="#64748b" />
  </TouchableOpacity>
);

// ── Styles ──────────────────────────────────────────────────────────────────
const ACCENT = '#00babc';
const BG = '#0f172a';
const CARD = '#1e293b';
const BORDER = '#334155';
const MUTED = '#64748b';
