import React, { useMemo } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../constants/themeContext';
import Container from '../../../components/ui/container';
import HeaderBar from '../../../components/ui/headerBar';
import { useRouter } from 'expo-router';
import { useStoredState } from '../../../lib/useStored';
import { KEYS } from '../../../lib/keys';
import { DEFAULT_STATS } from '../../../lib/defaults';
import type { Stats } from '../../../lib/appModel';

export default function MasteryTab() {
  const theme = useTheme();
  const colors = theme.colors;
  const s = theme.spacing;
  const { t } = useTranslation();
  const router = useRouter();
  const { value: stats } = useStoredState<Stats>(KEYS.stats, DEFAULT_STATS);

  const successPct = useMemo(() => (stats.answered ? Math.round((stats.correct / stats.answered) * 100) : 0), [stats.answered, stats.correct]);
  const masteredToday = useMemo(() => Math.max(0, stats.correct), [stats.correct]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <HeaderBar title={t('tabs.mastery')} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: s.xxl }}
          keyboardShouldPersistTaps="handled"
        >
          <Container paddingX="lg" style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>{t('mastery.title')}</Text>
            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>{t('mastery.subtitle')}</Text>
          </Container>

          <Container paddingX="xl">
            <LinearGradient
              colors={[colors.obsidian, '#1E293B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <Text style={[styles.heroKicker, { color: 'rgba(248,250,252,0.65)' }]}>{t('mastery.today')}</Text>
              <Text style={[styles.heroMetric, { color: colors.cloud }]}>{t('mastery.notions', { count: masteredToday })}</Text>
              <TouchableOpacity
                style={[styles.heroButton, { backgroundColor: colors.secondary }]}
                activeOpacity={0.9}
                onPress={() => router.push('/(main)/focus-session')}
              >
                <Text style={[styles.heroButtonText, { color: colors.obsidian }]}>{t('mastery.cta')}</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.obsidian} />
              </TouchableOpacity>
            </LinearGradient>

            <View style={{ height: s.lg }} />

            <View style={[styles.metricCard, { backgroundColor: colors.surfaceContainerLow }]}>
              <View style={[styles.metricIcon, { backgroundColor: colors.surface }]}>
                <Ionicons name="timer-outline" size={18} color={colors.text} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.metricValue, { color: colors.text }]}>
                  {t('mastery.saved', { minutes: stats.savedMinutes })}
                </Text>
              </View>
            </View>

            <View style={{ height: s.md }} />

            <View style={[styles.metricCard, { backgroundColor: colors.surfaceContainerLow }]}>
              <View style={[styles.metricIcon, { backgroundColor: colors.surface }]}>
                <Ionicons name="flame-outline" size={18} color={colors.text} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.metricValue, { color: colors.text }]}>
                  {t('mastery.streak', { days: stats.streakDays })}
                </Text>
                <Text style={[styles.metricDesc, { color: colors.onSurfaceVariant }]}>{t('mastery.streakHint')}</Text>
              </View>
            </View>

            <View style={{ height: s.md }} />

            <View style={[styles.metricCard, { backgroundColor: colors.surfaceContainerLow }]}>
              <View style={[styles.metricIcon, { backgroundColor: colors.surface }]}>
                <Ionicons name="school-outline" size={18} color={colors.text} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.metricValue, { color: colors.text }]}>{t('mastery.last')}</Text>
                <Text style={[styles.metricDesc, { color: colors.onSurfaceVariant }]}>
                  {t('mastery.lastBody', {
                    title: stats.lastMastery?.title ?? '—',
                    score: stats.lastMastery?.scorePct ?? 0,
                  })}
                </Text>
              </View>
            </View>

            <View style={{ height: s.xl }} />

            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('mastery.analysisTitle')}</Text>
            <View style={{ height: s.md }} />

            <View style={[styles.analysisCard, { backgroundColor: colors.surfaceContainerLow }]}>
              <View style={styles.analysisRow}>
                <View style={[styles.analysisIcon, { backgroundColor: colors.surface }]}>
                  <Ionicons name="trending-up" size={18} color={colors.text} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.analysisTitle, { color: colors.text }]}>{t('mastery.analysisStatus')}</Text>
                  <Text style={[styles.analysisDesc, { color: colors.onSurfaceVariant }]}>
                    {t('mastery.analysisBody', { answered: stats.answered, pct: successPct })}
                  </Text>
                </View>
              </View>
              <View style={[styles.analysisPlaceholder, { backgroundColor: colors.surface }]} />
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
  header: { paddingTop: 4, paddingBottom: 6 },

  title: { fontSize: 44, fontWeight: '900', letterSpacing: -1.6, lineHeight: 46, marginTop: 8 },
  subtitle: { fontSize: 15, lineHeight: 22, marginTop: 10, maxWidth: 340 },

  heroCard: { borderRadius: 26, padding: 18, overflow: 'hidden' },
  heroKicker: { fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  heroMetric: { fontSize: 22, fontWeight: '900', letterSpacing: -0.4, lineHeight: 28, marginTop: 10 },
  heroButton: { marginTop: 14, height: 42, borderRadius: 14, paddingHorizontal: 14, flexDirection: 'row', gap: 8, alignItems: 'center', alignSelf: 'flex-start' },
  heroButtonText: { fontSize: 13, fontWeight: '900', letterSpacing: -0.2 },

  metricCard: { borderRadius: 22, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'center' },
  metricIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  metricValue: { fontSize: 16, fontWeight: '900', letterSpacing: -0.2 },
  metricDesc: { marginTop: 2, fontSize: 12.5, lineHeight: 18, fontWeight: '600' },

  sectionTitle: { fontSize: 16, fontWeight: '900', letterSpacing: -0.2 },
  analysisCard: { borderRadius: 26, padding: 14 },
  analysisRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  analysisIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  analysisTitle: { fontSize: 14, fontWeight: '900' },
  analysisDesc: { marginTop: 2, fontSize: 12.5, fontWeight: '600', lineHeight: 18 },
  analysisPlaceholder: { marginTop: 14, height: 120, borderRadius: 20 },
});
