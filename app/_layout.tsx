
import { Stack } from 'expo-router';
import { ThemeProvider } from '../constants/themeContext';
import '../i18n/i18n';
import { useEffect } from 'react';
import { hydrateLanguagePreference } from '../i18n/i18n';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  useEffect(() => {
    void hydrateLanguagePreference();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(main)" />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
