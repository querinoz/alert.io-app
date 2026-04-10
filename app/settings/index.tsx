import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform, Pressable, Switch, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NeonText } from '../../src/components/ui/NeonText';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { useA11y, announce } from '../../src/hooks/useAccessibility';
import { useHaptics } from '../../src/hooks/useHaptics';
import { useAuthStore } from '../../src/stores/authStore';
import { LogoMark } from '../../src/components/ui/LogoMark';
import { Colors } from '../../src/theme/colors';
import { Spacing } from '../../src/theme/spacing';

function SettingRow({ icon, label, hint, value, onToggle, onPress, color, trailing }: {
  icon: string;
  label: string;
  hint: string;
  value?: boolean;
  onToggle?: (val: boolean) => void;
  onPress?: () => void;
  color?: string;
  trailing?: string;
}) {
  const { colors, minTarget } = useA11y();
  const haptics = useHaptics();
  const isToggle = onToggle !== undefined;

  const content = (
    <View style={[styles.settingRow, { minHeight: minTarget }]}>
      <MaterialCommunityIcons name={icon as any} size={22} color={color ?? colors.textSecondary} />
      <View style={styles.settingText}>
        <NeonText variant="body">{label}</NeonText>
        <NeonText variant="caption" color={colors.textTertiary}>{hint}</NeonText>
      </View>
      {isToggle ? (
        <Switch
          value={value}
          onValueChange={(v) => { haptics.selection(); onToggle(v); }}
          trackColor={{ false: colors.glass.background, true: Colors.primary + '50' }}
          thumbColor={value ? Colors.primary : colors.textTertiary}
          accessible
          accessibilityLabel={`${label}, atualmente ${value ? 'ativado' : 'desativado'}`}
          accessibilityRole="switch"
        />
      ) : trailing ? (
        <NeonText variant="caption" color={colors.textTertiary}>{trailing}</NeonText>
      ) : (
        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={() => { haptics.light(); onPress(); }}
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        accessible accessibilityLabel={label} accessibilityHint={hint} accessibilityRole="button"
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

export default function SettingsScreen() {
  const { colors, minTarget, reducedMotion } = useA11y();
  const haptics = useHaptics();
  const { user, updateProfile } = useAuthStore();

  const [fuzzyLocation, setFuzzyLocation] = useState(false);
  const [locationHistory, setLocationHistory] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [alertRadius, setAlertRadius] = useState('5 km');
  const [quietHours, setQuietHours] = useState(false);

  const entryOpacity = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;
  const entrySlide = useRef(new Animated.Value(reducedMotion ? 0 : 20)).current;

  useEffect(() => {
    if (reducedMotion) return;
    Animated.parallel([
      Animated.timing(entryOpacity, { toValue: 1, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(entrySlide, { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 3 }),
    ]).start();
  }, [reducedMotion]);

  const showToast = (msg: string) => {
    announce(msg);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const t = document.createElement('div');
      t.textContent = msg;
      t.style.cssText = 'position:fixed;bottom:32px;left:50%;transform:translateX(-50%) translateY(20px);background:#161B22;border:0.5px solid rgba(0,255,136,0.25);color:#00FF88;font-family:monospace;font-size:12px;padding:12px 24px;border-radius:8px;z-index:9999;opacity:0;transition:opacity .3s,transform .3s;';
      document.body.appendChild(t);
      requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)'; });
      setTimeout(() => { t.style.opacity = '0'; }, 2500);
      setTimeout(() => { t.remove(); }, 3000);
    }
  };

  const radiusOptions = ['1 km', '2 km', '5 km', '10 km', '25 km'];
  const cycleAlertRadius = () => {
    const idx = radiusOptions.indexOf(alertRadius);
    const next = radiusOptions[(idx + 1) % radiusOptions.length];
    setAlertRadius(next);
    showToast(`Raio de alerta: ${next}`);
  };

  return (
    <View style={[styles.fullScreen, Platform.OS === 'web' ? {
      backgroundColor: 'rgba(13,17,23,0.85)',
      backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
      animation: 'overlay-slide-in 0.25s cubic-bezier(.16,1,.3,1)',
    } as any : { backgroundColor: colors.background }]}>

      <Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} style={{ opacity: entryOpacity, transform: [{ translateY: entrySlide }] }}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => { haptics.light(); router.back(); }}
          style={[styles.backBtn, { minHeight: minTarget, minWidth: minTarget }]}
          accessible accessibilityLabel="Voltar" accessibilityRole="button"
        >
          <MaterialCommunityIcons name="close" size={22} color={colors.textPrimary} />
        </Pressable>
        <NeonText variant="h3">Configurações</NeonText>
      </View>

      {/* Privacy */}
      <NeonText variant="label" color={colors.textSecondary} style={styles.sectionTitle}>
        Privacidade & Localização
      </NeonText>
      <GlassCard noPadding>
        <SettingRow
          icon="eye-off"
          label="Modo Fantasma"
          hint="Ocultar-se do mapa público"
          value={user?.isGhostMode}
          onToggle={(v) => {
            updateProfile({ isGhostMode: v });
            showToast(v ? '👻 Modo fantasma ativado — você está invisível no mapa' : '👁 Modo fantasma desativado — você está visível');
          }}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <SettingRow
          icon="blur"
          label="Localização Aproximada"
          hint="Adicionar ±200m de offset ao compartilhar"
          value={fuzzyLocation}
          onToggle={(v) => {
            setFuzzyLocation(v);
            showToast(v ? 'Localização aproximada ativada (±200m)' : 'Localização exata ativada');
          }}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <SettingRow
          icon="map-clock"
          label="Histórico de Localização"
          hint="Resumos diários encriptados da localização"
          value={locationHistory}
          onToggle={(v) => {
            setLocationHistory(v);
            showToast(v ? 'Histórico de localização ativado' : 'Histórico de localização desativado');
          }}
        />
      </GlassCard>

      {/* Notifications */}
      <NeonText variant="label" color={colors.textSecondary} style={styles.sectionTitle}>
        Notificações
      </NeonText>
      <GlassCard noPadding>
        <SettingRow
          icon="bell"
          label="Notificações Push"
          hint="Receber alertas de incidentes próximos"
          value={pushNotifications}
          onToggle={(v) => {
            setPushNotifications(v);
            showToast(v ? '🔔 Notificações ativadas' : '🔕 Notificações desativadas');
          }}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <SettingRow
          icon="map-marker-radius"
          label="Raio de Alerta"
          hint="Distância máxima para receber alertas"
          trailing={alertRadius}
          onPress={cycleAlertRadius}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <SettingRow
          icon="moon-waning-crescent"
          label="Horário Silencioso"
          hint="Silenciar notificações entre 23h e 7h"
          value={quietHours}
          onToggle={(v) => {
            setQuietHours(v);
            showToast(v ? '🌙 Silencioso: 23h–7h ativado' : 'Horário silencioso desativado');
          }}
        />
      </GlassCard>

      {/* Accessibility */}
      <NeonText variant="label" color={colors.textSecondary} style={styles.sectionTitle}>
        Acessibilidade
      </NeonText>
      <GlassCard noPadding>
        <SettingRow
          icon="human-accessible"
          label="Configurações de Acessibilidade"
          hint="Alto contraste, texto grande, leitor de ecrã, hápticos, guia por voz"
          onPress={() => router.push('/settings/accessibility')}
          color={Colors.secondary}
        />
      </GlassCard>

      {/* Account */}
      <NeonText variant="label" color={colors.textSecondary} style={styles.sectionTitle}>
        Conta
      </NeonText>
      <GlassCard noPadding>
        <SettingRow
          icon="shield-lock"
          label="Autenticação 2 Fatores"
          hint="Camada extra de segurança para a sua conta"
          onPress={() => showToast('Autenticação 2FA — em breve disponível')}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <SettingRow
          icon="download"
          label="Exportar Meus Dados"
          hint="Baixar todos os seus dados em formato JSON"
          onPress={() => showToast('📦 Exportação de dados iniciada — verifique seus downloads')}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <SettingRow
          icon="delete-forever"
          label="Apagar Conta"
          hint="Eliminar permanentemente todos os seus dados"
          onPress={() => {
            haptics.heavy();
            showToast('⚠️ Para apagar a conta, entre em contato: suporte@alert.io');
          }}
          color={Colors.error}
        />
      </GlassCard>

      {/* App info — boot-style footer */}
      <View style={styles.appInfo}>
        <LogoMark size={32} color={Colors.primary} />
        <NeonText variant="caption" color={colors.textTertiary} style={[styles.appInfoText, { marginTop: 8, fontFamily: Platform.OS === 'web' ? "'Courier New', monospace" : Platform.OS === 'ios' ? 'Courier' : 'monospace', letterSpacing: 1.5, fontSize: 10 }]}>
          ALERT.IO v3.0
        </NeonText>
        <NeonText variant="caption" color={colors.textTertiary} style={[styles.appInfoText, { fontSize: 9, marginTop: 2 }]}>
          From alert to action.
        </NeonText>
        <NeonText variant="caption" color={colors.textTertiary + '60'} style={[styles.appInfoText, { fontFamily: Platform.OS === 'web' ? "'Courier New', monospace" : Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 7, letterSpacing: 2, marginTop: 6 }]}>
          ENCRYPTED · AES-256 · REAL-TIME
        </NeonText>
      </View>
    </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  scroll: { paddingBottom: Spacing['3xl'] },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  backBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.sm,
  },
  sectionTitle: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  settingText: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing['4xl'],
  },
  appInfo: {
    alignItems: 'center',
    paddingTop: Spacing['3xl'],
  },
  appInfoText: {
    textAlign: 'center',
  },
});
