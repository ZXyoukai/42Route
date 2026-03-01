import React, { useEffect, useState } from 'react';
import { Image, Text, View, ScrollView, TouchableOpacity, Switch, StyleSheet } from 'react-native';
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
    <View style={s.root}>
      <StatusBar style="light" backgroundColor="#0f172a" />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <View style={s.hero}>
        {/* Back */}
        <TouchableOpacity onPress={onBack} style={s.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Avatar */}
        <View style={s.avatarWrap}>
          {userData?.avatar?.link ? (
            <Image source={{ uri: userData.avatar.link }} style={s.avatarImg} />
          ) : (
            <View style={s.avatarFallback}>
              <Text style={s.avatarText}>{studentInfo.initials}</Text>
            </View>
          )}
          {/* Status dot */}
          <View style={[s.statusDot, studentInfo.isComplete ? s.dotGreen : s.dotAmber]} />
        </View>

        <Text style={s.heroName}>{studentInfo.name}</Text>
        <Text style={s.heroEmail}>{studentInfo.email}</Text>

        {/* Badges row */}
        <View style={s.badgesRow}>
          <View style={s.badge}>
            <FontAwesome5 name="graduation-cap" size={10} color="#00babc" />
            <Text style={s.badgeText}>Cadete</Text>
          </View>
          <View style={s.badge}>
            <MaterialIcons name="directions-bus" size={11} color="#00babc" />
            <Text style={s.badgeText}>{studentInfo.preferredRoute}</Text>
          </View>
          <View style={[s.badge, studentInfo.isComplete ? s.badgeGreen : s.badgeAmber]}>
            <Ionicons
              name={studentInfo.isComplete ? 'checkmark-circle' : 'time-outline'}
              size={11}
              color={studentInfo.isComplete ? '#22c55e' : '#f59e0b'}
            />
            <Text style={[s.badgeText, studentInfo.isComplete ? { color: '#22c55e' } : { color: '#f59e0b' }]}>
              {studentInfo.isComplete ? 'Perfil completo' : 'Cadastro pendente'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* ── Stats grid ───────────────────────────────────────── */}
        <View style={s.statsGrid}>
          <StatCard value={`Lv. ${studentInfo.level}`} label="Nível" icon={<FontAwesome5 name="layer-group" size={16} color="#00babc" />} />
          <StatCard value={studentInfo.grade} label="Nota" icon={<MaterialIcons name="grade" size={18} color="#00babc" />} />
          <StatCard value="42" label="Viagens" icon={<MaterialIcons name="directions-bus" size={18} color="#00babc" />} />
          <StatCard value="98%" label="Pontualidade" icon={<Ionicons name="checkmark-circle" size={17} color="#00babc" />} />
        </View>

        {/* ── Informações ─────────────────────────────────────── */}
        <Card title="Informações" icon={<Ionicons name="person-circle-outline" size={18} color="#00babc" />}>
          <InfoRow icon={<MaterialIcons name="school" size={16} color="#00babc" />} label="Curso" value={studentInfo.course} />
          <InfoRow icon={<Ionicons name="location-outline" size={16} color="#00babc" />} label="Cidade / Distrito" value={`${studentInfo.city} / ${studentInfo.distrit}`} />
          <InfoRow icon={<MaterialIcons name="place" size={16} color="#00babc" />} label="Paragem" value={studentInfo.selectedStop} accent />
          <InfoRow icon={<MaterialIcons name="route" size={16} color="#00babc" />} label="Rota" value={studentInfo.preferredRoute} accent />
        </Card>

        {/* ── Notificações ─────────────────────────────────────── */}
        <Card title="Notificações" icon={<Ionicons name="notifications-outline" size={18} color="#00babc" />}>
          <ToggleRow
            icon={<Ionicons name="notifications" size={15} color="#00babc" />}
            label="Notificações Push"
            sub="Alertas sobre os teus autocarros"
            value={notificationsEnabled}
            onChange={handleNotificationChange}
          />
          <ToggleRow
            icon={<Ionicons name="location" size={15} color="#00babc" />}
            label="Localização"
            sub="Funcionalidades baseadas em GPS"
            value={locationEnabled}
            onChange={handleLocationChange}
          />
          <ToggleRow
            icon={<MaterialIcons name="alarm" size={15} color="#00babc" />}
            label="Alertas Automáticos"
            sub="Notificação 10 min antes da chegada"
            value={autoAlerts}
            onChange={setAutoAlerts}
          />
        </Card>

        {/* ── Ações ────────────────────────────────────────────── */}
        <Card title="Mais opções" icon={<MaterialIcons name="tune" size={18} color="#00babc" />}>
          <ActionRow icon={<MaterialIcons name="route" size={17} color="#00babc" />} label="Alterar Rota Preferida" onPress={handleRouteChange} />
          <ActionRow icon={<MaterialIcons name="schedule" size={17} color="#00babc" />} label="Horários Personalizados" onPress={handleScheduleCustom} />
          <ActionRow icon={<MaterialIcons name="emoji-events" size={17} color="#00babc" />} label="Conquistas e Badges" onPress={handleAchievements} />
          <ActionRow icon={<MaterialIcons name="help-outline" size={17} color="#00babc" />} label="Ajuda e Suporte" onPress={handleSupport} />
        </Card>

        {/* ── Logout ────────────────────────────────────────────── */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <MaterialIcons name="logout" size={18} color="#ef4444" />
          <Text style={s.logoutText}>Terminar Sessão</Text>
        </TouchableOpacity>

        <Text style={s.version}>42Routes v1.0.0 · © 2024 42 Luanda</Text>
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
  <View style={s.statCard}>
    <View style={s.statIconWrap}>{icon}</View>
    <Text style={s.statValue}>{value}</Text>
    <Text style={s.statLabel}>{label}</Text>
  </View>
);

const Card = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <View style={s.card}>
    <View style={s.cardHeader}>
      <View style={s.cardIconWrap}>{icon}</View>
      <Text style={s.cardTitle}>{title}</Text>
    </View>
    {children}
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
  <View style={s.infoRow}>
    <View style={[s.infoIconWrap, accent && s.infoIconAccent]}>{icon}</View>
    <View style={{ flex: 1 }}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={[s.infoValue, accent && { color: '#00babc' }]}>{value}</Text>
    </View>
  </View>
);

const ToggleRow = ({
  icon,
  label,
  sub,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) => (
  <View style={s.toggleRow}>
    <View style={s.infoIconWrap}>{icon}</View>
    <View style={{ flex: 1 }}>
      <Text style={s.infoValue}>{label}</Text>
      <Text style={s.infoLabel}>{sub}</Text>
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
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={s.actionRow} onPress={onPress} activeOpacity={0.7}>
    <View style={s.infoIconWrap}>{icon}</View>
    <Text style={[s.infoValue, { flex: 1 }]}>{label}</Text>
    <Ionicons name="chevron-forward" size={16} color="#475569" />
  </TouchableOpacity>
);

// ── Styles ──────────────────────────────────────────────────────────────────
const ACCENT = '#00babc';
const BG = '#0f172a';
const CARD = '#1e293b';
const BORDER = '#334155';
const MUTED = '#64748b';

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  // Hero
  hero: {
    backgroundColor: CARD,
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backBtn: {
    position: 'absolute',
    top: 56,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrap: { position: 'relative', marginBottom: 14 },
  avatarImg: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: ACCENT },
  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(0,186,188,0.12)',
    borderWidth: 3,
    borderColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: ACCENT, fontSize: 30, fontWeight: '800' },
  statusDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: CARD,
  },
  dotGreen: { backgroundColor: '#22c55e' },
  dotAmber: { backgroundColor: '#f59e0b' },
  heroName: { color: '#fff', fontSize: 22, fontWeight: '800', textAlign: 'center' },
  heroEmail: { color: MUTED, fontSize: 13, marginTop: 3, marginBottom: 12 },
  badgesRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,186,188,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,186,188,0.25)',
  },
  badgeGreen: { backgroundColor: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.3)' },
  badgeAmber: { backgroundColor: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)' },
  badgeText: { color: ACCENT, fontSize: 11, fontWeight: '600' },

  scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 14 },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    gap: 4,
  },
  statIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(0,186,188,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statValue: { color: '#fff', fontSize: 14, fontWeight: '800' },
  statLabel: { color: MUTED, fontSize: 10, textAlign: 'center' },

  // Cards
  card: {
    backgroundColor: CARD,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  cardIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: 'rgba(0,186,188,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // Info rows
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51,65,85,0.6)',
  },
  infoIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(0,186,188,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIconAccent: { backgroundColor: 'rgba(0,186,188,0.15)' },
  infoLabel: { color: MUTED, fontSize: 11, marginBottom: 1 },
  infoValue: { color: '#e2e8f0', fontSize: 14, fontWeight: '600' },

  // Toggle
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51,65,85,0.6)',
  },

  // Action
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51,65,85,0.6)',
  },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 16,
    paddingVertical: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  logoutText: { color: '#ef4444', fontSize: 15, fontWeight: '700' },

  version: { color: '#475569', fontSize: 11, textAlign: 'center', marginBottom: 8 },
});