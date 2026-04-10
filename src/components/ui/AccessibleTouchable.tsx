import React, { useRef } from 'react';
import { Pressable, StyleSheet, ViewStyle, StyleProp, Animated, Platform } from 'react-native';
import { useA11y } from '../../hooks/useAccessibility';
import { useHaptics } from '../../hooks/useHaptics';

interface AccessibleTouchableProps {
  children: React.ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'link' | 'tab' | 'menuitem' | 'checkbox' | 'radio';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  hapticType?: 'light' | 'medium' | 'selection';
}

export function AccessibleTouchable({
  children,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  disabled,
  style,
  hapticType = 'light',
}: AccessibleTouchableProps) {
  const { minTarget, colors } = useA11y();
  const haptics = useHaptics();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }).start();
  };

  const handlePress = () => {
    if (disabled) return;
    haptics[hapticType]();
    onPress();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessible
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole={accessibilityRole}
        accessibilityState={{ disabled }}
        style={({ pressed }) => [
          styles.base,
          { minHeight: minTarget, minWidth: minTarget, opacity: disabled ? 0.4 : pressed ? 0.8 : 1 },
          pressed && { backgroundColor: colors.glass.backgroundHover },
          style,
        ]}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' ? { transition: 'opacity 0.2s ease, background-color 0.25s ease', cursor: 'pointer' } as any : {}),
  },
});
