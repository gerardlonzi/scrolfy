import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../constants/themeContext';

export default function GradientButton({
  title,
  onPress,
  style,
  variant = 'primary',
  left,
}: {
  title: string;
  onPress: () => void | Promise<void>;
  style?: StyleProp<ViewStyle>;
  variant?: 'primary' | 'premium';
  left?: React.ReactNode;
}) {
  const theme = useTheme();
  const colors = theme.colors as any;

  const gradientColors =
    variant === 'premium'
      ? ([colors.premiumGradientStart ?? '#F59E0B', colors.premiumGradientEnd ?? '#7C3AED'] as const)
      : theme.isDark
        ? (['#34D399', '#0B5D45'] as const)
        : ([colors.primaryGradientStart ?? '#4EDEA3', colors.primaryGradientEnd ?? '#091426'] as const);

  const textColor = variant === 'premium' ? theme.colors.cloud : theme.colors.obsidian;

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={() => void onPress()} style={style}>
      <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btn}>
        {left ? <>{left}</> : null}
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 56,
    width: '100%',
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  text: { fontSize: 16, fontWeight: '900', letterSpacing: -0.2 },
});

