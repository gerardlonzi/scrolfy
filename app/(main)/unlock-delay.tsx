import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import HeaderBar from '../../components/ui/headerBar';
import Container from '../../components/ui/container';
import { useTheme } from '../../constants/themeContext';
import { useStoredState } from '../../lib/useStored';
import { KEYS } from '../../lib/keys';
import { DEFAULT_SHIELD } from '../../lib/defaults';
import type { ShieldConfig } from '../../lib/appModel';
import { useTranslation } from 'react-i18next';

export default function UnlockDelayScreen() {
  const theme = useTheme();
  const colors = theme.colors;
  const { t } = useTranslation();
  const { value: shield, setValue: setShield } = useStoredState<ShieldConfig>(KEYS.shield, DEFAULT_SHIELD);
  const current = shield.premium?.unlockDelaySeconds ?? 0;

  async function setDelay(seconds: number) {
    await setShield((prev) => ({
      ...prev,
      premium: {
        strictMode: prev.premium?.strictMode ?? false,
        scheduleBlocking: prev.premium?.scheduleBlocking ?? { enabled: false, startHour: 9, endHour: 18, ranges: [{ startHour: 9, endHour: 18 }] },
        unlockDelaySeconds: seconds,
        unlockDelayEnabled: seconds > 0,
        behaviorPenaltyEnabled: prev.premium?.behaviorPenaltyEnabled ?? false,
        behaviorPenaltyFullBlock: prev.premium?.behaviorPenaltyFullBlock ?? false,
        behaviorPenaltyScore: prev.premium?.behaviorPenaltyScore ?? 0,
        analyticsEnabled: prev.premium?.analyticsEnabled ?? false,
      },
    }));
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safe}>
        <HeaderBar title={t('settings.focusUnlockDelay')} showSettings={false} />
        <Container paddingX="lg" style={styles.wrap}>
          {[5, 10, 30].map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.pill, { backgroundColor: current === s ? colors.secondary : colors.surfaceContainerLow }]}
              onPress={() => void setDelay(s)}
            >
              <Text style={[styles.pillText, { color: current === s ? colors.obsidian : colors.text }]}>{`${s}s`}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.offBtn, { backgroundColor: colors.surfaceContainerLow }]} onPress={() => void setDelay(0)}>
            <Text style={[styles.offText, { color: colors.text }]}>{t('settings.disable')}</Text>
          </TouchableOpacity>
        </Container>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1 },
  wrap: { gap: 10, paddingTop: 12 },
  pill: { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  pillText: { fontSize: 14, fontWeight: '900' },
  offBtn: { borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  offText: { fontSize: 13, fontWeight: '800' },
});
