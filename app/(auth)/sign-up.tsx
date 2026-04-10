import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ScrollView, Pressable, Animated, Easing } from 'react-native';
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

const CODE_EXPIRY_SECONDS = 5 * 60;
const MONO = Platform.OS === 'web' ? "'Courier New', monospace" : Platform.OS === 'ios' ? 'Courier' : 'monospace';

export default function SignUpScreen() {
  const { colors, typography, minTarget, reducedMotion } = useA11y();
  const haptics = useHaptics();
  const {
    requestSignUp,
    verifyCode,
    isLoading,
    authError,
    clearError,
    pendingEmail,
    verificationCode,
    isVerifying,
  } = useAuthStore();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(CODE_EXPIRY_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const logoScale = useRef(new Animated.Value(reducedMotion ? 1 : 0.7)).current;
  const logoOpacity = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;
  const formSlide = useRef(new Animated.Value(reducedMotion ? 0 : 30)).current;
  const formOpacity = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;
  const bottomSlide = useRef(new Animated.Value(reducedMotion ? 0 : 20)).current;
  const bottomOpacity = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;
  const logoFloat = useRef(new Animated.Value(0)).current;
  const timerBarAnim = useRef(new Animated.Value(1)).current;
  const verifyIconScale = useRef(new Animated.Value(reducedMotion ? 1 : 0.5)).current;
  const verifyIconOpacity = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;
  const verifyFormSlide = useRef(new Animated.Value(reducedMotion ? 0 : 24)).current;
  const verifyFormOpacity = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;

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
    Animated.loop(Animated.sequence([
      Animated.timing(logoFloat, { toValue: -5, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(logoFloat, { toValue: 0, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();
  }, [reducedMotion]);

  useEffect(() => {
    if (isVerifying && !reducedMotion) {
      verifyIconScale.setValue(0.5);
      verifyIconOpacity.setValue(0);
      verifyFormSlide.setValue(24);
      verifyFormOpacity.setValue(0);
      Animated.sequence([
        Animated.parallel([
          Animated.spring(verifyIconScale, { toValue: 1, useNativeDriver: true, speed: 10, bounciness: 6 }),
          Animated.timing(verifyIconOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]),
        Animated.delay(100),
        Animated.parallel([
          Animated.spring(verifyFormSlide, { toValue: 0, useNativeDriver: true, speed: 12, bounciness: 4 }),
          Animated.timing(verifyFormOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]),
      ]).start();
      timerBarAnim.setValue(1);
      Animated.timing(timerBarAnim, { toValue: 0, duration: CODE_EXPIRY_SECONDS * 1000, easing: Easing.linear, useNativeDriver: false }).start();
    }
  }, [isVerifying]);

  const error = localError || authError || '';

  useEffect(() => {
    if (isVerifying) {
      setSecondsLeft(CODE_EXPIRY_SECONDS);
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isVerifying]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const handleCreateAccount = async () => {
    setLocalError('');
    clearError();
    if (!displayName || !email || !password) {
      setLocalError('Por favor, preencha todos os campos');
      haptics.warning();
      announce('Erro: Por favor, preencha todos os campos');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('As senhas não coincidem');
      haptics.warning();
      announce('Erro: As senhas não coincidem');
      return;
    }
    if (password.length < 8) {
      setLocalError('A senha deve ter no mínimo 8 caracteres');
      haptics.warning();
      return;
    }
    try {
      await requestSignUp(email, password, displayName);
      haptics.success();
      announce('Código de verificação enviado. Verifique seu email.');
    } catch {
      haptics.error();
    }
  };

  const handleVerify = async () => {
    setLocalError('');
    clearError();
    if (codeInput.length !== 6) {
      setLocalError('Por favor, insira o código de 6 dígitos');
      haptics.warning();
      return;
    }
    try {
      await verifyCode(pendingEmail || email, codeInput);
      haptics.success();
      announce('Conta verificada com sucesso. Bem-vindo ao Alert.io!');
      router.replace('/(tabs)');
    } catch {
      haptics.error();
    }
  };

  const handleResend = async () => {
    setLocalError('');
    clearError();
    setCodeInput('');
    try {
      await requestSignUp(email, password, displayName);
      if (timerRef.current) clearInterval(timerRef.current);
      setSecondsLeft(CODE_EXPIRY_SECONDS);
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      haptics.light();
      announce('Código de verificação reenviado.');
    } catch {
      haptics.error();
    }
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: colors.glass.background, borderColor: colors.border, color: colors.textPrimary, minHeight: minTarget, ...typography.body },
  ];

  if (isVerifying) {
    return (
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.header, { opacity: verifyIconOpacity, transform: [{ scale: verifyIconScale }] }]}>
            <MaterialCommunityIcons name="email-check-outline" size={48} color={Colors.primary} />
            <NeonText variant="h2" glow={colors.primaryGlow} style={styles.verifyTitle}>
              Verifique seu Email
            </NeonText>
            <NeonText variant="caption" color={Colors.primary} style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 2.5, marginTop: 6 }}>
              VERIFICATION REQUIRED
            </NeonText>
            <NeonText variant="body" color={colors.textSecondary} style={styles.verifySubtitle}>
              Enviamos um código de verificação para{'\n'}
              <NeonText variant="body" color={colors.primary}>{pendingEmail || email}</NeonText>
            </NeonText>
          </Animated.View>

          <Animated.View style={{ opacity: verifyFormOpacity, transform: [{ translateY: verifyFormSlide }] }}>
          <GlassCard style={styles.formCard}>
            {error !== '' && (
              <View
                style={[styles.errorBox, { backgroundColor: colors.error + '15', borderColor: colors.error + '30' }]}
                accessibilityRole="alert"
                accessibilityLiveRegion="assertive"
              >
                <NeonText variant="bodySm" color={colors.error}>{error}</NeonText>
              </View>
            )}

            {verificationCode && (
              <View style={[styles.codeReveal, { backgroundColor: Colors.primary + '12', borderColor: Colors.primary + '30' }]}>
                <NeonText variant="caption" color={colors.textSecondary} style={{ fontFamily: MONO, fontSize: 8, letterSpacing: 2 }}>VERIFICATION CODE</NeonText>
                <NeonText variant="h2" color={Colors.primary} style={[styles.codeRevealText, { fontFamily: MONO }]}>
                  {verificationCode}
                </NeonText>
              </View>
            )}

            <View style={styles.inputGroup}>
              <NeonText variant="label" color={colors.textSecondary} style={{ fontFamily: MONO, fontSize: 8, letterSpacing: 2 }}>ENTER CODE</NeonText>
              <TextInput
                style={[inputStyle, styles.codeInput, { fontFamily: MONO }]}
                value={codeInput}
                onChangeText={(t) => { setCodeInput(t.replace(/[^0-9]/g, '').slice(0, 6)); setLocalError(''); }}
                placeholder="000000"
                placeholderTextColor={colors.textTertiary}
                keyboardType="number-pad"
                maxLength={6}
                textContentType="oneTimeCode"
                accessibilityLabel="Verification code"
              />
            </View>

            {/* Animated timer bar */}
            <View style={styles.timerRow}>
              <MaterialCommunityIcons
                name="timer-outline"
                size={14}
                color={secondsLeft <= 60 ? colors.error : colors.textTertiary}
              />
              <NeonText variant="caption" color={secondsLeft <= 60 ? colors.error : colors.textTertiary} style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 1 }}>
                EXPIRES IN {formatTime(secondsLeft)}
              </NeonText>
            </View>
            <View style={styles.timerBarTrack}>
              <Animated.View style={[styles.timerBarFill, {
                backgroundColor: secondsLeft <= 60 ? Colors.error : Colors.primary,
                width: timerBarAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                ...(Platform.OS === 'web' ? { boxShadow: `0 0 6px ${secondsLeft <= 60 ? Colors.error : Colors.primary}60` } as any : {}),
              }]} />
            </View>

            <NeonButton
              title="Verificar"
              onPress={handleVerify}
              loading={isLoading}
              fullWidth
              icon="check-circle-outline"
              disabled={codeInput.length !== 6 || secondsLeft === 0}
              accessibilityHint="Verificar email com o código"
              style={{ marginTop: Spacing.md }}
            />

            <Pressable
              onPress={handleResend}
              disabled={isLoading}
              style={styles.resendLink}
              accessibilityLabel="Resend verification code"
              accessibilityRole="button"
            >
              <NeonText variant="body" color={colors.primary}>Reenviar Código</NeonText>
            </Pressable>
          </GlassCard>
          </Animated.View>

          <Animated.View style={{ opacity: verifyFormOpacity }}>
          <Pressable
            onPress={() => { haptics.light(); router.back(); }}
            style={styles.switchAuth}
            accessibilityLabel="Back to sign in"
            accessibilityRole="link"
          >
            <MaterialCommunityIcons name="arrow-left" size={18} color={colors.textSecondary} />
            <NeonText variant="body" color={colors.textSecondary}> Voltar para Login</NeonText>
          </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={[styles.header, { opacity: logoOpacity, transform: [{ scale: logoScale }, { translateY: logoFloat }] }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <LogoMark size={36} color={Colors.primary} />
            <NeonText variant="h2" glow={Colors.primary} style={{ letterSpacing: 2, fontWeight: '700', fontFamily: MONO }}>
              ALERT.IO
            </NeonText>
          </View>
          <NeonText variant="caption" color={Colors.primary} style={{ fontFamily: MONO, letterSpacing: 2.5, marginTop: Spacing.sm, fontSize: 9 }}>
            CREATE ACCOUNT
          </NeonText>
        </Animated.View>

        <Animated.View style={{ opacity: formOpacity, transform: [{ translateY: formSlide }] }}>
        <GlassCard style={styles.formCard}>
          {error !== '' && (
            <View
              style={[styles.errorBox, { backgroundColor: colors.error + '15', borderColor: colors.error + '30' }]}
              accessibilityRole="alert"
              accessibilityLiveRegion="assertive"
            >
              <NeonText variant="bodySm" color={colors.error}>{error}</NeonText>
            </View>
          )}

          <View style={styles.inputGroup}>
            <NeonText variant="label" color={colors.textSecondary}>Nome de Exibição</NeonText>
            <TextInput
              style={inputStyle}
              value={displayName}
              onChangeText={(t) => { setDisplayName(t); setLocalError(''); }}
              placeholder="Como outros vão te ver"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              accessibilityLabel="Display name"
            />
          </View>

          <View style={styles.inputGroup}>
            <NeonText variant="label" color={colors.textSecondary}>Email</NeonText>
            <TextInput
              style={inputStyle}
              value={email}
              onChangeText={(t) => { setEmail(t); setLocalError(''); }}
              placeholder="seu@email.com"
              placeholderTextColor={colors.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              accessibilityLabel="Email address"
            />
          </View>

          <View style={styles.inputGroup}>
            <NeonText variant="label" color={colors.textSecondary}>Senha</NeonText>
            <TextInput
              style={inputStyle}
              value={password}
              onChangeText={(t) => { setPassword(t); setLocalError(''); }}
              placeholder="Mínimo 8 caracteres"
              placeholderTextColor={colors.textTertiary}
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              accessibilityLabel="Senha"
            />
          </View>

          <View style={styles.inputGroup}>
            <NeonText variant="label" color={colors.textSecondary}>Confirmar Senha</NeonText>
            <TextInput
              style={inputStyle}
              value={confirmPassword}
              onChangeText={(t) => { setConfirmPassword(t); setLocalError(''); }}
              placeholder="Repita a senha"
              placeholderTextColor={colors.textTertiary}
              secureTextEntry
              textContentType="newPassword"
              accessibilityLabel="Confirmar senha"
            />
          </View>

          <NeonButton
            title="Criar Conta"
            onPress={handleCreateAccount}
            loading={isLoading}
            fullWidth
            icon="account-plus"
            style={styles.btn}
            accessibilityHint="Criar sua conta no Alert.io"
          />
        </GlassCard>
        </Animated.View>

        <Animated.View style={{ opacity: bottomOpacity, transform: [{ translateY: bottomSlide }] }}>
        <Pressable
          onPress={() => { haptics.light(); router.back(); }}
          style={styles.switchAuth}
          accessibilityLabel="Already have an account? Sign in"
          accessibilityRole="link"
        >
          <NeonText variant="body" color={colors.textSecondary}>Já tem conta? </NeonText>
          <NeonText variant="body" color={colors.primary}>Entrar</NeonText>
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
  },
  header: { alignItems: 'center', marginBottom: Spacing['3xl'] },
  subtitle: { marginTop: Spacing.sm },
  verifyTitle: { marginTop: Spacing.md, textAlign: 'center' },
  verifySubtitle: { marginTop: Spacing.sm, textAlign: 'center' },
  formCard: { padding: Spacing['2xl'] },
  errorBox: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  codeReveal: {
    padding: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  codeRevealText: {
    marginTop: Spacing.xs,
    letterSpacing: 8,
    fontVariant: ['tabular-nums'],
  },
  inputGroup: { marginBottom: Spacing.md, gap: Spacing.xs },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  codeInput: {
    textAlign: 'center',
    fontSize: 28,
    letterSpacing: 12,
    fontVariant: ['tabular-nums'],
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  timerBarTrack: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  timerBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  resendLink: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  btn: { marginTop: Spacing.sm },
  switchAuth: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing['2xl'],
    paddingVertical: Spacing.md,
  },
});
