import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ScrollView, Pressable, Image, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NeonText } from '../../src/components/ui/NeonText';
import { NeonButton } from '../../src/components/ui/NeonButton';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { LogoMark } from '../../src/components/ui/LogoMark';
import { useAuthStore } from '../../src/stores/authStore';
import { useA11y, announce } from '../../src/hooks/useAccessibility';
import { useHaptics } from '../../src/hooks/useHaptics';
import { Colors } from '../../src/theme/colors';
import { Spacing, Radius } from '../../src/theme/spacing';

const QR_URL = 'https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=alertio://app&color=00FF88&bgcolor=0D1117';

export default function SignInScreen() {
  const { colors, typography, minTarget, reducedMotion } = useA11y();
  const haptics = useHaptics();
  const { signIn, isLoading, authError, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const logoScale = useRef(new Animated.Value(reducedMotion ? 1 : 0.7)).current;
  const logoOpacity = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;
  const formSlide = useRef(new Animated.Value(reducedMotion ? 0 : 30)).current;
  const formOpacity = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;
  const bottomSlide = useRef(new Animated.Value(reducedMotion ? 0 : 20)).current;
  const bottomOpacity = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;
  const logoFloat = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reducedMotion) return;
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, useNativeDriver: true, speed: 10, bounciness: 8 }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(formSlide, { toValue: 0, useNativeDriver: true, speed: 12, bounciness: 4 }),
        Animated.timing(formOpacity, { toValue: 1, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(bottomSlide, { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 3 }),
        Animated.timing(bottomOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, { toValue: -6, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(logoFloat, { toValue: 0, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, [reducedMotion]);

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      announce('Erro: Por favor, preencha todos os campos');
      haptics.warning();
      return;
    }
    try {
      await signIn(email, password);
      haptics.success();
      announce('Login realizado com sucesso. Bem-vindo ao Alert.io.');
      router.replace('/(tabs)');
    } catch {
      haptics.error();
      const currentError = useAuthStore.getState().authError;
      announce('Erro: ' + (currentError || 'Credenciais inválidas'));
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo section */}
        <Animated.View style={[styles.logoSection, { opacity: logoOpacity, transform: [{ scale: logoScale }, { translateY: logoFloat }] }]}>
          <View style={styles.brandRow}>
            <View style={styles.logoMarkWrap}>
              <LogoMark size={52} color={Colors.primary} />
            </View>
            <NeonText
              variant="hero"
              glow={Colors.primary}
              style={styles.brandName}
            >
              ALERT.IO
            </NeonText>
          </View>

          <View style={styles.taglineRow}>
            <View style={[styles.taglineLine, { backgroundColor: Colors.primary + '30' }]} />
            <NeonText variant="caption" color={colors.textTertiary} style={styles.taglineText}>
              FROM ALERT TO ACTION
            </NeonText>
            <View style={[styles.taglineLine, { backgroundColor: Colors.primary + '30' }]} />
          </View>
        </Animated.View>

        {/* Sign-in form card */}
        <Animated.View style={{ opacity: formOpacity, transform: [{ translateY: formSlide }] }}>
        <GlassCard style={styles.formCard}>
          {authError && (
            <View
              style={[styles.errorBox, { backgroundColor: colors.error + '12', borderColor: colors.error + '25' }]}
              accessibilityRole="alert"
              accessibilityLiveRegion="assertive"
            >
              <MaterialCommunityIcons name="alert-circle-outline" size={16} color={colors.error} />
              <NeonText variant="bodySm" color={colors.error} style={styles.errorText}>{authError}</NeonText>
            </View>
          )}

          <View style={styles.inputGroup}>
            <NeonText variant="caption" color={Colors.primary + '60'} style={{ fontFamily: Platform.OS === 'web' ? "'Courier New', monospace" : 'monospace', fontSize: 7, letterSpacing: 2.5 }}>CREDENTIALS</NeonText>
            <NeonText variant="label" color={colors.textSecondary}>Email</NeonText>
            <TextInput
              style={[styles.input, { backgroundColor: colors.glass.background, borderColor: colors.border, color: colors.textPrimary, minHeight: minTarget, ...typography.body }]}
              value={email}
              onChangeText={(t) => { setEmail(t); clearError(); }}
              placeholder="seu@email.com"
              placeholderTextColor={colors.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              accessibilityLabel="Endereço de email"
            />
          </View>

          <View style={styles.inputGroup}>
            <NeonText variant="label" color={colors.textSecondary}>Senha</NeonText>
            <TextInput
              style={[styles.input, { backgroundColor: colors.glass.background, borderColor: colors.border, color: colors.textPrimary, minHeight: minTarget, ...typography.body }]}
              value={password}
              onChangeText={(t) => { setPassword(t); clearError(); }}
              placeholder="••••••••"
              placeholderTextColor={colors.textTertiary}
              secureTextEntry
              autoComplete="password"
              textContentType="password"
              accessibilityLabel="Senha"
            />
          </View>

          <NeonButton
            title="Entrar"
            onPress={handleEmailSignIn}
            loading={isLoading}
            fullWidth
            icon="login"
            accessibilityHint="Entrar com email e senha"
          />

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.textTertiary + '20' }]} />
            <NeonText variant="caption" color={colors.textTertiary}>ou</NeonText>
            <View style={[styles.dividerLine, { backgroundColor: colors.textTertiary + '20' }]} />
          </View>

        </GlassCard>
        </Animated.View>

        {/* Bottom section: QR + Sign up */}
        <Animated.View style={[styles.bottomSection, { opacity: bottomOpacity, transform: [{ translateY: bottomSlide }] }]}>
          <View style={styles.qrRow}>
            <Image
              source={{ uri: QR_URL }}
              style={styles.qrImage}
              accessibilityLabel="QR code to open Alert.io on mobile"
            />
            <View style={styles.qrTextBlock}>
              <NeonText variant="bodySm" color={colors.textSecondary} style={{ fontWeight: '600' }}>
                Abrir no Celular
              </NeonText>
              <NeonText variant="caption" color={colors.textTertiary}>
                Escaneie o QR code com{'\n'}a câmera do celular
              </NeonText>
            </View>
          </View>

          <Pressable
            onPress={() => { haptics.light(); router.push('/(auth)/sign-up'); }}
            style={styles.switchAuth}
            accessibilityLabel="Don't have an account? Create one"
            accessibilityRole="link"
          >
            <NeonText variant="body" color={colors.textSecondary}>Não tem conta? </NeonText>
            <NeonText variant="body" color={colors.primary} style={{ fontWeight: '600' }}>Cadastre-se</NeonText>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing['3xl'],
    maxWidth: 440,
    alignSelf: 'center',
    width: '100%',
  },

  logoSection: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoMarkWrap: {
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 0 20px rgba(0,255,136,0.5)' } as any
      : { shadowColor: Colors.primary, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 }),
  },
  brandName: {
    textAlign: 'center',
    letterSpacing: 3,
    fontWeight: '700',
    ...(Platform.OS === 'web' ? { fontFamily: "'Courier New', monospace" } : { fontFamily: 'monospace' }),
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  taglineLine: {
    width: 32,
    height: 1,
  },
  taglineText: {
    letterSpacing: 3,
    fontSize: 10,
    fontWeight: '600',
  },

  formCard: {
    padding: Spacing['2xl'],
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  errorText: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...(Platform.OS === 'web' ? { transition: 'border-color 0.2s ease, box-shadow 0.2s ease', outlineStyle: 'none' } as any : {}),
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
    gap: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
    ...(Platform.OS === 'web' ? { transition: 'all 0.25s ease', cursor: 'pointer' } as any : {}),
  },

  bottomSection: {
    marginTop: Spacing['2xl'],
    alignItems: 'center',
  },
  qrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(12px)' } as any : {}),
  },
  qrImage: {
    width: 80,
    height: 80,
    borderRadius: Radius.md,
  },
  qrTextBlock: {
    gap: 4,
  },
  switchAuth: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } as any : {}),
  },
});
