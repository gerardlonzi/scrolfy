import React, { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TOKENS } from './tokens';
import { KEYS } from '../lib/keys';

export type ThemePreference = 'system' | 'light' | 'dark';

type Theme = typeof TOKENS & {
  isDark: boolean;
  themePreference: ThemePreference;
  setThemePreference: (pref: ThemePreference) => Promise<void>;
  colors: typeof TOKENS.colors & {
    background: string;
    surface: string;
    text: string;
    onSurfaceVariant: string;
    surfaceContainerLow: string;
    cloud: string;
  };
};

const defaultTheme: Theme = {
  ...TOKENS,
  isDark: false,
  themePreference: 'light',
  setThemePreference: async () => {},
  colors: {
    ...TOKENS.colors,
    background: TOKENS.colors.cloud,
    surface: TOKENS.colors.cloud,
    text: TOKENS.colors.obsidian,
    onSurfaceVariant: '#45464D',
    surfaceContainerLow: TOKENS.colors.surfaceContainerLow,
    cloud: TOKENS.colors.cloud,
  },
};

const ThemeContext = createContext<Theme>(defaultTheme);

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const systemScheme = useColorScheme();
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('light');

  useEffect(() => {
    let mounted = true;
    (async () => {
      const stored = (await AsyncStorage.getItem(KEYS.themePref)) as ThemePreference | null;
      const pref: ThemePreference =
        stored === 'system' || stored === 'light' || stored === 'dark' ? stored : 'light';
      if (!mounted) return;
      setThemePreferenceState(pref);
      if (pref === 'light') Appearance.setColorScheme('light');
      else if (pref === 'dark') Appearance.setColorScheme('dark');
      else Appearance.setColorScheme(null);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (themePreference !== 'system') return;
    const sub = Appearance.addChangeListener(() => {
      // force rerender when system appearance changes
      setThemePreferenceState((p) => p);
    });
    return () => sub.remove();
  }, [themePreference]);

  const resolvedScheme = useMemo(() => {
    if (themePreference === 'light') return 'light';
    if (themePreference === 'dark') return 'dark';
    return systemScheme ?? Appearance.getColorScheme() ?? 'light';
  }, [themePreference, systemScheme]);

  const isDark = resolvedScheme === 'dark';

  const setThemePreference = useCallback(async (pref: ThemePreference) => {
    setThemePreferenceState(pref);
    await AsyncStorage.setItem(KEYS.themePref, pref);
    if (pref === 'light') Appearance.setColorScheme('light');
    else if (pref === 'dark') Appearance.setColorScheme('dark');
    else Appearance.setColorScheme(null);
  }, []);

  const theme: Theme = useMemo(
    () => ({
      ...TOKENS,
      isDark,
      themePreference,
      setThemePreference,
      colors: {
        ...TOKENS.colors,
        background: isDark ? '#0B1220' : TOKENS.colors.cloud,
        surface: isDark ? '#0F172A' : TOKENS.colors.cloud,
        surfaceContainerLow: isDark ? '#111C2F' : TOKENS.colors.surfaceContainerLow,
        text: isDark ? '#F8FAFC' : TOKENS.colors.obsidian,
        onSurface: isDark ? '#F8FAFC' : TOKENS.colors.obsidian,
        cloud: TOKENS.colors.cloud,
        onSurfaceVariant: isDark ? '#A7B2C3' : '#45464D',
      },
    }),
    [isDark, themePreference, setThemePreference],
  );

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
