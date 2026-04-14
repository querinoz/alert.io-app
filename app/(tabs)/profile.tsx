import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform, Pressable, Linking, Animated, TextInput, Easing } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NeonText } from '../../src/components/ui/NeonText';
import { NeonButton } from '../../src/components/ui/NeonButton';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { useA11y, announce } from '../../src/hooks/useAccessibility';
import { useHaptics } from '../../src/hooks/useHaptics';
import { useResponsive } from '../../src/hooks/useResponsive';
import { useAuthStore } from '../../src/stores/authStore';
import { BADGES, getBadgeForReputation, getProgressToNextLevel } from '../../src/constants/badges';
import { LogoMark } from '../../src/components/ui/LogoMark';
import { Colors } from '../../src/theme/colors';
import { Spacing, Radius } from '../../src/theme/spacing';
import { useLanguageStore, AVAILABLE_LANGUAGES } from '../../src/i18n';
import { useAccessibilityStore } from '../../src/stores/accessibilityStore';

function showToast(message: string) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const t = document.createElement('div');
    t.textContent = message;
    t.style.cssText = 'position:fixed;bottom:32px;left:50%;transform:translateX(-50%) translateY(20px);background:#161B22;border:0.5px solid rgba(0,255,136,0.25);color:#00FF88;font-family:monospace;font-size:12px;padding:12px 24px;border-radius:8px;z-index:9999;opacity:0;transition:opacity .3s,transform .3s;';
    document.body.appendChild(t);
    requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)'; });
    setTimeout(() => { t.style.opacity = '0'; }, 2500);
    setTimeout(() => { t.remove(); }, 3000);
  }
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) {
  const { colors } = useA11y();
  const MONO = Platform.OS === 'web' ? "'Courier New', monospace" : Platform.OS === 'ios' ? 'Courier' : 'monospace';
  return (
    <GlassCard style={styles.statCard} accessibilityLabel={`${label}: ${value}`}>
      <MaterialCommunityIcons name={icon as any} size={18} color={color} />
      <NeonText variant="h4" color={color} style={[styles.statValue, { fontFamily: MONO, letterSpacing: 0.5 }]}>{value}</NeonText>
      <NeonText variant="caption" color={colors.textTertiary} style={{ fontSize: 10 }}>{label}</NeonText>
    </GlassCard>
  );
}

function MenuRow({ icon, label, hint, onPress, color, danger, badge }: {
  icon: string; label: string; hint: string; onPress: () => void;
  color?: string; danger?: boolean; badge?: string;
}) {
  const { colors, minTarget } = useA11y();
  const haptics = useHaptics();
  return (
    <Pressable onPress={() => { haptics.light(); onPress(); }}
      style={({ pressed }) => [styles.menuRow, {
        minHeight: minTarget,
        backgroundColor: pressed ? 'rgba(255,255,255,0.04)' : 'transparent',
        transform: [{ scale: pressed ? 0.98 : 1 }],
      }]}
      accessible accessibilityLabel={label} accessibilityHint={hint} accessibilityRole="button">
      <MaterialCommunityIcons name={icon as any} size={20}
        color={danger ? Colors.error : color ?? colors.textSecondary} />
      <NeonText variant="body" color={danger ? Colors.error : colors.textPrimary} style={styles.menuLabel}>
        {label}
      </NeonText>
      {badge && (
        <View style={[styles.menuBadge, { backgroundColor: Colors.primary + '20', borderWidth: 1, borderColor: Colors.primary + '30' }]}>
          <NeonText variant="caption" color={Colors.primary} style={{ fontWeight: '700', fontSize: 10 }}>{badge}</NeonText>
        </View>
      )}
      <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textTertiary} />
    </Pressable>
  );
}

const EMERGENCY_SERVICES = [
  { id: 'police', label: 'Polícia', icon: 'police-badge', color: '#3B7AFF', phone: '190' },
  { id: 'fire', label: 'Bombeiros', icon: 'fire-truck', color: '#FF5522', phone: '193' },
  { id: 'ambulance', label: 'Ambulância', icon: 'ambulance', color: '#FF3B7A', phone: '192' },
  { id: 'social', label: 'Serviço Social', icon: 'hand-heart', color: '#7B61FF', phone: '100' },
  { id: 'animals', label: 'Proteção Animal', icon: 'paw', color: '#FFB800', phone: '0800-111-000' },
  { id: 'civil', label: 'Defesa Civil', icon: 'shield-alert', color: '#00D4FF', phone: '199' },
];

function EmergencyButton({ service }: { service: typeof EMERGENCY_SERVICES[number] }) {
  const haptics = useHaptics();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.9, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }).start();
  };

  const handleCall = () => {
    haptics.heavy();
    const phoneUrl = `tel:${service.phone}`;
    if (Platform.OS === 'web') {
      announce(`Calling ${service.label} at ${service.phone}`);
      try { window.open(phoneUrl, '_self'); } catch { announce(`Call ${service.phone} for ${service.label}`); }
    } else {
      Linking.canOpenURL(phoneUrl).then((supported) => {
        if (supported) Linking.openURL(phoneUrl);
        else announce(`Call ${service.phone} for ${service.label}`);
      });
    }
  };

  return (
    <Animated.View style={[styles.emergencyBtnWrapper, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={handleCall}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.emergencyBtn,
          {
            backgroundColor: pressed ? service.color + '30' : service.color + '12',
            borderColor: service.color + '40',
            ...(Platform.OS === 'web'
              ? { boxShadow: pressed ? `0 0 12px ${service.color}80` : 'none' }
              : { shadowColor: pressed ? service.color : 'transparent', shadowOpacity: pressed ? 0.5 : 0, shadowRadius: 12, elevation: pressed ? 8 : 0 }),
          },
        ]}
        accessible
        accessibilityLabel={`Ligar ${service.label} no ${service.phone}`}
        accessibilityRole="button"
      >
        <View style={[styles.emergencyIconBg, { backgroundColor: service.color + '20' }]}>
          <MaterialCommunityIcons name={service.icon as any} size={18} color={service.color} />
        </View>
        <NeonText variant="caption" color={service.color} style={styles.emergencyLabel} numberOfLines={1}>
          {service.label}
        </NeonText>
        <NeonText variant="caption" color={'rgba(255,255,255,0.4)'} style={{ fontSize: 9 }}>
          {service.phone}
        </NeonText>
      </Pressable>
    </Animated.View>
  );
}

function LevelListModal({ reputation, visible, onClose }: { reputation: number; visible: boolean; onClose: () => void }) {
  const { colors } = useA11y();
  const isWeb = Platform.OS === 'web';
  const currentBadge = getBadgeForReputation(reputation);
  const currentIdx = BADGES.findIndex((b) => b.badgeId === currentBadge.badgeId);
  const nextBadge = currentIdx < BADGES.length - 1 ? BADGES[currentIdx + 1] : null;
  const ptsToNext = nextBadge ? nextBadge.minReputation - reputation : 0;

  if (!visible) return null;

  return (
    <View style={{
      position: 'absolute' as any, top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 9999, justifyContent: 'center', alignItems: 'center',
      ...(isWeb ? { position: 'fixed' } as any : {}),
    }}>
      <Pressable
        onPress={onClose}
        style={{
          position: 'absolute' as any, top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          ...(isWeb ? { backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' } as any : {}),
        }}
      />
      <View style={{
        width: 360, maxWidth: '92%', maxHeight: '82%',
        padding: Spacing.lg, borderRadius: 18, borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.10)',
        backgroundColor: 'rgba(10,12,22,0.96)',
        zIndex: 10000,
        ...(isWeb ? {
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05) inset',
          animation: 'overlay-slide-in 0.25s ease-out',
        } as any : {}),
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md }}>
          <NeonText variant="label" color={colors.textSecondary} style={{ fontSize: 11, letterSpacing: 1 }}>
            PROGRESSÃO DE NÍVEL
          </NeonText>
          <Pressable onPress={onClose} style={{
            width: 28, height: 28, borderRadius: 8,
            backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center',
            ...(isWeb ? { cursor: 'pointer', transition: 'background 0.2s ease' } as any : {}),
          }}>
            <MaterialCommunityIcons name="close" size={16} color={colors.textTertiary} />
          </Pressable>
        </View>
        <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator nestedScrollEnabled>
          {BADGES.map((b) => {
            const unlocked = reputation >= b.minReputation;
            const isCurrent = b.badgeId === currentBadge.badgeId;
            return (
              <View key={b.badgeId} style={{
                flexDirection: 'row', alignItems: 'center', height: 38, gap: 8,
                paddingHorizontal: 8, borderLeftWidth: 3, borderRadius: 6, marginBottom: 2,
                opacity: unlocked ? 1 : 0.35,
                backgroundColor: isCurrent ? b.color + '18' : 'transparent',
                borderLeftColor: isCurrent ? b.color : 'transparent',
                ...(isWeb && isCurrent ? { boxShadow: `inset 0 0 20px ${b.glowColor}15` } as any : {}),
              }}>
                <NeonText style={{ fontSize: 18, width: 24, textAlign: 'center' }}>
                  {unlocked ? b.icon : '🔒'}
                </NeonText>
                <NeonText variant="caption" color={isCurrent ? b.color : colors.textTertiary}
                  style={{ fontSize: 11, fontWeight: '800', width: 20, textAlign: 'center' }}>
                  {b.level}
                </NeonText>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <NeonText variant="caption" color={isCurrent ? b.color : unlocked ? colors.textPrimary : colors.textTertiary}
                    style={{ fontSize: 12, fontWeight: isCurrent ? '800' : '500' }} numberOfLines={1}>
                    {b.name}
                  </NeonText>
                  <NeonText variant="caption" color={colors.textTertiary} style={{ fontSize: 9 }} numberOfLines={1}>
                    {b.nameEN} · {b.minReputation.toLocaleString()} pts
                  </NeonText>
                </View>
                {isCurrent && (
                  <View style={{
                    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
                    backgroundColor: b.color + '25', borderWidth: 1, borderColor: b.color + '40',
                  }}>
                    <NeonText variant="caption" color={b.color} style={{ fontSize: 7, fontWeight: '800', letterSpacing: 0.5 }}>ATUAL</NeonText>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
        {nextBadge && (
          <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', paddingTop: Spacing.sm, marginTop: Spacing.sm, alignItems: 'center' }}>
            <NeonText variant="caption" color={nextBadge.color} style={{ fontSize: 11, fontWeight: '700' }}>
              Próximo: {nextBadge.icon} {nextBadge.name} — faltam {ptsToNext.toLocaleString()} pts
            </NeonText>
          </View>
        )}
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { colors, reducedMotion } = useA11y();
  const haptics = useHaptics();
  const { isDesktop } = useResponsive();
  const { user, signOut } = useAuthStore();
  const currentLocale = useLanguageStore((s) => s.locale);
  const setLocale = useLanguageStore((s) => s.setLocale);
  const isLightTheme = useAccessibilityStore((s) => s.lightTheme);
  const setA11y = useAccessibilityStore((s) => s.set);

  const [sosContact, setSosContact] = useState('Contato SOS — configurar');
  const [showSosConfig, setShowSosConfig] = useState(false);
  const [sosInput, setSosInput] = useState('');
  const [showLevelList, setShowLevelList] = useState(false);

  const headerOpacity = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;
  const headerSlide = useRef(new Animated.Value(reducedMotion ? 0 : -20)).current;
  const contentOpacity = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;
  const contentSlide = useRef(new Animated.Value(reducedMotion ? 0 : 24)).current;
  const avatarScale = useRef(new Animated.Value(reducedMotion ? 1 : 0.8)).current;
  const avatarRingPulse = useRef(new Animated.Value(1)).current;
  const repBarAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reducedMotion) return;
    Animated.sequence([
      Animated.parallel([
        Animated.timing(headerOpacity, { toValue: 1, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.spring(headerSlide, { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 4 }),
        Animated.spring(avatarScale, { toValue: 1, useNativeDriver: true, speed: 10, bounciness: 8 }),
      ]),
      Animated.parallel([
        Animated.timing(contentOpacity, { toValue: 1, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.spring(contentSlide, { toValue: 0, useNativeDriver: true, speed: 12, bounciness: 3 }),
      ]),
    ]).start();
    Animated.timing(repBarAnim, { toValue: 1, duration: 1200, delay: 600, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();

    const ringPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(avatarRingPulse, { toValue: 1.08, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(avatarRingPulse, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    ringPulse.start();
    return () => ringPulse.stop();
  }, [reducedMotion]);

  if (!user) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <MaterialCommunityIcons name="shield-account" size={64} color={colors.textTertiary} />
        <NeonText variant="h4" color={colors.textSecondary} style={{ marginTop: Spacing.lg }}>
          Entre para continuar
        </NeonText>
        <NeonButton title="Entrar" onPress={() => router.replace('/(auth)/sign-in')} style={{ marginTop: Spacing.xl }} />
      </View>
    );
  }

  const badge = getBadgeForReputation(user.reputation);
  const maxWidth = isDesktop ? 640 : undefined;
  const mw = maxWidth ? { maxWidth, width: '100%' as const } : undefined;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[styles.scrollContent, isDesktop && { alignItems: 'center' }]}
      showsVerticalScrollIndicator={false}
    >
      {/* 1 — Header */}
      <Animated.View style={[styles.header, mw, { opacity: headerOpacity, transform: [{ translateY: headerSlide }] }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm }}>
          <LogoMark size={22} color={Colors.primary} />
        </View>
        <View style={styles.profileRow}>
          <Animated.View style={[styles.avatar, { borderColor: badge.color, transform: [{ scale: Animated.multiply(avatarScale, avatarRingPulse) }], ...(Platform.OS === 'web' ? { boxShadow: `0 0 20px ${badge.glowColor}`, transition: 'box-shadow 0.4s ease' } : { shadowColor: badge.glowColor }) } as any]}>
            <NeonText variant="h2" style={{ fontSize: 28 }}>{user.displayName.charAt(0).toUpperCase()}</NeonText>
            {user.isGuardian && (
              <View style={[styles.guardianPip, { backgroundColor: colors.background }]}>
                <NeonText style={{ fontSize: 12 }}>🛡️</NeonText>
              </View>
            )}
          </Animated.View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <NeonText variant="h3" numberOfLines={1}>{user.displayName}</NeonText>
            <Pressable
              onPress={() => { haptics.light(); setShowLevelList(true); }}
              style={({ pressed }) => ({
                flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4,
                opacity: pressed ? 0.7 : 1,
                ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'opacity 0.15s ease' } as any : {}),
              })}
              accessibilityLabel={`Nível ${badge.level}: ${badge.name}. Toque para ver todos.`}
              accessibilityRole="button"
            >
              <NeonText style={{ fontSize: 16 }}>{badge.icon}</NeonText>
              <NeonText variant="bodySm" color={badge.color} glow={badge.glowColor + '50'} style={{ fontWeight: '800' }}>
                {badge.name}
              </NeonText>
              <NeonText variant="caption" color={colors.textTertiary} style={{ fontSize: 10 }}>
                Nv.{badge.level}
              </NeonText>
              <MaterialCommunityIcons name="chevron-right" size={14} color={colors.textTertiary} />
            </Pressable>
          </View>
        </View>
      </Animated.View>

      {/* 2 — Reputation + Progress */}
      <Animated.View style={{ opacity: contentOpacity, transform: [{ translateY: contentSlide }] }}>
      <GlassCard style={[styles.repCard, mw]} glowColor={badge.glowColor + '30'}
        accessibilityLabel={`Reputação: ${user.reputation.toLocaleString()} pontos. ${badge.nameEN}.`}>
        <View style={styles.repRow}>
          <NeonText variant="label" color={colors.textSecondary}>Reputação</NeonText>
          <NeonText variant="h3" color={badge.color} glow={badge.glowColor}>
            {user.reputation.toLocaleString()}
          </NeonText>
        </View>
        {user.isGuardian ? (
          <View style={[styles.progressBg, { backgroundColor: Colors.primary + '15', justifyContent: 'center', alignItems: 'center', height: 22, borderRadius: Radius.sm }]}>
            <NeonText variant="caption" color={Colors.primary} style={{ fontWeight: '700', fontSize: 10 }}>
              NÍVEL MÁXIMO
            </NeonText>
          </View>
        ) : (
          <View style={[styles.progressBg, { backgroundColor: colors.glass.background }]}>
            <Animated.View style={[styles.progressFill, {
              width: repBarAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${getProgressToNextLevel(user.reputation, badge) * 100}%`] }),
              backgroundColor: badge.color,
              ...(Platform.OS === 'web' ? { boxShadow: `0 0 8px ${badge.glowColor}` } : { shadowColor: badge.glowColor }),
            }]} />
          </View>
        )}
      </GlassCard>

      {/* 3 — Stats Grid */}
      <View style={[styles.statsGrid, mw]}>
        <StatCard icon="file-document-edit" label="Relatórios" value={user.totalReports.toLocaleString()} color={Colors.primary} />
        <StatCard icon="check-circle" label="Confirmações" value={user.totalConfirmations.toLocaleString()} color={Colors.success} />
        <StatCard icon="calendar-today" label="Hoje"
          value={user.dailyReportLimit === -1 ? `${user.reportsToday}/∞` : `${user.reportsToday}/${user.dailyReportLimit}`}
          color={Colors.warning} />
      </View>
      {user.isGuardian && (
        <View style={[styles.statsGrid, mw]}>
          <StatCard icon="check-decagram" label="Verificados" value={user.verifiedIncidents ?? 0} color={Colors.primary} />
          <StatCard icon="delete-circle" label="Removidos" value={user.removedIncidents ?? 0} color={Colors.error} />
          <StatCard icon="account-supervisor" label="Mentorados" value={user.mentees ?? 0} color={Colors.secondary} />
        </View>
      )}

      {/* 4 — SOS & Pânico */}
      <View style={[styles.sosSection, mw]}>
        <View style={styles.sosRow}>
          <Pressable
            onPress={() => {
              haptics.heavy();
              showToast('🚨 Alerta enviado ao grupo familiar!');
              announce('Alerta enviado ao grupo familiar');
            }}
            style={({ pressed }) => [styles.sosBtn, {
              backgroundColor: pressed ? '#FF2D5520' : '#FF2D5510',
              borderColor: '#FF2D5540',
              transform: [{ scale: pressed ? 0.96 : 1 }],
            }]}
            accessible accessibilityLabel="Alerta Família" accessibilityRole="button"
          >
            <NeonText style={{ fontSize: 20 }}>🚨</NeonText>
            <NeonText variant="bodySm" color="#FF2D55" style={{ fontWeight: '800', fontSize: 12 }}>
              Alerta Família
            </NeonText>
          </Pressable>
          <Pressable
            onPress={() => {
              haptics.heavy();
              showToast(`🆘 SOS enviado para ${sosContact}`);
              announce(`SOS enviado para ${sosContact}`);
            }}
            style={({ pressed }) => [styles.sosBtn, {
              backgroundColor: pressed ? '#FF950020' : '#FF950010',
              borderColor: '#FF950040',
              transform: [{ scale: pressed ? 0.96 : 1 }],
            }]}
            accessible accessibilityLabel="S.O.S." accessibilityRole="button"
          >
            <NeonText style={{ fontSize: 20 }}>🆘</NeonText>
            <NeonText variant="bodySm" color="#FF9500" style={{ fontWeight: '800', fontSize: 12 }}>
              S.O.S.
            </NeonText>
          </Pressable>
        </View>
        <Pressable onPress={() => setShowSosConfig(!showSosConfig)}>
          <NeonText variant="caption" color={colors.textTertiary} style={styles.sosConfigLink}>
            {sosContact} · Configurar
          </NeonText>
        </Pressable>
        {showSosConfig && (
          <View style={styles.sosConfigRow}>
            <TextInput
              value={sosInput}
              onChangeText={setSosInput}
              placeholder="Nome ou número do contato"
              placeholderTextColor={colors.textTertiary}
              style={[styles.sosInput, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.04)' }]}
            />
            <Pressable
              onPress={() => {
                if (sosInput.trim()) {
                  setSosContact(sosInput.trim());
                  setShowSosConfig(false);
                  setSosInput('');
                  showToast('✅ Contato SOS atualizado');
                }
              }}
              style={[styles.sosSaveBtn, { backgroundColor: Colors.primary + '20', borderColor: Colors.primary + '40' }]}
            >
              <NeonText variant="caption" color={Colors.primary} style={{ fontWeight: '700' }}>Salvar</NeonText>
            </Pressable>
          </View>
        )}
      </View>

      {/* 5 — Emergência */}
      <View style={[styles.emergencySection, mw]}>
        <View style={styles.emergencySectionHeader}>
          <MaterialCommunityIcons name="phone-alert" size={16} color={Colors.error} />
          <NeonText variant="label" color={Colors.error} style={{ marginLeft: Spacing.xs, fontSize: 11 }}>
            Serviços de Emergência
          </NeonText>
        </View>
        <View style={styles.emergencyGrid}>
          {EMERGENCY_SERVICES.map((svc) => (
            <EmergencyButton key={svc.id} service={svc} />
          ))}
        </View>
      </View>

      {/* 6 — Preferências */}
      <View style={[styles.settingsSection, mw]}>
        <View style={styles.settingRow}>
          <View style={styles.settingLabelRow}>
            <MaterialCommunityIcons name="theme-light-dark" size={16} color={colors.textSecondary} />
            <NeonText variant="bodySm" color={colors.textPrimary} style={{ marginLeft: Spacing.xs }}>Tema</NeonText>
          </View>
          <View style={styles.themeToggle}>
            <Pressable
              onPress={() => { haptics.light(); setA11y('lightTheme', false); }}
              style={({ pressed }) => [styles.themeBtn, {
                backgroundColor: !isLightTheme ? colors.primary + '20' : 'transparent',
                borderColor: !isLightTheme ? colors.primary : colors.border,
                transform: [{ scale: pressed ? 0.92 : 1 }],
              }]}
            >
              <MaterialCommunityIcons name="weather-night" size={14} color={!isLightTheme ? colors.primary : colors.textTertiary} />
              <NeonText variant="caption" color={!isLightTheme ? colors.primary : colors.textTertiary}> Escuro</NeonText>
            </Pressable>
            <Pressable
              onPress={() => { haptics.light(); setA11y('lightTheme', true); }}
              style={({ pressed }) => [styles.themeBtn, {
                backgroundColor: isLightTheme ? colors.primary + '20' : 'transparent',
                borderColor: isLightTheme ? colors.primary : colors.border,
                transform: [{ scale: pressed ? 0.92 : 1 }],
              }]}
            >
              <MaterialCommunityIcons name="white-balance-sunny" size={14} color={isLightTheme ? colors.primary : colors.textTertiary} />
              <NeonText variant="caption" color={isLightTheme ? colors.primary : colors.textTertiary}> Claro</NeonText>
            </Pressable>
          </View>
        </View>
        <View style={styles.settingRow}>
          <View style={styles.settingLabelRow}>
            <MaterialCommunityIcons name="translate" size={16} color={colors.textSecondary} />
            <NeonText variant="bodySm" color={colors.textPrimary} style={{ marginLeft: Spacing.xs }}>Idioma</NeonText>
          </View>
          <View style={styles.langRow}>
            {AVAILABLE_LANGUAGES.map((lang) => {
              const isActive = currentLocale === lang.code;
              return (
                <Pressable
                  key={lang.code}
                  onPress={() => { haptics.selection(); setLocale(lang.code); announce(`Idioma alterado para ${lang.name}`); }}
                  style={({ pressed }) => [styles.langChip, {
                    backgroundColor: isActive ? colors.primary + '20' : 'transparent',
                    borderColor: isActive ? colors.primary : colors.border,
                    transform: [{ scale: pressed ? 0.92 : 1 }],
                  }]}
                >
                  <NeonText variant="caption" color={isActive ? colors.primary : colors.textTertiary} style={{ fontWeight: isActive ? '700' : '400' }}>
                    {lang.code === 'pt-BR' ? 'PT' : lang.code.toUpperCase()}
                  </NeonText>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {/* 7 — Menu */}
      <GlassCard noPadding style={[styles.menuCard, mw]}>
        <MenuRow icon="cog" label="Configurações" hint="Abrir configurações" onPress={() => router.push('/settings')} />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <MenuRow icon="human-accessible" label="Acessibilidade"
          hint="Configurar opções de acessibilidade" color={Colors.secondary}
          onPress={() => router.push('/settings/accessibility')} />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <MenuRow icon={user.isGhostMode ? 'eye-off' : 'eye'} label="Modo Fantasma"
          hint={user.isGhostMode ? 'Atualmente invisível no mapa' : 'Alternar visibilidade no mapa público'}
          badge={user.isGhostMode ? 'ATIVO' : undefined}
          color={user.isGhostMode ? '#00AAFF' : undefined}
          onPress={() => {
            haptics.medium();
            const newVal = !user.isGhostMode;
            useAuthStore.getState().updateProfile({ isGhostMode: newVal });
            showToast(newVal ? '👻 Modo Fantasma ativado — você está invisível' : '👁 Modo Fantasma desativado — visível no mapa');
            announce(newVal ? 'Modo fantasma ativado' : 'Modo fantasma desativado');
          }} />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <MenuRow icon="share-variant" label="Compartilhar Localização"
          hint="Criar link temporário de compartilhamento"
          onPress={() => {
            haptics.light();
            const shareUrl = `https://alert.io/loc/${user.uid.slice(0, 8)}?t=${Date.now()}`;
            if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
              navigator.clipboard.writeText(shareUrl).then(() => {
                showToast('📋 Link copiado! Válido por 30 minutos.');
              });
            }
            announce('Link de localização copiado para a área de transferência');
          }} />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <MenuRow icon="logout" label="Sair" hint="Sair da sua conta" danger
          onPress={() => { signOut(); router.replace('/(auth)/sign-in'); }} />
      </GlassCard>
      </Animated.View>
    </ScrollView>
    <LevelListModal reputation={user.reputation} visible={showLevelList} onClose={() => setShowLevelList(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: Spacing['6xl'] },

  header: {
    paddingTop: Platform.OS === 'web' ? 20 : Platform.OS === 'ios' ? 56 : 40,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    position: 'relative',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 0 18px rgba(0,0,0,0.5)' } as any
      : { shadowOpacity: 0.5, shadowRadius: 18, elevation: 6 }),
  },
  guardianPip: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },

  repCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  repRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  progressBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 0 6px rgba(0,0,0,0.6)' } as any
      : { shadowOpacity: 0.6, shadowRadius: 6 }),
  },

  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statCard: { flex: 1, alignItems: 'center', padding: Spacing.md },
  statValue: { marginTop: 2, marginBottom: 1, fontSize: 16 },

  sosSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sosRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  sosBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    ...(Platform.OS === 'web' ? { transition: 'all 0.2s ease', cursor: 'pointer' } as any : {}),
  },
  sosConfigLink: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: Spacing.xs,
    textDecorationLine: 'underline',
  },
  sosConfigRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    alignItems: 'center',
  },
  sosInput: {
    flex: 1,
    height: 34,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    fontSize: 12,
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
  sosSaveBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.md,
    borderWidth: 1,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } as any : {}),
  },

  emergencySection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  emergencySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  emergencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  emergencyBtnWrapper: {
    width: '31%',
    minWidth: 90,
    flexGrow: 1,
  },
  emergencyBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: 4,
    borderRadius: Radius.md,
    borderWidth: 1,
    ...(Platform.OS === 'web' ? { transition: 'all 0.25s cubic-bezier(0.25,0.8,0.25,1)', cursor: 'pointer' } as any : {}),
  },
  emergencyIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  emergencyLabel: {
    fontWeight: '700',
    fontSize: 10,
    marginBottom: 1,
  },

  settingsSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeToggle: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  themeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    ...(Platform.OS === 'web' ? { transition: 'all 0.25s ease', cursor: 'pointer' } as any : {}),
  },
  langRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  langChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    minWidth: 34,
    alignItems: 'center',
    ...(Platform.OS === 'web' ? { transition: 'all 0.2s ease', cursor: 'pointer' } as any : {}),
  },

  menuCard: { marginHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    ...(Platform.OS === 'web' ? { transition: 'all 0.2s ease', cursor: 'pointer' } as any : {}),
  },
  menuLabel: { flex: 1, marginLeft: Spacing.md },
  menuBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    marginRight: Spacing.sm,
  },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: Spacing['4xl'] },
});
