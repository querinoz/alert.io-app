import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Platform, Dimensions } from 'react-native';
import { LogoMark } from './LogoMark';

const BOOT_STEPS = [
  { label: 'Initializing security protocols...', icon: '🔐', duration: 600 },
  { label: 'Verifying encrypted connection...', icon: '🔒', duration: 500 },
  { label: 'Authenticating device signature...', icon: '📱', duration: 550 },
  { label: 'Loading threat intelligence database...', icon: '🛡️', duration: 600 },
  { label: 'Scanning network perimeter...', icon: '📡', duration: 500 },
  { label: 'Establishing real-time feed...', icon: '🌐', duration: 450 },
  { label: 'System ready.', icon: '✅', duration: 400 },
];

interface Props {
  onComplete: () => void;
}

export function SecurityBootScreen({ onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, { toValue: 1, useNativeDriver: true, speed: 8, bounciness: 4 }),
      Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.timing(scanLineAnim, {
        toValue: 1, duration: 2500, easing: Easing.linear, useNativeDriver: true,
      })
    ).start();

    let elapsed = 500;
    const timers: ReturnType<typeof setTimeout>[] = [];

    BOOT_STEPS.forEach((step, idx) => {
      timers.push(setTimeout(() => {
        setCurrentStep(idx);
        Animated.timing(progressAnim, {
          toValue: (idx + 1) / BOOT_STEPS.length,
          duration: step.duration * 0.8,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }).start();
      }, elapsed));

      elapsed += step.duration;

      timers.push(setTimeout(() => {
        setCompletedSteps(prev => [...prev, idx]);
      }, elapsed - 100));
    });

    timers.push(setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0, duration: 500, easing: Easing.in(Easing.cubic), useNativeDriver: true,
      }).start(() => onComplete());
    }, elapsed + 300));

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Scan line effect */}
      <Animated.View style={[styles.scanLine, {
        transform: [{
          translateY: scanLineAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-2, screenHeight],
          }),
        }],
      }]} />

      {/* Grid background */}
      {Platform.OS === 'web' && (
        <View style={styles.gridBg}>
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.03,
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(0,255,136,0.4) 39px, rgba(0,255,136,0.4) 40px),
                             repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(0,255,136,0.4) 39px, rgba(0,255,136,0.4) 40px)`,
          } as any} />
        </View>
      )}

      {/* Logo */}
      <Animated.View style={[styles.logoWrap, {
        opacity: logoOpacity,
        transform: [{ scale: logoScale }],
      }]}>
        <LogoMark size={80} color="#00FF88" spinning />
      </Animated.View>

      {/* Title */}
      <Animated.View style={[styles.titleWrap, { opacity: logoOpacity }]}>
        <Text style={styles.title}>ALERT<Text style={styles.titleAccent}>.IO</Text></Text>
        <Text style={styles.subtitle}>SECURITY INITIALIZATION</Text>
      </Animated.View>

      {/* Boot log */}
      <View style={styles.logContainer}>
        {BOOT_STEPS.map((step, idx) => {
          const isActive = idx === currentStep;
          const isDone = completedSteps.includes(idx);
          const isVisible = idx <= currentStep;
          if (!isVisible) return null;

          return (
            <View key={idx} style={[styles.logRow, isActive && styles.logRowActive]}>
              <Text style={[styles.logIcon, isDone && styles.logIconDone]}>
                {isDone ? '✓' : isActive ? step.icon : '○'}
              </Text>
              <Text style={[
                styles.logText,
                isActive && styles.logTextActive,
                isDone && styles.logTextDone,
              ]} numberOfLines={1}>
                {step.label}
              </Text>
              {isActive && !isDone && (
                <Text style={styles.logSpinner}>●</Text>
              )}
            </View>
          );
        })}
      </View>

      {/* Progress bar */}
      <View style={styles.progressWrap}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBar, {
            width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          }]} />
        </View>
        <Text style={styles.progressText}>
          {Math.round((completedSteps.length / BOOT_STEPS.length) * 100)}%
        </Text>
      </View>

      {/* Bottom branding */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>ENCRYPTED · AES-256 · REAL-TIME</Text>
        <View style={styles.footerDots}>
          {[0, 1, 2].map(i => (
            <View key={i} style={[styles.footerDot, {
              opacity: (currentStep % 3 === i) ? 1 : 0.25,
            }]} />
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

const monoFont = Platform.OS === 'ios' ? 'Courier' : Platform.OS === 'web' ? "'Courier New', monospace" : 'monospace';

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#070910',
    zIndex: 99999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#00FF88',
    opacity: 0.06,
    zIndex: 1,
  },
  gridBg: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 0,
  } as any,
  logoWrap: {
    marginBottom: 20,
    ...(Platform.OS === 'web'
      ? { filter: 'drop-shadow(0 0 20px rgba(0,255,136,0.2))' } as any
      : { shadowColor: '#00FF88', shadowOpacity: 0.3, shadowRadius: 20, shadowOffset: { width: 0, height: 0 } }),
  },
  titleWrap: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontFamily: monoFont,
    fontSize: 28,
    fontWeight: '700',
    color: '#E6EDF3',
    letterSpacing: 4,
  },
  titleAccent: {
    color: '#00FF88',
    fontWeight: '400',
  },
  subtitle: {
    fontFamily: monoFont,
    fontSize: 9,
    fontWeight: '700',
    color: '#00FF88',
    letterSpacing: 3,
    marginTop: 6,
    opacity: 0.6,
  },
  logContainer: {
    width: '100%',
    maxWidth: 360,
    gap: 3,
    marginBottom: 32,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  logRowActive: {
    backgroundColor: 'rgba(0,255,136,0.04)',
  },
  logIcon: {
    fontFamily: monoFont,
    fontSize: 11,
    color: '#3A3F4B',
    width: 20,
    textAlign: 'center',
  },
  logIconDone: {
    color: '#00FF88',
    fontWeight: '800',
  },
  logText: {
    fontFamily: monoFont,
    fontSize: 11,
    color: '#3A3F4B',
    flex: 1,
    letterSpacing: 0.3,
  },
  logTextActive: {
    color: '#8B949E',
  },
  logTextDone: {
    color: '#4A5060',
  },
  logSpinner: {
    fontSize: 6,
    color: '#00FF88',
  },
  progressWrap: {
    width: '100%',
    maxWidth: 360,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00FF88',
    borderRadius: 2,
    ...(Platform.OS === 'web' ? { boxShadow: '0 0 8px rgba(0,255,136,0.4)' } as any : {}),
  },
  progressText: {
    fontFamily: monoFont,
    fontSize: 10,
    fontWeight: '700',
    color: '#00FF88',
    letterSpacing: 1,
    width: 36,
    textAlign: 'right',
    opacity: 0.7,
  },
  footer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : Platform.OS === 'android' ? 32 : 28,
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontFamily: monoFont,
    fontSize: 8,
    color: '#2A2F3A',
    letterSpacing: 2.5,
    fontWeight: '600',
  },
  footerDots: {
    flexDirection: 'row',
    gap: 4,
  },
  footerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00FF88',
  },
});
