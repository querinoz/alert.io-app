import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform, Pressable, Switch, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NeonText } from '../../src/components/ui/NeonText';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { NeonButton } from '../../src/components/ui/NeonButton';
import { useA11y, announce } from '../../src/hooks/useAccessibility';
import { useHaptics } from '../../src/hooks/useHaptics';
import { useAccessibilityStore } from '../../src/stores/accessibilityStore';
import { Colors } from '../../src/theme/colors';
import { Spacing, Radius } from '../../src/theme/spacing';

interface A11yToggleProps {
  icon: string;
  label: string;
  description: string;
  value: boolean;
  onToggle: (val: boolean) => void;
  color?: string;
}

function A11yToggle({ icon, label, description, value, onToggle, color }: A11yToggleProps) {
  const { colors, minTarget } = useA11y();
  const haptics = useHaptics();

  return (
    <View style={[styles.toggleRow, { minHeight: minTarget }]}>
      <View
        style={[styles.toggleIcon, { backgroundColor: (color ?? Colors.secondary) + '15' }]}
        accessible={false}
      >
        <MaterialCommunityIcons name={icon as any} size={22} color={color ?? Colors.secondary} />
      </View>
      <View style={styles.toggleText}>
        <NeonText variant="body" style={{ fontWeight: '600' }}>
          {label}
        </NeonText>
        <NeonText variant="caption" color={colors.textTertiary}>
          {description}
        </NeonText>
      </View>
      <Switch
        value={value}
        onValueChange={(v) => {
          haptics.selection();
          onToggle(v);
          announce(`${label} ${v ? 'ativado' : 'desativado'}`);
        }}
        trackColor={{ false: colors.glass.background, true: (color ?? Colors.secondary) + '50' }}
        thumbColor={value ? (color ?? Colors.secondary) : colors.textTertiary}
        accessible
        accessibilityLabel={`${label}, atualmente ${value ? 'ativado' : 'desativado'}`}
        accessibilityHint={description}
        accessibilityRole="switch"
      />
    </View>
  );
}

export default function AccessibilityScreen() {
  const { colors, minTarget, reducedMotion } = useA11y();
  const haptics = useHaptics();
  const store = useAccessibilityStore();

  const entryOpacity = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;
  const entrySlide = useRef(new Animated.Value(reducedMotion ? 0 : 20)).current;

  useEffect(() => {
    if (reducedMotion) return;
    Animated.parallel([
      Animated.timing(entryOpacity, { toValue: 1, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(entrySlide, { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 3 }),
    ]).start();
  }, [reducedMotion]);

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
        <View>
          <NeonText variant="h3">Acessibilidade</NeonText>
          <NeonText variant="bodySm" color={colors.textSecondary}>
            Personalize a app para as suas necessidades
          </NeonText>
        </View>
      </View>

      {/* Vision */}
      <NeonText variant="label" color={Colors.secondary} style={styles.sectionTitle}>
        Visão
      </NeonText>
      <GlassCard noPadding style={styles.card}>
        <A11yToggle
          icon="contrast-box"
          label="Modo Alto Contraste"
          description="Aumenta o contraste das cores para melhor legibilidade. Bordas mais visíveis e texto mais brilhante."
          value={store.highContrast}
          onToggle={(v) => store.set('highContrast', v)}
          color="#00CCFF"
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <A11yToggle
          icon="format-size"
          label="Texto Grande"
          description="Aumenta o tamanho de todo o texto na app. Todas as fontes escalam proporcionalmente."
          value={store.largeText}
          onToggle={(v) => store.set('largeText', v)}
          color="#FFB800"
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <A11yToggle
          icon="text-to-speech"
          label="Otimizado para Leitor de Ecrã"
          description="Otimiza layouts e labels para VoiceOver e TalkBack. Adiciona contexto extra a todos os elementos interativos."
          value={store.screenReaderEnabled}
          onToggle={(v) => store.set('screenReaderEnabled', v)}
          color="#7B61FF"
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <A11yToggle
          icon="account-voice"
          label="Guia por Voz"
          description="Fornece descrições sonoras de eventos no mapa e dicas de navegação. Lê alertas de incidentes em voz alta."
          value={store.voiceGuidance}
          onToggle={(v) => store.set('voiceGuidance', v)}
          color="#FF3B7A"
        />
      </GlassCard>

      {/* Motor */}
      <NeonText variant="label" color={Colors.primary} style={styles.sectionTitle}>
        Motor & Interação
      </NeonText>
      <GlassCard noPadding style={styles.card}>
        <A11yToggle
          icon="gesture-tap-button"
          label="Alvos de Toque Grandes"
          description="Aumenta todas as áreas de botões e interação para mínimo 56px. Recomendado para dificuldades motoras."
          value={store.largeTargets}
          onToggle={(v) => store.set('largeTargets', v)}
          color={Colors.primary}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <A11yToggle
          icon="vibrate"
          label="Feedback Háptico"
          description="Vibração táctil ao pressionar botões, confirmações e alertas. Essencial para utilizadores com deficiência auditiva."
          value={store.hapticFeedback}
          onToggle={(v) => store.set('hapticFeedback', v)}
          color={Colors.primary}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <A11yToggle
          icon="animation-play"
          label="Reduzir Movimento"
          description="Desativa todas as animações incluindo varredura radar, pulsação de marcadores e efeitos de transição."
          value={store.reducedMotion}
          onToggle={(v) => store.set('reducedMotion', v)}
          color={Colors.primary}
        />
      </GlassCard>

      {/* Cognitive */}
      <NeonText variant="label" color={Colors.warning} style={styles.sectionTitle}>
        Cognitivo & Simplificação
      </NeonText>
      <GlassCard noPadding style={styles.card}>
        <A11yToggle
          icon="puzzle-outline"
          label="Interface Simplificada"
          description="Reduz a complexidade visual ocultando informação secundária. Mostra apenas conteúdo essencial em cada ecrã."
          value={store.simplifiedUI}
          onToggle={(v) => store.set('simplifiedUI', v)}
          color={Colors.warning}
        />
      </GlassCard>

      {/* Info box */}
      <GlassCard style={styles.infoCard} glowColor={Colors.secondary + '15'}>
        <MaterialCommunityIcons name="information" size={24} color={Colors.secondary} />
        <View style={styles.infoText}>
          <NeonText variant="bodySm" style={{ fontWeight: '600' }}>
            Acessibilidade do Sistema
          </NeonText>
          <NeonText variant="caption" color={colors.textSecondary}>
            Esta app respeita as configurações de acessibilidade do dispositivo incluindo Tipo Dinâmico,
            Texto Negrito, Reduzir Movimento, VoiceOver (iOS) e TalkBack (Android). Configure nas
            Definições do dispositivo para a melhor experiência.
          </NeonText>
        </View>
      </GlassCard>

      {/* Reset */}
      <View style={styles.resetSection}>
        <NeonButton
          title="Repor Predefinições"
          onPress={() => {
            haptics.medium();
            store.reset();
            announce('Todas as configurações de acessibilidade foram repostas');
          }}
          variant="ghost"
          icon="refresh"
          accessibilityHint="Repor todas as configurações de acessibilidade para os valores predefinidos"
        />
      </View>

      {/* Summary */}
      <GlassCard style={styles.summaryCard}>
        <NeonText variant="label" color={colors.textSecondary} style={styles.summaryTitle}>
          Funcionalidades de Acessibilidade Ativas
        </NeonText>
        <View style={styles.summaryChips}>
          {store.highContrast && <Chip label="Alto Contraste" color="#00CCFF" />}
          {store.largeText && <Chip label="Texto Grande" color="#FFB800" />}
          {store.screenReaderEnabled && <Chip label="Leitor de Ecrã" color="#7B61FF" />}
          {store.voiceGuidance && <Chip label="Guia por Voz" color="#FF3B7A" />}
          {store.largeTargets && <Chip label="Alvos Grandes" color={Colors.primary} />}
          {store.hapticFeedback && <Chip label="Hápticos" color={Colors.primary} />}
          {store.reducedMotion && <Chip label="Mov. Reduzido" color={Colors.primary} />}
          {store.simplifiedUI && <Chip label="UI Simplificada" color={Colors.warning} />}
          {!store.highContrast && !store.largeText && !store.screenReaderEnabled && !store.voiceGuidance && !store.largeTargets && !store.reducedMotion && !store.simplifiedUI && store.hapticFeedback && (
            <NeonText variant="caption" color={colors.textTertiary}>Predefinições (apenas hápticos)</NeonText>
          )}
        </View>
      </GlassCard>
    </Animated.ScrollView>
  </View>
  );
}

function Chip({ label, color }: { label: string; color: string }) {
  return (
    <View
      style={[styles.chip, { backgroundColor: color + '15', borderColor: color + '40' }]}
      accessible accessibilityLabel={`${label} ativado`}
    >
      <NeonText variant="caption" color={color}>{label}</NeonText>
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
  backBtn: { justifyContent: 'center', alignItems: 'center', padding: Spacing.sm },
  sectionTitle: { paddingHorizontal: Spacing.xl, marginTop: Spacing['2xl'], marginBottom: Spacing.md },
  card: { marginHorizontal: Spacing.xl },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.lg, paddingHorizontal: Spacing.lg },
  toggleIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  toggleText: { flex: 1, marginLeft: Spacing.md, marginRight: Spacing.md },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: Spacing['5xl'] },
  infoCard: { flexDirection: 'row', marginHorizontal: Spacing.xl, marginTop: Spacing['2xl'], padding: Spacing.lg, gap: Spacing.md, alignItems: 'flex-start' },
  infoText: { flex: 1, gap: Spacing.xs },
  resetSection: { alignItems: 'center', paddingTop: Spacing['2xl'] },
  summaryCard: { marginHorizontal: Spacing.xl, marginTop: Spacing.xl, padding: Spacing.lg },
  summaryTitle: { marginBottom: Spacing.md },
  summaryChips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full, borderWidth: 1 },
});
