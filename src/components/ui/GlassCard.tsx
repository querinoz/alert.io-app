import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Platform, Animated, Easing } from 'react-native';
import { useA11y } from '../../hooks/useAccessibility';
import { Radius, Spacing } from '../../theme/spacing';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  noPadding?: boolean;
  glowColor?: string;
  accessibilityLabel?: string;
  hoverScale?: boolean;
  animateEntry?: boolean;
  entryDelay?: number;
}

export function GlassCard({ children, style, noPadding, glowColor, accessibilityLabel, hoverScale, animateEntry, entryDelay = 0 }: GlassCardProps) {
  const { colors, reducedMotion } = useA11y();
  const [hovered, setHovered] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const entryOpacity = useRef(new Animated.Value(animateEntry && !reducedMotion ? 0 : 1)).current;
  const entryTranslate = useRef(new Animated.Value(animateEntry && !reducedMotion ? 18 : 0)).current;

  useEffect(() => {
    if (!animateEntry || reducedMotion) return;
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(entryOpacity, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.spring(entryTranslate, { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 4 }),
      ]).start();
    }, entryDelay);
    return () => clearTimeout(timer);
  }, [animateEntry, reducedMotion, entryDelay]);

  const onHoverIn = useCallback(() => {
    setHovered(true);
    if (hoverScale) {
      Animated.spring(scaleAnim, { toValue: 1.018, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
    }
  }, [hoverScale]);

  const onHoverOut = useCallback(() => {
    setHovered(false);
    if (hoverScale) {
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 4 }).start();
    }
  }, [hoverScale]);

  const webHoverProps = Platform.OS === 'web' ? {
    onMouseEnter: onHoverIn,
    onMouseLeave: onHoverOut,
  } : {};

  const card = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: hovered ? colors.glass.backgroundHover : colors.glass.background,
          borderColor: hovered
            ? (glowColor || colors.glass.border)
            : colors.glass.border,
        },
        Platform.OS === 'web' && styles.webGlass,
        glowColor && (Platform.OS === 'web'
          ? {
              borderColor: hovered ? glowColor : glowColor + 'AA',
              boxShadow: `0 ${hovered ? 4 : 2}px ${hovered ? 28 : 18}px ${glowColor}${hovered ? '80' : '4D'}, inset 0 1px 0 rgba(255,255,255,${hovered ? '0.12' : '0.06'})`,
            } as any
          : {
              borderColor: hovered ? glowColor : glowColor + 'AA',
              shadowColor: glowColor,
              shadowOpacity: hovered ? 0.5 : 0.3,
              shadowRadius: hovered ? 28 : 18,
              shadowOffset: { width: 0, height: hovered ? 4 : 2 },
              elevation: 10,
            }),
        !noPadding && styles.padding,
        style,
      ]}
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityLabel ? 'none' : undefined}
      {...webHoverProps}
    >
      <View style={[styles.topEdge, hovered && styles.topEdgeHover]} />
      <View style={styles.innerGlow} />
      {hovered && Platform.OS === 'web' && (
        <View style={styles.hoverSheen} pointerEvents="none" />
      )}
      {children}
    </View>
  );

  const wrapperStyle = animateEntry
    ? { opacity: entryOpacity, transform: [{ translateY: entryTranslate }, ...(hoverScale ? [{ scale: scaleAnim }] : [])] }
    : hoverScale ? { transform: [{ scale: scaleAnim }] } : undefined;

  if (wrapperStyle) {
    return <Animated.View style={wrapperStyle}>{card}</Animated.View>;
  }

  return card;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  webGlass: Platform.OS === 'web' ? {
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    transition: 'all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1), border-color 0.3s ease, box-shadow 0.4s ease',
  } as any : {},
  padding: {
    padding: Spacing.lg,
  },
  topEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    ...(Platform.OS === 'web' ? { transition: 'background-color 0.3s ease' } as any : {}),
  },
  topEdgeHover: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  innerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
  },
  hoverSheen: Platform.OS === 'web' ? {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.02)',
    pointerEvents: 'none',
    zIndex: 0,
  } as any : {},
});
