import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
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
  <View className="mb-4">
    <View className="flex-row items-center gap-2 mb-2">
      {icon}
      <Text className="text-slate-400 text-[13px] font-medium">
        {label}
        {required && <Text className="text-[#00babc]"> *</Text>}
      </Text>
    </View>
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor="#64748b"
      keyboardType={keyboardType}
      className="h-[48px] bg-slate-900 rounded-xl px-4 py-3 text-white text-[14px] border border-slate-700"
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
  <View className="flex-row items-center gap-3 mb-5 pb-3 border-b border-slate-800">
    <View className="w-9 h-9 rounded-[10px] bg-[#00babc]/10 border border-[#00babc]/25 items-center justify-center">
      {icon}
    </View>
    <View>
      <Text className="text-white text-[15px] font-bold">{title}</Text>
      {subtitle && <Text className="text-slate-400 text-[12px] mt-0.5">{subtitle}</Text>}
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
    <View className="flex-1 bg-slate-900">
      <StatusBar style="light" backgroundColor="#0f172a" />

      {/* ── Hero header ─────────────────────────────────────── */}
      <View className="flex-row items-center pt-[56px] px-5 pb-4 border-b border-slate-800 gap-4">
        <View className="w-16 h-16 rounded-full border-l-2 border-[#00babc] items-center justify-center">
          <Text className="text-[#00babc] text-[22px] font-extrabold">{initials}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-slate-400 text-[12px] mb-0.5 font-medium">Bem-vindo ao 42Routes</Text>
          <Text className="text-white text-[17px] font-bold" numberOfLines={1}>
            {initialUser.full_name || initialUser.username}
          </Text>
          <View className="flex-row  mt-1.5 gap-1.5  self-start py-1 rounded-full">
            <FontAwesome5 name="user-graduate" size={10} color="#00babc" />
            <Text className="text-[#00babc] text-[11px] font-semibold uppercase tracking-wider">Cadete · 42 Luanda</Text>
          </View>
        </View>
      </View>

      {/* ── Progress pills ──────────────────────────────────── */}
      

      <ScrollView
        className="flex-1 px-4 pt-3"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
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

        {/* ── Paragem ─────────────────────────────────────────── */}
        <View className=" rounded-[20px] p-5 mb-4 ">
          <Section
            icon={<MaterialIcons name="directions-bus" size={18} color="#00babc" />}
            title="A Minha Paragem"
            subtitle="Escolhe o ponto de embarque mais próximo"
          />

          {stopsLoading ? (
            <View className="items-center py-6 gap-2">
              <Ionicons name="reload-circle" size={28} color="#00babc" />
              <Text className="text-slate-400 text-[14px]">A carregar paragens...</Text>
            </View>
          ) : stops.length === 0 ? (
            <View className="items-center py-6 gap-2">
              <Ionicons name="warning-outline" size={28} color="#64748b" />
              <Text className="text-slate-400 text-[14px]">Nenhuma paragem disponível</Text>
            </View>
          ) : (
            stops.map((stop) => {
              const isSelected = selectedStopId === stop.id;
              return (
                <TouchableOpacity
                  key={stop.id}
                  onPress={() => setSelectedStopId(stop.id)}
                  activeOpacity={0.75}
                  className={`flex-row items-center bg-slate-900 rounded-[14px] py-3 pr-3.5 mb-2 border ${
                    isSelected ? 'border-[#00babc] bg-[#00babc]/5' : 'border-slate-700'
                  } overflow-hidden gap-3`}
                >
                  <View className={`w-1 self-stretch rounded ml-0.5 ${isSelected ? 'bg-[#00babc]' : 'bg-transparent'}`} />
                  <View
                    className={`w-9 h-9 rounded-[10px] items-center justify-center ${
                      isSelected ? 'bg-[#00babc]/20' : 'bg-white/5'
                    }`}
                  >
                    <MaterialIcons
                      name="place"
                      size={20}
                      color={isSelected ? "#00babc" : "#64748b"}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className={`text-[14px] font-semibold ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                      {stop.stop_name ?? `Paragem ${stop.id}`}
                    </Text>
                    {stop.distrit && (
                      <Text className="text-slate-500 text-[12px] mt-0.5">{stop.distrit}</Text>
                    )}
                    {stop.route?.route_name && (
                      <View className="flex-row items-center gap-1 mt-1.5 self-start bg-[#00babc]/10 px-2 py-0.5 rounded-full border border-[#00babc]/20">
                        <MaterialIcons name="directions-bus" size={10} color="#00babc" />
                        <Text className="text-[#00babc] text-[10px] font-semibold uppercase tracking-wider">{stop.route.route_name}</Text>
                      </View>
                    )}
                  </View>
                  {isSelected ? (
                    <Ionicons name="checkmark-circle" size={22} color="#00babc" />
                  ) : (
                    <View className="w-5 h-5 rounded-full border-2 border-slate-600" />
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* ── Selected summary ────────────────────────────────── */}
        {selectedStop && (
          <View className="flex-row items-center  gap-2.5  rounded-[14px] px-4 py-3 ">
            <Ionicons name="checkmark-circle" size={18} color="#00babc" />
            <Text className="text-[#94a3b8] text-[13px] flex-1">
              Paragem selecionada:{' '}
              <Text className="text-white font-bold">{selectedStop.stop_name}</Text>
            </Text>
          </View>
        )}

        {/* ── Submit ──────────────────────────────────────────── */}
        <TouchableOpacity 
          onPress={handleSave} 
          activeOpacity={0.85} 
          className="flex-row items-center justify-center bg-[#00babc] rounded-[16px] py-[16px] mb-3 shadow-md shadow-[#00babc]/30"
        >
          <FontAwesome5 name="check-circle" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text className="text-white font-extrabold text-[16px]">Finalizar Cadastro</Text>
        </TouchableOpacity>

        <Text className="text-slate-500 text-[11px] text-center px-6 mb-2">
          Os teus dados são guardados apenas localmente neste dispositivo.
        </Text>
      </ScrollView>

      {AlertComponent}
    </View>
  );
};

