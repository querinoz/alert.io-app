import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Animated, Easing } from 'react-native';
import { useA11y } from '../../hooks/useAccessibility';
import { Spacing } from '../../theme/spacing';
import { getBadgeForLevel } from '../../constants/badges';

interface BadgeIconProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

export function BadgeIcon({ level, size = 'md', showName }: BadgeIconProps) {
  const { typography, reducedMotion } = useA11y();
  const badge = getBadgeForLevel(level);
  const scaleAnim = useRef(new Animated.Value(reducedMotion ? 1 : 0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const isGuardianTier = level >= 25;

  useEffect(() => {
    if (reducedMotion) return;
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 6 }).start();
    if (isGuardianTier) {
      Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])).start();
    }
  }, [reducedMotion, isGuardianTier]);

  const sizes = {
    sm: { container: 30, icon: 14, nameFont: typography.caption, ring: 36, outerRing: 42 },
    md: { container: 44, icon: 20, nameFont: typography.bodySm, ring: 52, outerRing: 58 },
    lg: { container: 60, icon: 28, nameFont: typography.body, ring: 70, outerRing: 78 },
  };
  const s = sizes[size];

  const isGuardian = level >= 31;

  return (
    <Animated.View
      style={[styles.wrapper, { transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }] }]}
      accessible
      accessibilityLabel={`Level ${level} badge: ${badge.nameEN}`}
      accessibilityRole="image"
    >
      {/* Outer soft glow ring */}
      <View style={[
        styles.outerGlow,
        {
          width: s.outerRing,
          height: s.outerRing,
          borderRadius: s.outerRing / 2,
          backgroundColor: badge.glowColor + '10',
        },
      ]}>
        {/* Middle ring - gradient-like border */}
        <View style={[
          styles.middleRing,
          {
            width: s.ring,
            height: s.ring,
            borderRadius: s.ring / 2,
            backgroundColor: badge.glowColor + '18',
            borderColor: badge.color + '50',
            borderWidth: 1,
          },
        ]}>
          {/* Inner badge body */}
          <View
            style={[
              styles.badge,
              {
                width: s.container,
                height: s.container,
                borderRadius: s.container / 2,
                backgroundColor: badge.glowColor + '35',
                borderColor: badge.color,
                borderWidth: isGuardian ? 2 : 1.5,
                ...(Platform.OS === 'web'
                  ? { boxShadow: `0 0 ${isGuardian ? 16 : 10}px ${badge.glowColor}${isGuardian ? '' : 'B3'}` }
                  : { shadowColor: badge.glowColor, shadowOpacity: isGuardian ? 1 : 0.7, shadowRadius: isGuardian ? 16 : 10, shadowOffset: { width: 0, height: 0 }, elevation: isGuardian ? 12 : 6 }),
              },
            ]}
          >
            {/* Inner highlight (3D convex effect) */}
            <View style={[
              styles.innerHighlight,
              {
                width: s.container - 6,
                height: (s.container - 6) / 2,
                borderTopLeftRadius: (s.container - 6) / 2,
                borderTopRightRadius: (s.container - 6) / 2,
              },
            ]} />
            <Text style={{ fontSize: s.icon, zIndex: 2 }}>{badge.icon}</Text>
          </View>
        </View>
      </View>

      {showName && (
        <Text
          style={[s.nameFont, { color: badge.color, marginTop: Spacing.xs, fontWeight: '700' }]}
          numberOfLines={1}
        >
          {badge.nameEN}
        </Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  outerGlow: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleRing: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  innerHighlight: {
    position: 'absolute',
    top: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    zIndex: 1,
  },
});
