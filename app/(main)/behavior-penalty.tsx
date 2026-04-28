import React from 'react';
import { SafeAreaView, StyleSheet, Switch, Text, View } from 'react-native';
import HeaderBar from '../../components/ui/headerBar';
import Container from '../../components/ui/container';
import { useTheme } from '../../constants/themeContext';
import { useStoredState } from '../../lib/useStored';
import { KEYS } from '../../lib/keys';
import { DEFAULT_SHIELD } from '../../lib/defaults';
import type { ShieldConfig } from '../../lib/appModel';
import { useTranslation } from 'react-i18next';

export default function BehaviorPenaltyScreen() {
  const theme = useTheme();
  const colors = theme.colors;
  const { t } = useTranslation();
  const { value: shield, setValue: setShield } = useStoredState<ShieldConfig>(KEYS.shield, DEFAULT_SHIELD);
  const enabled = shield.premium?.behaviorPenaltyEnabled ?? false;
  const fullBlock = shield.premium?.behaviorPenaltyFullBlock ?? false;
  const score = shield.premium?.behaviorPenaltyScore ?? 0;

  async function save(next: { enabled?: boolean; fullBlock?: boolean }) {
    await setShield((prev) => ({
      ...prev,
      premium: {
        strictMode: prev.premium?.strictMode ?? false,
        scheduleBlocking: prev.premium?.scheduleBlocking ?? { enabled: false, startHour: 9, endHour: 18, ranges: [{ startHour: 9, endHour: 18 }] },
        unlockDelaySeconds: prev.premium?.unlockDelaySeconds ?? 0,
        unlockDelayEnabled: prev.premium?.unlockDelayEnabled ?? false,
        behaviorPenaltyEnabled: next.enabled ?? (prev.premium?.behaviorPenaltyEnabled ?? false),
        behaviorPenaltyFullBlock: next.fullBlock ?? (prev.premium?.behaviorPenaltyFullBlock ?? false),
        behaviorPenaltyScore: prev.premium?.behaviorPenaltyScore ?? 0,
        analyticsEnabled: prev.premium?.analyticsEnabled ?? false,
      },
    }));
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safe}>
        <HeaderBar title={t('settings.focusBehaviorPenalty')} showSettings={false} />
        <Container paddingX="lg" style={styles.wrap}>
          <View style={[styles.card, { backgroundColor: colors.surfaceContainerLow }]}>
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.text }]}>{t('settings.enabled')}</Text>
              <Switch value={enabled} onValueChange={(v) => void save({ enabled: v })} />
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.text }]}>{t('settings.fullBlock')}</Text>
              <Switch value={fullBlock} onValueChange={(v) => void save({ fullBlock: v })} />
            </View>
            <Text style={[styles.score, { color: colors.onSurfaceVariant }]}>{t('settings.penaltyScore', { n: score })}</Text>
          </View>
        </Container>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1 },
  wrap: { paddingTop: 12 },
  card: { borderRadius: 20, padding: 14, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: 14, fontWeight: '800' },
  score: { marginTop: 8, fontSize: 12.5, fontWeight: '600' },
});
