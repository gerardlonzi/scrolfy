import React, { useMemo, useState } from 'react';
import { Alert, NativeModules, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../constants/themeContext';
import Container from '../../components/ui/container';
import HeaderBar from '../../components/ui/headerBar';
import { KEYS } from '../../lib/keys';
import { DEFAULT_SHIELD } from '../../lib/defaults';
import type { ShieldConfig } from '../../lib/appModel';
import { useStoredState } from '../../lib/useStored';

const { ScrolfySettings } = NativeModules as {
  ScrolfySettings?: {
    setDailyLimit: (minutes: number) => Promise<boolean>;
    setBlockedPackages: (csv: string) => Promise<boolean>;
    openAccessibilitySettings: () => void;
    openOverlaySettings: () => void;
    openUsageAccessSettings: () => void;
  };
};

export default function AndroidBlockingScreen() {
  const theme = useTheme();
  const colors = theme.colors;
  const { value: shield, setValue: setShield } = useStoredState<ShieldConfig>(KEYS.shield, DEFAULT_SHIELD);

  const [limitMin, setLimitMin] = useState(String(shield.limits.dailyMaxMinutes ?? 120));
  const [packagesCsv, setPackagesCsv] = useState('com.zhiliaoapp.musically,com.whatsapp,com.instagram.android');

  const canUseNative = Boolean(ScrolfySettings);

  const info = useMemo(
    () => (canUseNative ? 'Native module loaded' : 'Native module missing: add SettingsPackage in MainApplication'),
    [canUseNative],
  );

  const saveLimit = async () => {
    const n = Math.max(0, parseInt(limitMin.replace(/[^\d]/g, ''), 10) || 0);
    await setShield((prev) => ({ ...prev, limits: { ...prev.limits, dailyMaxMinutes: n } }));
    if (ScrolfySettings) {
      await ScrolfySettings.setDailyLimit(n);
    }
    Alert.alert('OK', `Limite quotidienne sauvegardee: ${n} min`);
  };

  const savePackages = async () => {
    if (!packagesCsv.trim()) {
      Alert.alert('Erreur', 'Entrez au moins un package Android.');
      return;
    }
    if (!ScrolfySettings) {
      Alert.alert('Module natif absent', 'Ajoutez SettingsPackage dans MainApplication.java');
      return;
    }
    await ScrolfySettings.setBlockedPackages(packagesCsv.trim());
    Alert.alert('OK', 'Packages surveilles sauvegardes.');
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <HeaderBar title="Android Blocking Setup" showSettings={false} />
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="always">
          <Container paddingX="lg" style={{ paddingTop: 8 }}>
            <Text style={[styles.title, { color: colors.text }]}>Native blocking</Text>
            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>{info}</Text>

            <View style={{ height: 16 }} />

            <View style={[styles.card, { backgroundColor: colors.surfaceContainerLow }]}>
              <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Daily limit (minutes)</Text>
              <View style={[styles.inputWrap, { backgroundColor: colors.surface }]}>
                <TextInput
                  value={limitMin}
                  onChangeText={setLimitMin}
                  keyboardType="number-pad"
                  style={[styles.input, { color: colors.text }]}
                  placeholder="120"
                  placeholderTextColor={colors.onSurfaceVariant}
                />
              </View>
              <View style={{ height: 10 }} />
              <TouchableOpacity style={[styles.btn, { backgroundColor: colors.secondary }]} onPress={() => void saveLimit()}>
                <Text style={[styles.btnText, { color: colors.obsidian }]}>Save daily limit</Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 16 }} />

            <View style={[styles.card, { backgroundColor: colors.surfaceContainerLow }]}>
              <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Blocked packages (CSV)</Text>
              <View style={[styles.inputWrap, { backgroundColor: colors.surface }]}>
                <TextInput
                  value={packagesCsv}
                  onChangeText={setPackagesCsv}
                  style={[styles.input, { color: colors.text }]}
                  placeholder="com.whatsapp,com.instagram.android"
                  placeholderTextColor={colors.onSurfaceVariant}
                />
              </View>
              <View style={{ height: 10 }} />
              <TouchableOpacity style={[styles.btn, { backgroundColor: colors.secondary }]} onPress={() => void savePackages()}>
                <Text style={[styles.btnText, { color: colors.obsidian }]}>Save blocked packages</Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 16 }} />

            <View style={[styles.card, { backgroundColor: colors.surfaceContainerLow }]}>
              <TouchableOpacity style={[styles.outlineBtn, { borderColor: colors.secondary }]} onPress={() => ScrolfySettings?.openAccessibilitySettings()}>
                <Text style={[styles.outlineText, { color: colors.secondary }]}>Open Accessibility</Text>
              </TouchableOpacity>
              <View style={{ height: 8 }} />
              <TouchableOpacity style={[styles.outlineBtn, { borderColor: colors.secondary }]} onPress={() => ScrolfySettings?.openOverlaySettings()}>
                <Text style={[styles.outlineText, { color: colors.secondary }]}>Open Overlay Permission</Text>
              </TouchableOpacity>
              <View style={{ height: 8 }} />
              <TouchableOpacity style={[styles.outlineBtn, { borderColor: colors.secondary }]} onPress={() => ScrolfySettings?.openUsageAccessSettings()}>
                <Text style={[styles.outlineText, { color: colors.secondary }]}>Open Usage Access</Text>
              </TouchableOpacity>
            </View>
          </Container>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1 },
  title: { fontSize: 30, fontWeight: '900', letterSpacing: -0.8 },
  subtitle: { marginTop: 8, fontSize: 13, fontWeight: '600' },
  card: { borderRadius: 18, padding: 12 },
  label: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
  inputWrap: { marginTop: 8, borderRadius: 12, paddingHorizontal: 12, minHeight: 44, justifyContent: 'center' },
  input: { fontSize: 14, fontWeight: '600' },
  btn: { height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 13, fontWeight: '900' },
  outlineBtn: { height: 42, borderWidth: 2, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  outlineText: { fontSize: 13, fontWeight: '900' },
});
