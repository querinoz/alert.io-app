import React from 'react';
import { Text, TextStyle, StyleProp, TextProps, Platform } from 'react-native';
import { useA11y } from '../../hooks/useAccessibility';

interface NeonTextProps extends TextProps {
  variant?: 'hero' | 'h1' | 'h2' | 'h3' | 'h4' | 'bodyLg' | 'body' | 'bodySm' | 'caption' | 'label' | 'button' | 'buttonSm';
  color?: string;
  glow?: string;
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

function getGlowStyle(glow: string): any {
  if (Platform.OS === 'web') {
    return { textShadow: `0 0 10px ${glow}, 0 0 20px ${glow}40`, transition: 'text-shadow 0.3s ease' };
  }
  return {
    textShadowColor: glow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  };
}

export function NeonText({
  variant = 'body',
  color,
  glow,
  style,
  children,
  ...rest
}: NeonTextProps) {
  const { colors, typography } = useA11y();

  return (
    <Text
      style={[
        typography[variant],
        { color: color ?? colors.textPrimary },
        glow ? getGlowStyle(glow) : undefined,
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}
