import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle, StyleProp, Easing, Platform } from 'react-native';
import { useA11y } from '../../hooks/useAccessibility';

interface AnimatedScreenProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
}

export function AnimatedScreen({ children, style, delay = 0, direction = 'up' }: AnimatedScreenProps) {
  const { reducedMotion } = useA11y();
  const opacity = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;
  const translate = useRef(new Animated.Value(reducedMotion ? 0 : getInitialTranslate(direction))).current;

  useEffect(() => {
    if (reducedMotion) return;
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(translate, {
          toValue: 0,
          useNativeDriver: true,
          speed: 12,
          bounciness: 3,
        }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [reducedMotion, delay]);

  const transformKey = direction === 'left' || direction === 'right' ? 'translateX' : 'translateY';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: direction === 'fade' ? [] : [{ [transformKey]: translate }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

function getInitialTranslate(direction: string): number {
  switch (direction) {
    case 'up': return 28;
    case 'down': return -28;
    case 'left': return 28;
    case 'right': return -28;
    default: return 0;
  }
}

interface StaggerChildProps {
  children: React.ReactNode;
  index: number;
  baseDelay?: number;
  staggerMs?: number;
  style?: StyleProp<ViewStyle>;
}

export function StaggerChild({ children, index, baseDelay = 0, staggerMs = 60, style }: StaggerChildProps) {
  const { reducedMotion } = useA11y();
  const opacity = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(reducedMotion ? 0 : 16)).current;

  useEffect(() => {
    if (reducedMotion) return;
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 380,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          speed: 14,
          bounciness: 4,
        }),
      ]).start();
    }, baseDelay + index * staggerMs);
    return () => clearTimeout(timer);
  }, [reducedMotion, index, baseDelay, staggerMs]);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
