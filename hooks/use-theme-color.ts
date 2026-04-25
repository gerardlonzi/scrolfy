import { useTheme } from '../constants/themeContext';

export function useThemeColor(props: { light?: string; dark?: string }, colorName: string) {
  const theme = useTheme();
  const override = theme.isDark ? props.dark : props.light;
  if (override) return override;
  return (theme.colors as any)[colorName] ?? theme.colors.text;
}
