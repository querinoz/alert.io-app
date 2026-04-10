import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, FlatList, Platform, Pressable, Animated, Easing } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NeonText } from '../../src/components/ui/NeonText';
import { LogoMark } from '../../src/components/ui/LogoMark';
import { NeonButton } from '../../src/components/ui/NeonButton';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { useA11y, announce } from '../../src/hooks/useAccessibility';
import { useHaptics } from '../../src/hooks/useHaptics';
import { useResponsive } from '../../src/hooks/useResponsive';
import { useFamilyStore } from '../../src/stores/familyStore';
import { Colors } from '../../src/theme/colors';
import { Spacing, Radius } from '../../src/theme/spacing';
import type { FamilyMember } from '../../src/types';

const roleColors: Record<string, string> = {
  admin: Colors.primary, member: Colors.secondary, kid: Colors.warning,
};
const roleLabels: Record<string, string> = {
  admin: 'Admin', member: 'Membro', kid: 'Modo Criança',
};
const roleIcons: Record<string, string> = {
  admin: 'shield-account', member: 'account', kid: 'account-child',
};

function BreathingDot({ color, borderColor }: { color: string; borderColor: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.3, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);
  return (
    <Animated.View style={[styles.onlineDot, { backgroundColor: color, borderColor, transform: [{ scale }] }]} />
  );
}

function MemberCard({ member, onLocate }: { member: FamilyMember; onLocate: () => void }) {
  const { colors } = useA11y();
  const haptics = useHaptics();
  const color = roleColors[member.role];

  const statusLabel = member.isOnline
    ? member.role === 'kid'
      ? member.isInSafeZone ? 'Na zona segura' : '⚠ Fora da zona segura!'
      : 'Online'
    : 'Offline';

  return (
    <GlassCard style={styles.memberCard}
      glowColor={member.role === 'kid' && !member.isInSafeZone ? Colors.error + '20' : undefined}
      accessibilityLabel={`${member.displayName}, ${roleLabels[member.role]}, ${statusLabel}${member.batteryLevel != null ? `, battery ${member.batteryLevel}%` : ''}`}>
      <View style={styles.memberRow}>
        <View style={[styles.avatar, { backgroundColor: color + '15', borderColor: color }]}>
          <MaterialCommunityIcons name={roleIcons[member.role] as any} size={24} color={color} />
          {member.isOnline && (
            <BreathingDot color={Colors.success} borderColor={colors.surface} />
          )}
        </View>

        <View style={styles.memberInfo}>
          <View style={styles.memberNameRow}>
            <NeonText variant="body" style={{ fontWeight: '600' }}>{member.displayName}</NeonText>
            {member.role === 'kid' && (
              <View style={[styles.kidTag, { backgroundColor: Colors.warning + '15' }]}>
                <NeonText variant="caption" color={Colors.warning} style={{ fontWeight: '700', fontSize: 10 }}>
                  KID
                </NeonText>
              </View>
            )}
          </View>
          <View style={styles.memberMeta}>
            <NeonText variant="caption" color={color}>{roleLabels[member.role]}</NeonText>
            {member.role === 'kid' && member.isInSafeZone !== undefined && (
              <View style={styles.safeZoneTag}>
                <MaterialCommunityIcons
                  name={member.isInSafeZone ? 'check-circle' : 'alert-circle'} size={12}
                  color={member.isInSafeZone ? Colors.success : Colors.error} />
                <NeonText variant="caption" color={member.isInSafeZone ? Colors.success : Colors.error}>
                  {member.isInSafeZone ? 'Zona Segura' : 'Fora da Zona'}
                </NeonText>
              </View>
            )}
          </View>
        </View>

        <View style={styles.memberActions}>
          {member.batteryLevel != null && (
            <View style={styles.battery} accessible accessibilityLabel={`Battery ${member.batteryLevel}%`}>
              <MaterialCommunityIcons
                name={member.batteryLevel > 50 ? 'battery-high' : member.batteryLevel > 20 ? 'battery-medium' : 'battery-low'}
                size={16}
                color={member.batteryLevel > 50 ? Colors.success : member.batteryLevel > 20 ? Colors.warning : Colors.error} />
              <NeonText variant="caption" color={colors.textTertiary}>{member.batteryLevel}%</NeonText>
            </View>
          )}
          {member.locationSharingEnabled && member.isOnline && member.location && (
            <Pressable onPress={() => { haptics.light(); onLocate(); }}
              style={({ pressed }) => [styles.locateBtn, {
                backgroundColor: pressed ? Colors.primary + '30' : Colors.primary + '12',
                transform: [{ scale: pressed ? 0.88 : 1 }],
              }]}
              accessible accessibilityLabel={`Locate ${member.displayName} on map`} accessibilityRole="button">
              <MaterialCommunityIcons name="crosshairs-gps" size={16} color={Colors.primary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Kid details expanded */}
      {member.role === 'kid' && member.isOnline && (
        <View style={[styles.kidDetails, { borderTopColor: colors.border }]}>
          <View style={styles.kidDetailRow}>
            <MaterialCommunityIcons name="map-marker-radius" size={14} color={Colors.primary} />
            <NeonText variant="caption" color={colors.textSecondary} style={{ marginLeft: 4 }}>
              Localização: Ativa • Atualiza a cada 30s
            </NeonText>
          </View>
          <View style={styles.kidDetailRow}>
            <MaterialCommunityIcons name="shield-check" size={14} color={Colors.success} />
            <NeonText variant="caption" color={colors.textSecondary} style={{ marginLeft: 4 }}>
              Zona Segura: Escola (raio de 500m) — {member.isInSafeZone ? 'Dentro' : 'FORA'}
            </NeonText>
          </View>
          <View style={styles.kidDetailRow}>
            <MaterialCommunityIcons name="bell-ring" size={14} color={Colors.warning} />
            <NeonText variant="caption" color={colors.textSecondary} style={{ marginLeft: 4 }}>
              Alertas: Saída de zona, Bateria fraca, SOS
            </NeonText>
          </View>
        </View>
      )}
    </GlassCard>
  );
}

export default function FamilyScreen() {
  const { colors, minTarget, reducedMotion } = useA11y();
  const haptics = useHaptics();
  const { isDesktop } = useResponsive();
  const { activeGroup, members, isLoading, loadFamily, sendCheckIn } = useFamilyStore();
  const [checkInSent, setCheckInSent] = useState(false);
  const [kidMonitorEnabled, setKidMonitorEnabled] = useState<Record<string, boolean>>({});
  const [monitorLocked, setMonitorLocked] = useState<Record<string, boolean>>({});

  const headerOpacity = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;
  const headerSlide = useRef(new Animated.Value(reducedMotion ? 0 : -16)).current;
  const listOpacity = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;
  const listSlide = useRef(new Animated.Value(reducedMotion ? 0 : 20)).current;

  useEffect(() => { loadFamily(); }, []);

  useEffect(() => {
    if (reducedMotion) return;
    Animated.sequence([
      Animated.parallel([
        Animated.timing(headerOpacity, { toValue: 1, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.spring(headerSlide, { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 4 }),
      ]),
      Animated.parallel([
        Animated.timing(listOpacity, { toValue: 1, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.spring(listSlide, { toValue: 0, useNativeDriver: true, speed: 12, bounciness: 3 }),
      ]),
    ]).start();
  }, [reducedMotion]);

  const maxWidth = isDesktop ? 640 : undefined;

  const handleCheckIn = () => {
    haptics.success();
    sendCheckIn();
    setCheckInSent(true);
    announce("Check-in enviado! Sua família sabe que está bem.");
    setTimeout(() => setCheckInSent(false), 3000);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }, isDesktop && { alignItems: 'center' }]}>
      <Animated.View style={[styles.header, maxWidth ? { maxWidth, width: '100%' } : undefined, { opacity: headerOpacity, transform: [{ translateY: headerSlide }] }]}>
        <View style={styles.headerTitleRow}>
          <LogoMark size={28} color={Colors.primary} />
          <View style={styles.headerTitleText}>
            <NeonText variant="h2" glow={colors.primaryGlow}>Família</NeonText>
            {activeGroup && (
              <NeonText variant="bodySm" color={colors.textSecondary}>
                {activeGroup.name} • {activeGroup.memberCount}/{activeGroup.maxMembers} membros
              </NeonText>
            )}
          </View>
        </View>
      </Animated.View>

      {activeGroup && (
        <FlatList
          data={[null, ...members]}
          keyExtractor={(item, i) => item?.uid ?? `header-${i}`}
          contentContainerStyle={[styles.list, maxWidth ? { maxWidth, width: '100%', alignSelf: 'center' } : undefined]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              {/* Invite code */}
              <GlassCard style={styles.inviteCard} glowColor={colors.primary + '20'}>
                <View style={styles.inviteRow}>
                  <View>
                    <NeonText variant="label" color={colors.textSecondary}>Código de Convite</NeonText>
                    <NeonText variant="h3" color={colors.primary} glow={colors.primaryGlow}>
                      {activeGroup.inviteCode}
                    </NeonText>
                  </View>
                  <Pressable onPress={() => { haptics.light(); announce('Código de convite copiado'); }}
                    style={[styles.copyBtn, { backgroundColor: colors.primary + '15', minHeight: minTarget, minWidth: minTarget }]}
                    accessible accessibilityLabel={`Copy invite code ${activeGroup.inviteCode}`} accessibilityRole="button">
                    <MaterialCommunityIcons name="content-copy" size={20} color={colors.primary} />
                  </Pressable>
                </View>
              </GlassCard>

              {/* Quick actions */}
              <View style={styles.quickActions}>
                <NeonButton
                  title={checkInSent ? "Enviado! ✓" : "Estou Bem"}
                  icon={checkInSent ? "check-circle" : "hand-wave"}
                  onPress={handleCheckIn}
                  size="md" style={styles.quickBtn}
                  disabled={checkInSent}
                  accessibilityHint="Enviar check-in de segurança para sua família" />
                <NeonButton
                  title="Compartilhar Localização" icon="map-marker-radius"
                  onPress={() => { haptics.light(); announce('Localização compartilhada com a família'); }}
                  variant="secondary" size="md" style={styles.quickBtn}
                  accessibilityHint="Compartilhar localização em tempo real com familiares" />
              </View>

              {/* Kid mode status + Audio/Video monitoring */}
              {members.filter((m) => m.role === 'kid').map((kid) => {
                const isEnabled = kidMonitorEnabled[kid.uid] ?? false;
                const isLocked = monitorLocked[kid.uid] ?? false;
                return (
                  <GlassCard key={`kid-${kid.uid}`} style={styles.kidModeCard} glowColor={Colors.warning + '15'}>
                    <View style={styles.kidModeHeader}>
                      <MaterialCommunityIcons name="account-child-circle" size={22} color={Colors.warning} />
                      <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                        <NeonText variant="label" color={Colors.warning}>
                          {kid.displayName} — Modo Criança
                        </NeonText>
                        <NeonText variant="caption" color={colors.textSecondary} style={{ fontSize: 10 }}>
                          Rastreamento, zona segura e alertas ativos
                        </NeonText>
                      </View>
                    </View>

                    {/* Audio/Video Monitor */}
                    <View style={{
                      marginTop: Spacing.md, padding: Spacing.md,
                      borderRadius: Radius.md, borderWidth: 1,
                      borderColor: isEnabled ? '#FF3B7A40' : colors.border,
                      backgroundColor: isEnabled ? '#FF3B7A08' : 'rgba(255,255,255,0.02)',
                    }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={{
                          width: 32, height: 32, borderRadius: 8,
                          backgroundColor: isEnabled ? '#FF3B7A20' : 'rgba(255,255,255,0.05)',
                          justifyContent: 'center', alignItems: 'center',
                        }}>
                          <MaterialCommunityIcons name={isEnabled ? 'video' : 'video-off'} size={18} color={isEnabled ? '#FF3B7A' : colors.textTertiary} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <NeonText variant="bodySm" color={isEnabled ? '#FF3B7A' : colors.textPrimary} style={{ fontWeight: '700', fontSize: 12 }}>
                            Monitoramento Áudio & Vídeo
                          </NeonText>
                          <NeonText variant="caption" color={colors.textTertiary} style={{ fontSize: 9 }}>
                            {isLocked
                              ? (isEnabled ? '🔒 Ativado permanentemente — não pode ser alterado' : '🔒 Desativado permanentemente')
                              : '⚠️ Após ativar/desativar, esta opção será permanente'}
                          </NeonText>
                        </View>
                      </View>

                      {!isLocked ? (
                        <View style={{ flexDirection: 'row', gap: 8, marginTop: Spacing.sm }}>
                          <Pressable
                            onPress={() => {
                              haptics.heavy();
                              setKidMonitorEnabled((p) => ({ ...p, [kid.uid]: true }));
                              setMonitorLocked((p) => ({ ...p, [kid.uid]: true }));
                              announce(`Monitoramento de ${kid.displayName} ativado permanentemente`);
                            }}
                            style={({ pressed }) => ({
                              flex: 1, paddingVertical: 10, borderRadius: Radius.md,
                              backgroundColor: pressed ? '#FF3B7A30' : '#FF3B7A15',
                              borderWidth: 1, borderColor: '#FF3B7A40',
                              alignItems: 'center',
                              ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'all 0.2s ease' } as any : {}),
                            })}
                          >
                            <NeonText variant="caption" color="#FF3B7A" style={{ fontWeight: '800', fontSize: 10 }}>
                              ATIVAR
                            </NeonText>
                          </Pressable>
                          <Pressable
                            onPress={() => {
                              haptics.medium();
                              setKidMonitorEnabled((p) => ({ ...p, [kid.uid]: false }));
                              setMonitorLocked((p) => ({ ...p, [kid.uid]: true }));
                              announce(`Monitoramento de ${kid.displayName} desativado permanentemente`);
                            }}
                            style={({ pressed }) => ({
                              flex: 1, paddingVertical: 10, borderRadius: Radius.md,
                              backgroundColor: pressed ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                              borderWidth: 1, borderColor: colors.border,
                              alignItems: 'center',
                              ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'all 0.2s ease' } as any : {}),
                            })}
                          >
                            <NeonText variant="caption" color={colors.textTertiary} style={{ fontWeight: '700', fontSize: 10 }}>
                              NÃO ATIVAR
                            </NeonText>
                          </Pressable>
                        </View>
                      ) : isEnabled ? (
                        <View style={{ flexDirection: 'row', gap: 8, marginTop: Spacing.sm }}>
                          <Pressable
                            onPress={() => { haptics.light(); announce(`Ouvindo áudio de ${kid.displayName}...`); }}
                            style={({ pressed }) => ({
                              flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                              paddingVertical: 10, borderRadius: Radius.md,
                              backgroundColor: pressed ? '#FF3B7A25' : '#FF3B7A10',
                              borderWidth: 1, borderColor: '#FF3B7A30',
                              ...(Platform.OS === 'web' ? { cursor: 'pointer' } as any : {}),
                            })}
                          >
                            <MaterialCommunityIcons name="microphone" size={14} color="#FF3B7A" />
                            <NeonText variant="caption" color="#FF3B7A" style={{ fontWeight: '700', fontSize: 10 }}>Ouvir Áudio</NeonText>
                          </Pressable>
                          <Pressable
                            onPress={() => { haptics.light(); announce(`Visualizando câmera de ${kid.displayName}...`); }}
                            style={({ pressed }) => ({
                              flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                              paddingVertical: 10, borderRadius: Radius.md,
                              backgroundColor: pressed ? '#00AAFF25' : '#00AAFF10',
                              borderWidth: 1, borderColor: '#00AAFF30',
                              ...(Platform.OS === 'web' ? { cursor: 'pointer' } as any : {}),
                            })}
                          >
                            <MaterialCommunityIcons name="video" size={14} color="#00AAFF" />
                            <NeonText variant="caption" color="#00AAFF" style={{ fontWeight: '700', fontSize: 10 }}>Ver Câmera</NeonText>
                          </Pressable>
                        </View>
                      ) : null}
                    </View>
                  </GlassCard>
                );
              })}

              <NeonText variant="label" color={colors.textSecondary} style={styles.sectionTitle}>
                Membros ({members.length})
              </NeonText>
            </>
          }
          renderItem={({ item }) =>
            item ? (
              <MemberCard member={item} onLocate={() => announce(`Locating ${item.displayName} on map`)} />
            ) : null
          }
        />
      )}

      {!activeGroup && !isLoading && (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="account-group" size={64} color={colors.textTertiary} />
          <NeonText variant="h4" color={colors.textSecondary} style={styles.emptyTitle}>
            Nenhum Grupo Familiar
          </NeonText>
          <NeonText variant="body" color={colors.textTertiary} style={styles.emptyDesc}>
            Crie ou entre num grupo familiar para compartilhar localizações e manter-se conectado
          </NeonText>
          <View style={styles.emptyActions}>
            <NeonButton title="Criar Grupo" icon="plus" onPress={() => haptics.light()} />
            <NeonButton title="Entrar no Grupo" icon="login" onPress={() => haptics.light()} variant="secondary" />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: Platform.OS === 'web' ? 24 : Platform.OS === 'ios' ? 64 : 44,
    paddingHorizontal: Spacing.xl, paddingBottom: Spacing.md,
  },
  headerTitleRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
  },
  headerTitleText: { flex: 1 },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing['5xl'], gap: Spacing.sm },
  inviteCard: { marginBottom: Spacing.lg, padding: Spacing.lg },
  inviteRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  copyBtn: {
    borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.md,
    ...(Platform.OS === 'web' ? { transition: 'all 0.2s ease', cursor: 'pointer' } as any : {}),
  },
  quickActions: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
  quickBtn: { flex: 1 },

  kidModeCard: { padding: Spacing.lg, marginBottom: Spacing.lg },
  kidModeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },

  sectionTitle: { marginBottom: Spacing.md },
  memberCard: {
    padding: Spacing.lg,
    ...(Platform.OS === 'web' ? { transition: 'all 0.2s ease' } as any : {}),
  },
  memberRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 48, height: 48, borderRadius: 24, borderWidth: 1.5,
    justifyContent: 'center', alignItems: 'center', position: 'relative',
  },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 12, height: 12, borderRadius: 6, borderWidth: 2,
  },
  memberInfo: { flex: 1, marginLeft: Spacing.md },
  memberNameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  kidTag: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  memberMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 2 },
  safeZoneTag: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  memberActions: { alignItems: 'center', gap: Spacing.xs },
  battery: { alignItems: 'center' },
  locateBtn: {
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    ...(Platform.OS === 'web' ? { transition: 'all 0.2s ease', cursor: 'pointer' } as any : {}),
  },
  kidDetails: {
    marginTop: Spacing.md, paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth, gap: Spacing.xs,
  },
  kidDetailRow: { flexDirection: 'row', alignItems: 'center' },
  empty: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: Spacing['3xl'],
  },
  emptyTitle: { marginTop: Spacing.lg },
  emptyDesc: { textAlign: 'center', marginTop: Spacing.sm, marginBottom: Spacing.xl },
  emptyActions: { flexDirection: 'row', gap: Spacing.md },
});
