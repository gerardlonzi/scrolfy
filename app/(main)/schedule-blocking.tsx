import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import HeaderBar from '../../components/ui/headerBar';
import Container from '../../components/ui/container';
import { useTheme } from '../../constants/themeContext';
import { useStoredState } from '../../lib/useStored';
import { KEYS } from '../../lib/keys';
import { DEFAULT_SHIELD } from '../../lib/defaults';
import type { ShieldConfig } from '../../lib/appModel';
import { useTranslation } from 'react-i18next';

export default function ScheduleBlockingScreen() {
  const theme = useTheme();
  const colors = theme.colors;
  const { t } = useTranslation();
  const { value: shield, setValue: setShield } = useStoredState<ShieldConfig>(KEYS.shield, DEFAULT_SHIELD);
  const ranges = shield.premium?.scheduleBlocking.ranges ?? [{ startHour: 9, endHour: 18 }];
  const enabled = shield.premium?.scheduleBlocking.enabled ?? false;

  async function save(next: { enabled?: boolean; ranges?: Array<{ startHour: number; endHour: number }> }) {
    await setShield((prev) => ({
      ...prev,
      premium: {
        strictMode: prev.premium?.strictMode ?? false,
        scheduleBlocking: {
          enabled: next.enabled ?? (prev.premium?.scheduleBlocking.enabled ?? false),
          startHour: (next.ranges ?? prev.premium?.scheduleBlocking.ranges ?? ranges)[0]?.startHour ?? 9,
          endHour: (next.ranges ?? prev.premium?.scheduleBlocking.ranges ?? ranges)[0]?.endHour ?? 18,
          ranges: next.ranges ?? prev.premium?.scheduleBlocking.ranges ?? ranges,
        },
        unlockDelaySeconds: prev.premium?.unlockDelaySeconds ?? 0,
        unlockDelayEnabled: prev.premium?.unlockDelayEnabled ?? false,
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
        <HeaderBar title={t('settings.focusSchedule')} showSettings={false} />
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <Container paddingX="lg">
            <View style={[styles.card, { backgroundColor: colors.surfaceContainerLow }]}>
              <View style={styles.row}>
                <Text style={[styles.label, { color: colors.text }]}>{t('settings.enabled')}</Text>
                <Switch value={enabled} onValueChange={(v) => void save({ enabled: v })} />
              </View>
            </View>
            <View style={{ height: 12 }} />
            {ranges.map((r, idx) => (
              <View key={`range-${idx}`} style={[styles.card, { backgroundColor: colors.surfaceContainerLow }]}>
                <Text style={[styles.label, { color: colors.text }]}>{`Range ${idx + 1}`}</Text>
                <View style={{ height: 8 }} />
                <View style={styles.row}>
                  <TouchableOpacity style={[styles.pill, { backgroundColor: colors.surface }]} onPress={() => void save({ ranges: ranges.map((x, i) => (i === idx ? { ...x, startHour: Math.max(0, x.startHour - 1) } : x)) })}>
                    <Text style={[styles.pillText, { color: colors.text }]}>-</Text>
                  </TouchableOpacity>
                  <Text style={[styles.value, { color: colors.text }]}>{`${r.startHour}h - ${r.endHour}h`}</Text>
                  <TouchableOpacity style={[styles.pill, { backgroundColor: colors.surface }]} onPress={() => void save({ ranges: ranges.map((x, i) => (i === idx ? { ...x, endHour: Math.min(23, x.endHour + 1) } : x)) })}>
                    <Text style={[styles.pillText, { color: colors.text }]}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <View style={{ height: 12 }} />
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: colors.surfaceContainerLow }]}
              onPress={() => void save({ ranges: [...ranges, { startHour: 20, endHour: 22 }] })}
            >
              <Text style={[styles.addText, { color: colors.text }]}>{t('settings.addRange')}</Text>
            </TouchableOpacity>
          </Container>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1 },
  card: { borderRadius: 20, padding: 14 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: 14, fontWeight: '800' },
  value: { fontSize: 13, fontWeight: '700' },
  pill: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  pillText: { fontSize: 16, fontWeight: '900' },
  addBtn: { borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  addText: { fontSize: 13, fontWeight: '800' },
});
