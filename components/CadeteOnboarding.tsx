import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useMiniBusStops } from '../hooks/useMiniBusStops';
import { Cadete } from '../types/api';
import { useCustomAlert } from './CustomAlert';
import { BusLoadingScreen } from './BusLoadingScreen';
import { api, cadeteService } from 'services';

const ACCENT = '#00babc';
const BG = '#0f172a';
const CARD = '#1e293b';
const BORDER = '#334155';
const MUTED = '#64748b';
const INPUT_BG = '#0f172a';

// ── Reusable field ──────────────────────────────────────────────────────────
const Field = ({
  icon,
  label,
  value,
  onChange,
  placeholder,
  keyboardType = 'default',
  required = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'phone-pad' | 'numeric';
  required?: boolean;
}) => (
  <View style={styles.fieldWrap}>
    <View style={styles.fieldLabel}>
      {icon}
      <Text style={styles.fieldLabelText}>
        {label}
        {required && <Text style={{ color: ACCENT }}> *</Text>}
      </Text>
    </View>
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={MUTED}
      keyboardType={keyboardType}
      style={styles.input}
    />
  </View>
);

// ── Section header ──────────────────────────────────────────────────────────
const Section = ({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionIcon}>{icon}</View>
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
  </View>
);

interface CadeteOnboardingProps {
  initialUser: Cadete;
  onComplete: (user: Cadete) => void;
}

export const CadeteOnboarding = ({ initialUser, onComplete }: CadeteOnboardingProps) => {
  const { stops, loading: stopsLoading } = useMiniBusStops();
  const { AlertComponent, showError, showSuccess } = useCustomAlert();

  const initials = (initialUser.full_name || initialUser.username || '?')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  const [fullName, setFullName] = useState(initialUser.full_name ?? initialUser.username ?? '');
  const [city, setCity] = useState(initialUser.city ?? 'Luanda');
  const [distrit, setDistrit] = useState(initialUser.distrit ?? '');
  const [phone, setPhone] = useState(initialUser.phone ? String(initialUser.phone) : '');
  const [course, setCourse] = useState(initialUser.course ?? '');
  const [level, setLevel] = useState(initialUser.level ? String(initialUser.level) : '');
  const [grade, setGrade] = useState(initialUser.grade ?? '');
  const [selectedStopId, setSelectedStopId] = useState<number | null>(initialUser.stop?.id ?? null);
  const [saving, setSaving] = useState(false);

  const selectedStop = useMemo(
    () => stops.find((s) => s.id === selectedStopId) ?? null,
    [selectedStopId, stops]
  );

  const handleSave = async () => {
    if (!fullName.trim() || !course.trim() || !level.trim() || !grade.trim() || !selectedStopId) {
      showError('Dados obrigatórios', 'Preencha nome, curso, nível, nota e selecione a sua paragem.');
      return;
    }
    const parsedLevel = Number(level);
    if (Number.isNaN(parsedLevel)) {
      showError('Nível inválido', 'O nível deve ser um número válido.');
      return;
    }
    setSaving(true);
    const updatedUser: Cadete = {
      ...initialUser,
      full_name: fullName.trim(),
      username: initialUser.username ?? fullName.trim(),
      email: initialUser.email,
      city: city.trim() || null,
      distrit: distrit.trim() || null,
      phone: phone.trim() ? Number(phone) : null,
      stop: selectedStop,
      avatar: initialUser.avatar?.link ? initialUser.avatar : { link: '' },
      course: course.trim(),
      level: parsedLevel,
      grade: grade.trim(),
      isDBUser: true,
      id: initialUser.id,
    };
    try {
      // Persiste no backend
      try {
        await cadeteService.update(initialUser.id, {
          full_name: updatedUser.full_name ?? undefined,
          city: updatedUser.city ?? undefined,
          distrit: updatedUser.distrit ?? undefined,
          phone: updatedUser.phone ?? undefined,
          stop_id: selectedStopId ?? undefined,
        });
      } catch (apiErr) {
        console.warn('Falha ao atualizar cadete na API (salvo localmente):', apiErr);
      }
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      showSuccess('Cadastro concluído!', 'O teu perfil foi configurado com sucesso.', () => {
        onComplete(updatedUser);
      });
    } catch {
      showError('Erro ao salvar', 'Não foi possível guardar os dados.');
    } finally {
      setSaving(false);
    }
  };

  if (saving) return <BusLoadingScreen msg="A guardar o teu perfil..." />;
  return (
    <View style={styles.root}>
      <StatusBar style="light" backgroundColor={BG} />

      {/* ── Hero header ─────────────────────────────────────── */}
      <View style={styles.hero}>
        <View style={styles.avatarRing}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroGreeting}>Bem-vindo ao 42Routes</Text>
          <Text style={styles.heroName} numberOfLines={1}>
            {initialUser.full_name || initialUser.username}
          </Text>
          <View style={styles.heroBadge}>
            <FontAwesome5 name="user-graduate" size={10} color={ACCENT} />
            <Text style={styles.heroBadgeText}>Cadete · 42 Luanda</Text>
          </View>
        </View>
      </View>

      {/* ── Progress pills ──────────────────────────────────── */}
      <View style={styles.progressRow}>
        {['Dados Pessoais', 'Academia', 'Paragem'].map((label, i) => (
          <View key={i} style={styles.progressItem}>
            <View style={styles.progressDot}>
              <Text style={styles.progressDotText}>{i + 1}</Text>
            </View>
            <Text style={styles.progressLabel}>{label}</Text>
          </View>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* ── Dados Pessoais ──────────────────────────────────── */}
        {/* <View style={styles.card}>
          <Section
            icon={<Ionicons name="person" size={18} color={ACCENT} />}
            title="Dados Pessoais"
            subtitle="Informações básicas do teu perfil"
          />
          <Field
            icon={<Ionicons name="text" size={14} color={MUTED} />}
            label="Nome completo"
            value={fullName}
            onChange={setFullName}
            placeholder="O teu nome"
            required
          />
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Field
                icon={<Ionicons name="location" size={14} color={MUTED} />}
                label="Cidade"
                value={city}
                onChange={setCity}
                placeholder="Luanda"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Field
                icon={<MaterialIcons name="location-city" size={14} color={MUTED} />}
                label="Distrito"
                value={distrit}
                onChange={setDistrit}
                placeholder="Ex: Talatona"
              />
            </View>
          </View>
          <Field
            icon={<Ionicons name="call" size={14} color={MUTED} />}
            label="Telefone"
            value={phone}
            onChange={setPhone}
            placeholder="923 000 000"
            keyboardType="phone-pad"
          />
        </View> */}

        {/* ── Dados Académicos ────────────────────────────────── */}
        {/* <View style={styles.card}>
          <Section
            icon={<FontAwesome5 name="graduation-cap" size={16} color={ACCENT} />}
            title="Dados Académicos"
            subtitle="Informações do teu percurso na 42"
          />
          <Field
            icon={<MaterialIcons name="school" size={14} color={MUTED} />}
            label="Curso"
            value={course}
            onChange={setCourse}
            placeholder="Ex: Common Core"
            required
          />
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Field
                icon={<FontAwesome5 name="layer-group" size={12} color={MUTED} />}
                label="Nível"
                value={level}
                onChange={setLevel}
                placeholder="Ex: 4"
                keyboardType="numeric"
                required
              />
            </View>
            <View style={{ flex: 1 }}>
              <Field
                icon={<MaterialIcons name="grade" size={14} color={MUTED} />}
                label="Nota / Grade"
                value={grade}
                onChange={setGrade}
                placeholder="Ex: B+"
                required
              />
            </View>
          </View>
        </View> */}

        {/* ── Paragem ─────────────────────────────────────────── */};
        <View style={styles.card}>
          <Section
            icon={<MaterialIcons name="directions-bus" size={18} color={ACCENT} />}
            title="A Minha Paragem"
            subtitle="Escolhe o ponto de embarque mais próximo"
          />

          {stopsLoading ? (
            <View style={styles.stopsLoading}>
              <Ionicons name="reload-circle" size={28} color={ACCENT} />
              <Text style={styles.stopsLoadingText}>A carregar paragens...</Text>
            </View>
          ) : stops.length === 0 ? (
            <View style={styles.stopsLoading}>
              <Ionicons name="warning-outline" size={28} color={MUTED} />
              <Text style={styles.stopsLoadingText}>Nenhuma paragem disponível</Text>
            </View>
          ) : (
            stops.map((stop) => {
              const isSelected = selectedStopId === stop.id;
              return (
                <TouchableOpacity
                  key={stop.id}
                  onPress={() => setSelectedStopId(stop.id)}
                  activeOpacity={0.75}
                  style={[styles.stopCard, isSelected && styles.stopCardSelected]}
                >
                  <View style={[styles.stopAccent, isSelected && { backgroundColor: ACCENT }]} />
                  <View
                    style={[
                      styles.stopIcon,
                      isSelected && { backgroundColor: 'rgba(0,186,188,0.18)' },
                    ]}
                  >
                    <MaterialIcons
                      name="place"
                      size={20}
                      color={isSelected ? ACCENT : MUTED}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.stopName, isSelected && { color: '#fff' }]}>
                      {stop.stop_name ?? `Paragem ${stop.id}`}
                    </Text>
                    {stop.distrit && (
                      <Text style={styles.stopDistrit}>{stop.distrit}</Text>
                    )}
                    {stop.route?.route_name && (
                      <View style={styles.stopRoutePill}>
                        <MaterialIcons name="directions-bus" size={10} color={ACCENT} />
                        <Text style={styles.stopRouteText}>{stop.route.route_name}</Text>
                      </View>
                    )}
                  </View>
                  {isSelected ? (
                    <Ionicons name="checkmark-circle" size={22} color={ACCENT} />
                  ) : (
                    <View style={styles.stopRadio} />
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* ── Selected summary ────────────────────────────────── */}
        {selectedStop && (
          <View style={styles.selectedBanner}>
            <Ionicons name="checkmark-circle" size={18} color={ACCENT} />
            <Text style={styles.selectedBannerText}>
              Paragem selecionada:{' '}
              <Text style={{ color: '#fff', fontWeight: '700' }}>{selectedStop.stop_name}</Text>
            </Text>
          </View>
        )}

        {/* ── Submit ──────────────────────────────────────────── */}
        <TouchableOpacity onPress={handleSave} activeOpacity={0.85} style={styles.submitBtn}>
          <FontAwesome5 name="check-circle" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.submitBtnText}>Finalizar Cadastro</Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          Os teus dados são guardados apenas localmente neste dispositivo.
        </Text>
      </ScrollView>

      {AlertComponent}
    </View>
  );
};

// ── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    gap: 16,
  },
  avatarRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,186,188,0.12)',
    borderWidth: 2,
    borderColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: ACCENT, fontSize: 22, fontWeight: '800' },
  heroGreeting: { color: MUTED, fontSize: 12, marginBottom: 2 },
  heroName: { color: '#fff', fontSize: 17, fontWeight: '700' },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 5,
    backgroundColor: 'rgba(0,186,188,0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,186,188,0.3)',
  },
  heroBadgeText: { color: ACCENT, fontSize: 11, fontWeight: '600' },

  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  progressItem: { alignItems: 'center', gap: 5 },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDotText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  progressLabel: { color: MUTED, fontSize: 10 },

  scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },

  card: {
    backgroundColor: CARD,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(0,186,188,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,186,188,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  sectionSubtitle: { color: MUTED, fontSize: 12, marginTop: 1 },

  fieldWrap: { marginBottom: 12 },
  fieldLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  fieldLabelText: { color: '#94a3b8', fontSize: 13 },
  input: {
    backgroundColor: INPUT_BG,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  row: { flexDirection: 'row' },

  stopsLoading: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  stopsLoadingText: { color: MUTED, fontSize: 14 },

  stopCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: INPUT_BG,
    borderRadius: 14,
    paddingVertical: 12,
    paddingRight: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
    gap: 12,
  },
  stopCardSelected: {
    borderColor: ACCENT,
    backgroundColor: 'rgba(0,186,188,0.06)',
  },
  stopAccent: { width: 4, alignSelf: 'stretch', backgroundColor: 'transparent', borderRadius: 2, marginLeft: 2 },
  stopIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopName: { color: '#94a3b8', fontSize: 14, fontWeight: '600' },
  stopDistrit: { color: MUTED, fontSize: 12, marginTop: 2 },
  stopRoutePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,186,188,0.1)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
  },
  stopRouteText: { color: ACCENT, fontSize: 10, fontWeight: '600' },
  stopRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: BORDER,
  },

  selectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,186,188,0.1)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,186,188,0.3)',
  },
  selectedBannerText: { color: '#94a3b8', fontSize: 13, flex: 1 },

  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT,
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 12,
  },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  footerNote: {
    color: MUTED,
    fontSize: 11,
    textAlign: 'center',
    paddingHorizontal: 24,
    marginBottom: 8,
  },
});
