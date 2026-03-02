import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { BusLoadingScreen } from './BusLoadingScreen';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Driver } from '../types/api';
import { driverService } from '../services/driverService';

const ACCENT = '#00babc';
const BG = '#0f172a';
const CARD = '#1e293b';
const BORDER = '#334155';
const MUTED = '#64748b';
const DANGER = '#ef4444';
const SUCCESS = '#10b981';

interface DriverProfileAPIProps {
  driverId: number;
  onBack?: () => void;
  onLogout?: () => void;
}

export const DriverProfileAPI = ({ driverId, onBack, onLogout }: DriverProfileAPIProps) => {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDriverData();
  }, [driverId]);

  const loadDriverData = async () => {
    try {
      setLoading(true);
      const data = await driverService.getById(driverId);
      setDriver(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar perfil do motorista');
    } finally {
      setLoading(false);
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      'Terminar Sessão',
      'Tens a certeza que queres sair da aplicação?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: onLogout },
      ]
    );
  };

  if (loading) return <BusLoadingScreen msg="A carregar perfil do motorista..." />;

  if (error || !driver) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <Ionicons name="alert-circle" size={64} color={DANGER} />
        <Text style={styles.errorTitle}>Erro ao carregar perfil</Text>
        <Text style={styles.errorMsg}>{error}</Text>
        <TouchableOpacity onPress={loadDriverData} style={styles.retryBtn}>
          <Text style={styles.retryBtnText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const initials = driver.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'DR';
  const lastCoord = driver.coordinates?.length ? driver.coordinates[driver.coordinates.length - 1] : null;
  const hasRoute = !!driver.current_route;

  return (
    <View style={styles.root}>
      <StatusBar style="light" backgroundColor={BG} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>

        {/* ── Header / Avatar ──────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.fullName}>{driver.full_name || 'Motorista'}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <FontAwesome5 name="id-card" size={11} color={ACCENT} />
              <Text style={styles.badgeText}>Motorista</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>ID #{driver.id}</Text>
            </View>
          </View>
          {driver.email && (
            <Text style={styles.email}>{driver.email}</Text>
          )}
        </View>

        {/* ── Rota Atual ──────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="route" size={18} color={ACCENT} />
            <Text style={styles.sectionTitle}>Rota Atribuída</Text>
          </View>

          {hasRoute ? (
            <View style={styles.routeBox}>
              <Text style={styles.routeName}>{driver.current_route!.route_name}</Text>
              {driver.current_route!.description && (
                <Text style={styles.routeDesc}>{driver.current_route!.description}</Text>
              )}
              <View style={styles.routeMetaRow}>
                <View style={styles.routeMetaItem}>
                  <Ionicons name="location" size={13} color={ACCENT} />
                  <Text style={styles.routeMetaText}>
                    {driver.current_route!.stops?.length ?? 0} paragens
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <Text style={styles.mutedText}>Sem rota atribuída de momento.</Text>
          )}
        </View>

        {/* ── Última Localização Registada ─────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={18} color={ACCENT} />
            <Text style={styles.sectionTitle}>Última Posição Registada</Text>
          </View>

          {lastCoord ? (
            <View style={styles.coordBox}>
              <Text style={styles.coordLabel}>Coordenadas GPS</Text>
              <Text style={styles.coordText}>
                Lat {lastCoord.lat.toFixed(6)}  ·  Long {lastCoord.long.toFixed(6)}
              </Text>
            </View>
          ) : (
            <Text style={styles.mutedText}>Nenhuma posição registada ainda.</Text>
          )}
        </View>

        {/* ── Contacto ────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="call" size={18} color={ACCENT} />
            <Text style={styles.sectionTitle}>Contacto</Text>
          </View>

          <View style={styles.infoGrid}>
            {driver.username && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Username</Text>
                <Text style={styles.infoValue}>{driver.username}</Text>
              </View>
            )}
            {driver.phone && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Telefone</Text>
                <Text style={styles.infoValue}>{driver.phone}</Text>
              </View>
            )}
            {driver.email && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{driver.email}</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Terminar Sessão ──────────────────────────────────── */}
        {onLogout && (
          <TouchableOpacity style={styles.logoutBtn} onPress={confirmLogout} activeOpacity={0.8}>
            <Ionicons name="log-out" size={18} color={DANGER} />
            <Text style={styles.logoutText}>Terminar Sessão</Text>
          </TouchableOpacity>
        )}

      </ScrollView>
    </View>
  );
};

/* ── Styles ────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  /* Header */
  header: {
    alignItems: 'center',
    paddingTop: 52,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    marginBottom: 8,
  },
  avatarWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(0,186,188,0.15)',
    borderWidth: 2,
    borderColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarText: { color: ACCENT, fontSize: 30, fontWeight: '700' },
  fullName: { color: '#fff', fontSize: 22, fontWeight: '700', textAlign: 'center' },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,186,188,0.12)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,186,188,0.3)',
  },
  badgeText: { color: ACCENT, fontSize: 12, fontWeight: '600' },
  email: { color: MUTED, fontSize: 13, marginTop: 8 },

  /* Sections */
  section: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },

  /* Route */
  routeBox: {
    backgroundColor: 'rgba(0,186,188,0.07)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,186,188,0.22)',
  },
  routeName: { color: ACCENT, fontSize: 16, fontWeight: '700' },
  routeDesc: { color: '#cbd5e1', fontSize: 13, marginTop: 4 },
  routeMetaRow: { flexDirection: 'row', marginTop: 10 },
  routeMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,186,188,0.12)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,186,188,0.3)',
  },
  routeMetaText: { color: ACCENT, fontSize: 12, fontWeight: '500' },

  /* Coordinates */
  coordBox: {
    backgroundColor: 'rgba(0,186,188,0.07)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,186,188,0.22)',
  },
  coordLabel: { color: MUTED, fontSize: 11, marginBottom: 4 },
  coordText: { color: ACCENT, fontFamily: 'monospace', fontSize: 13 },

  /* Info grid */
  infoGrid: { gap: 8 },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(15,23,42,0.6)',
    borderRadius: 10,
  },
  infoLabel: { color: MUTED, fontSize: 13 },
  infoValue: { color: '#fff', fontSize: 13, fontWeight: '600', flexShrink: 1, textAlign: 'right', maxWidth: '60%' },

  /* Muted */
  mutedText: { color: MUTED, fontSize: 13 },

  /* Logout */
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.4)',
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  logoutText: { color: DANGER, fontSize: 15, fontWeight: '600' },

  /* Error */
  errorTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 16, textAlign: 'center' },
  errorMsg: { color: MUTED, marginTop: 8, textAlign: 'center', fontSize: 13 },
  retryBtn: {
    backgroundColor: ACCENT,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  retryBtnText: { color: '#fff', fontWeight: '700' },
});
