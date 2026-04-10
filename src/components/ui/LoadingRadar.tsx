import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing, Platform } from 'react-native';
import { useA11y } from '../../hooks/useAccessibility';
import { NeonText } from './NeonText';

interface LoadingRadarProps {
  size?: number;
  message?: string;
}

export function LoadingRadar({ size = 120, message }: LoadingRadarProps) {
  const { colors, reducedMotion } = useA11y();
  const rotation = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0.6)).current;
  const ripple1 = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;
  const blip1 = useRef(new Animated.Value(0)).current;
  const blip2 = useRef(new Animated.Value(0)).current;
  const dotPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (reducedMotion) return;

    const spin = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 2200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const breathing = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.5, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );

    const rippleAnim1 = Animated.loop(
      Animated.sequence([
        Animated.timing(ripple1, { toValue: 1, duration: 2000, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(ripple1, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );

    const rippleAnim2 = Animated.loop(
      Animated.sequence([
        Animated.delay(1000),
        Animated.timing(ripple2, { toValue: 1, duration: 2000, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(ripple2, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );

    const blipAnim1 = Animated.loop(
      Animated.sequence([
        Animated.delay(800),
        Animated.timing(blip1, { toValue: 1, duration: 300, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(blip1, { toValue: 0, duration: 600, easing: Easing.in(Easing.ease), useNativeDriver: true }),
        Animated.delay(2200),
      ])
    );

    const blipAnim2 = Animated.loop(
      Animated.sequence([
        Animated.delay(2000),
        Animated.timing(blip2, { toValue: 1, duration: 300, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(blip2, { toValue: 0, duration: 600, easing: Easing.in(Easing.ease), useNativeDriver: true }),
        Animated.delay(1600),
      ])
    );

    const dotBreathing = Animated.loop(
      Animated.sequence([
        Animated.timing(dotPulse, { toValue: 1.4, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(dotPulse, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );

    spin.start();
    breathing.start();
    rippleAnim1.start();
    rippleAnim2.start();
    blipAnim1.start();
    blipAnim2.start();
    dotBreathing.start();

    return () => {
      spin.stop(); breathing.stop();
      rippleAnim1.stop(); rippleAnim2.stop();
      blipAnim1.stop(); blipAnim2.stop();
      dotBreathing.stop();
    };
  }, [reducedMotion]);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const halfSize = size / 2;
  const blipSize = size * 0.04;

  const renderRipple = (anim: Animated.Value) => (
    <Animated.View
      style={[
        styles.ring,
        styles.centered,
        {
          width: size * 0.3,
          height: size * 0.3,
          borderRadius: (size * 0.3) / 2,
          borderColor: colors.primary,
          borderWidth: 1.5,
          opacity: anim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0.6, 0.25, 0] }),
          transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 3.2] }) }],
        },
      ]}
    />
  );

  return (
    <View
      style={styles.container}
      accessible
      accessibilityLabel={message ?? 'Loading'}
      accessibilityRole="progressbar"
    >
      <View style={[styles.radar, { width: size, height: size }]}>
        {renderRipple(ripple1)}
        {renderRipple(ripple2)}
        <Animated.View
          style={[
            styles.ring,
            {
              width: size,
              height: size,
              borderRadius: halfSize,
              borderColor: colors.primary + '40',
              opacity: pulse,
            },
          ]}
        />
        <View
          style={[
            styles.ring,
            styles.centered,
            {
              width: size * 0.65,
              height: size * 0.65,
              borderRadius: (size * 0.65) / 2,
              borderColor: colors.primary + '25',
            },
          ]}
        />
        <View
          style={[
            styles.ring,
            styles.centered,
            {
              width: size * 0.3,
              height: size * 0.3,
              borderRadius: (size * 0.3) / 2,
              borderColor: colors.primary + '15',
            },
          ]}
        />
        {/* Blip 1 */}
        <Animated.View
          style={[
            styles.centered,
            {
              width: blipSize + 4,
              height: blipSize + 4,
              borderRadius: (blipSize + 4) / 2,
              backgroundColor: colors.primary,
              top: halfSize - size * 0.22,
              left: halfSize + size * 0.15,
              opacity: blip1,
              transform: [{ scale: blip1.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 1.2, 1] }) }],
              ...(Platform.OS === 'web'
                ? { boxShadow: `0 0 8px ${colors.primary}` } as any
                : { shadowColor: colors.primary, shadowOpacity: 1, shadowRadius: 8 }),
            },
          ]}
        />
        {/* Blip 2 */}
        <Animated.View
          style={[
            styles.centered,
            {
              width: blipSize + 2,
              height: blipSize + 2,
              borderRadius: (blipSize + 2) / 2,
              backgroundColor: colors.primary,
              top: halfSize + size * 0.18,
              left: halfSize - size * 0.25,
              opacity: blip2,
              transform: [{ scale: blip2.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 1.2, 1] }) }],
              ...(Platform.OS === 'web'
                ? { boxShadow: `0 0 6px ${colors.primary}` } as any
                : { shadowColor: colors.primary, shadowOpacity: 1, shadowRadius: 6 }),
            },
          ]}
        />
        {/* Sweep line */}
        <Animated.View
          style={[
            styles.sweep,
            {
              width: 2.5,
              height: halfSize,
              backgroundColor: colors.primary,
              bottom: halfSize,
              left: halfSize - 1.25,
              transformOrigin: 'bottom',
              transform: [{ rotate }],
              ...(Platform.OS === 'web'
                ? { boxShadow: `0 0 10px ${colors.primary}CC, 0 0 20px ${colors.primary}40` }
                : { shadowColor: colors.primary, shadowOpacity: 0.8, shadowRadius: 10 }),
            },
          ]}
        />
        {/* Center dot */}
        <Animated.View
          style={[
            styles.dot,
            styles.centered,
            {
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: colors.primary,
              transform: [{ scale: dotPulse }],
              ...(Platform.OS === 'web'
                ? { boxShadow: `0 0 12px ${colors.primary}, 0 0 24px ${colors.primary}50` }
                : { shadowColor: colors.primary, shadowOpacity: 1, shadowRadius: 12 }),
            },
          ]}
        />
      </View>
      {message && (
        <View style={{ alignItems: 'center' }}>
          <NeonText
            variant="bodySm"
            color={colors.textSecondary}
            style={styles.message}
          >
            {message}
          </NeonText>
          <NeonText
            variant="caption"
            color={colors.primary + '50'}
            style={{ fontFamily: Platform.OS === 'web' ? "'Courier New', monospace" : Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 8, letterSpacing: 2, marginTop: 6 }}
          >
            SCANNING PERIMETER...
          </NeonText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  radar: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
  },
  centered: {
    position: 'absolute',
  },
  sweep: {
    position: 'absolute',
  },
  dot: {
    position: 'absolute',
    elevation: 4,
  },
  message: {
    marginTop: 16,
  },
});
