import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { TOKENS } from '../../constants/tokens';

type SpacingKey = keyof typeof TOKENS.spacing;

interface ContainerProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  paddingX?: SpacingKey | number;
  paddingY?: SpacingKey | number;
}

function resolveSpacing(value: SpacingKey | number | undefined, fallback: number) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return TOKENS.spacing[value] ?? fallback;
  return fallback;
}

export default function Container({
  children,
  style,
  paddingX = 'lg',
  paddingY = 0,
}: ContainerProps) {
  const px = resolveSpacing(paddingX, TOKENS.spacing.xl);
  const py = resolveSpacing(paddingY, 0);

  return <View style={[styles.container, { paddingHorizontal: px, paddingVertical: py }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});