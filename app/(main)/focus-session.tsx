import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Container from '../../components/ui/container';
import { useTheme } from '../../constants/themeContext';
import HeaderBar from '../../components/ui/headerBar';
import GradientButton from '../../components/ui/GradientButton';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStoredState } from '../../lib/useStored';
import { KEYS } from '../../lib/keys';
import { DEFAULT_PROFILE, DEFAULT_SHIELD, DEFAULT_STATS, DEFAULT_SUBSCRIPTION, dayKey } from '../../lib/defaults';
import type { AppProfile, ShieldConfig, Stats, Subscription } from '../../lib/appModel';
import { generateQuestion } from '../../lib/quiz';
import { useTranslation } from 'react-i18next';
import { premiumFeatureFlags } from '../../lib/featureFlags';



type QState = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
};

export default function FocusSessionScreen() {
  const theme = useTheme();
  const colors = theme.colors;
  const s = theme.spacing;
  const params = useLocalSearchParams<{ source?: string }>();
  const isDemo = params?.source === 'demo';
  const router = useRouter();
  const { value: profile } = useStoredState<AppProfile>(KEYS.profile, DEFAULT_PROFILE);
  const { value: shield, setValue: setShield } = useStoredState<ShieldConfig>(KEYS.shield, DEFAULT_SHIELD);
  const { value: sub } = useStoredState<Subscription>(KEYS.subscription, DEFAULT_SUBSCRIPTION);
  const { value: stats, setValue: setStats } = useStoredState<Stats>(KEYS.stats, DEFAULT_STATS);
  const flags = premiumFeatureFlags();
  const statsRef = useRef(stats);
  const { t } = useTranslation();
  const positiveMicroTexts = useMemo(
    () => [t('session.motivation.correct1'), t('session.motivation.correct2'), t('session.motivation.correct3')],
    [t],
  );
  const retryMicroTexts = useMemo(
    () => [t('session.motivation.retry1'), t('session.motivation.retry2'), t('session.motivation.retry3')],
    [t],
  );


  statsRef.current = stats;

  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'offline'>('offline');
  const [q, setQ] = useState<QState | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [interceptionConfirmed, setInterceptionConfirmed] = useState(false);
  const [delayRemaining, setDelayRemaining] = useState(0);

  const shouldShowAlert = useMemo(() => {
    const maxSession = shield.limits.sessionMaxMinutes ?? 0;
    const started = shield.sessionStartedAt ?? 0;
    const sessionExceeded =
      maxSession > 0 && started > 0 && Date.now() - started > maxSession * 60_000;

    const maxDaily = shield.limits.dailyMaxMinutes ?? 0;
    const dailyExceeded = maxDaily > 0 && (shield.todayScrollMinutes ?? 0) >= maxDaily;

    return sessionExceeded || dailyExceeded;
  }, [
    shield.limits.dailyMaxMinutes,
    shield.limits.sessionMaxMinutes,
    shield.sessionStartedAt,
    shield.todayScrollMinutes,
  ]);

  const isCorrect = useMemo(() => (q && selected != null ? selected === q.correctIndex : false), [q, selected]);
  const showInterceptionGate = shouldShowAlert && !isDemo && !interceptionConfirmed;

  const loadQuestion = useCallback(async () => {
    setLoading(true);
    setRevealed(false);
    setSelected(null);
    try {
      const asked = statsRef.current.askedQuestionIds ?? [];
      const res = await generateQuestion(profile, asked, {
        correct: statsRef.current.correct,
        answered: statsRef.current.answered,
      });
      setSource(res.source);
      const next: QState = {
        id: res.question.id,
        prompt: res.question.prompt,
        options: res.question.options,
        correctIndex: res.question.correctIndex,
        explanation: res.question.explanation,
      };
      setQ(next);
      await setStats((prev) => {
        const merged = Array.from(new Set([...(prev.askedQuestionIds ?? []), next.id]));
        return { ...prev, askedQuestionIds: merged.slice(-200) };
      });
    } catch {
      setQ(null);
      Alert.alert(t('session.doneTitle'), t('session.doneBody'));
    }
    setLoading(false);
  }, [profile, setStats, t]);

  useEffect(() => {
    if (showInterceptionGate) return;
    void loadQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chargement initial uniquement
  }, [showInterceptionGate]);

  useEffect(() => {
    if (delayRemaining <= 0) return;
    const timer = setTimeout(() => setDelayRemaining((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [delayRemaining]);

  const muted = theme.isDark ? 'rgba(248,250,252,0.72)' : colors.onSurfaceVariant;
  const cardBg = theme.isDark ? 'rgba(248,250,252,0.08)' : colors.surfaceContainerLow;
  const optionIdle = theme.isDark ? 'rgba(248,250,252,0.08)' : colors.surface;
  const permissionsComplete = useMemo(() => {
    const p = shield.permissions ?? {};
    if (!p.notificationsGranted) return false;
    if (Platform.OS === 'android' && (!p.overlayAcknowledged || !p.accessibilityAcknowledged)) return false;
    return true;
  }, [shield.permissions]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <HeaderBar title={t('session.title')} showSettings={false} />

        {!permissionsComplete ? (
          <Container paddingX="xl" style={styles.alertWrap}>
            <View style={[styles.alert, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="warning" size={16} color="#B91C1C" />
              <Text style={[styles.alertText, { color: '#7F1D1D' }]}>
              {t('common.activePermissionNotif')} </Text>
            </View>
          </Container>
        ) : null}

        {showInterceptionGate ? (
          <Container paddingX="xl" style={styles.alertWrap}>
            <View style={[styles.gateCard, { backgroundColor: theme.isDark ? 'rgba(254,226,226,0.22)' : '#FEE2E2' }]}>
              <Ionicons name="warning" size={16} color="#B91C1C" />
              <Text style={[styles.alertText, { color: theme.isDark ? '#FECACA' : '#7F1D1D' }]}>{t('session.limitReached')}</Text>
              <Text style={[styles.gateMotivation, { color: theme.isDark ? '#FECACA' : '#7F1D1D' }]}>{t('session.limitReachedMotivation')}</Text>
              <Text style={[styles.gateTease, { color: theme.isDark ? '#FECACA' : '#7F1D1D' }]}>{t('session.premiumTease')}</Text>
              <View style={styles.gateActions}>
                <TouchableOpacity
                  style={[styles.gateBtnPrimary, { backgroundColor: colors.obsidian }]}
                  onPress={() => {
                    const delay =
                      flags.unlockDelay && sub.isPremium && shield.premium?.unlockDelayEnabled
                        ? shield.premium.unlockDelaySeconds ?? 0
                        : 0;
                    if (delay > 0) {
                      setDelayRemaining(delay);
                      return;
                    }
                    setInterceptionConfirmed(true);
                  }}
                >
                  <Text style={styles.gateBtnPrimaryText}>
                    {delayRemaining > 0 ? t('session.unlockDelayCountdown', { s: delayRemaining }) : t('common.continue')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.gateBtnSecondary, { backgroundColor: colors.surface }]}
                  onPress={() => router.push('/(main)/paywall')}
                >
                  <Text style={[styles.gateBtnSecondaryText, { color: colors.text }]}>{t('session.upgrade')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Container>
        ) : null}
        {delayRemaining === 0 && !interceptionConfirmed && showInterceptionGate ? (
          <Container paddingX="xl">
            <TouchableOpacity style={[styles.delayDoneBtn, { backgroundColor: colors.secondary }]} onPress={() => setInterceptionConfirmed(true)}>
              <Text style={[styles.delayDoneText, { color: colors.obsidian }]}>{t('session.startQuiz')}</Text>
            </TouchableOpacity>
          </Container>
        ) : null}

        {!showInterceptionGate ? <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: s.xxl }}
          showsVerticalScrollIndicator={false}
        >
          <Container paddingX="lg" style={styles.content}>
            <View style={styles.kickerRow}>
              <Ionicons name="sparkles" size={14} color={theme.isDark ? colors.secondary : colors.obsidian} />
              <Text style={[styles.kicker, { color: muted }]}>SCROLFY · {source.toUpperCase()}</Text>
            </View>

            <Text style={[styles.title, { color: colors.text }]}>{t('session.focusCheck')}</Text>
            {loading || !q ? (
              <View style={{ height: 120, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator color={colors.secondary} />
              </View>
            ) : (
              <Text style={[styles.question, { color: colors.text }]}>{q.prompt}</Text>
            )}

            <View style={{ height: s.lg }} />

            <View style={styles.options}>
              {(q?.options ?? []).map((label, idx) => (
                <OptionRow
                  key={`${idx}-${label}`}
                  label={label}
                  selected={selected === idx}
                  state={
                    revealed
                      ? idx === q?.correctIndex
                        ? 'correct'
                        : selected === idx
                          ? 'wrong'
                          : 'idle'
                      : 'idle'
                  }
                  onPress={() => setSelected(idx)}
                />
              ))}
            </View>

            <View style={{ height: s.xl }} />

            <GradientButton
              title={t('session.validate')}
              onPress={async () => {
                if (selected == null) {
                  Alert.alert(t('session.noAnswerTitle'), t('session.noAnswerBody'));
                  return;
                }
                setRevealed(true);
                if (!q) return;

                await setStats((prev) => {
                  const today = dayKey();
                  const answered = prev.answered + 1;
                  const correct = prev.correct + (selected === q.correctIndex ? 1 : 0);
                  const gainedXp = selected === q.correctIndex ? 10 : 2;
                  let xp = prev.xp + gainedXp;

                  let streak = prev.streakDays || 0;
                  if (!prev.lastActiveDayKey) {
                    streak = 1;
                  } else if (prev.lastActiveDayKey !== today) {
                    const prevDate = new Date(prev.lastActiveDayKey);
                    const todayDate = new Date(today);
                    const diffDays = Math.round((todayDate.getTime() - prevDate.getTime()) / 86_400_000);
                    streak = diffDays === 1 ? streak + 1 : 1;
                  }
                  if (streak === 3) xp += 15;
                  if (streak === 7) xp += 40;
                  const level = Math.floor(Math.sqrt(xp / 100)) + 1;

                  return {
                    ...prev,
                    answered,
                    correct,
                    xp,
                    level,
                    lastActiveDayKey: today,
                    lastQuizDayKey: selected === q.correctIndex ? today : prev.lastQuizDayKey,
                    streakDays: streak,
                    savedMinutes: prev.savedMinutes + (selected === q.correctIndex ? 10 : 0),
                    lastMastery: selected === q.correctIndex ? { title: q.prompt.slice(0, 48), scorePct: 100, at: Date.now() } : prev.lastMastery,
                  };
                });
                if (selected !== q.correctIndex && flags.behaviorPenalty && sub.isPremium && shield.premium?.behaviorPenaltyEnabled) {
                  await setShield((prev) => ({
                    ...prev,
                    premium: {
                      strictMode: prev.premium?.strictMode ?? false,
                      scheduleBlocking: prev.premium?.scheduleBlocking ?? { enabled: false, startHour: 9, endHour: 18, ranges: [{ startHour: 9, endHour: 18 }] },
                      unlockDelaySeconds: prev.premium?.unlockDelaySeconds ?? 0,
                      unlockDelayEnabled: prev.premium?.unlockDelayEnabled ?? false,
                      behaviorPenaltyEnabled: true,
                      behaviorPenaltyFullBlock: prev.premium?.behaviorPenaltyFullBlock ?? false,
                      behaviorPenaltyScore: (prev.premium?.behaviorPenaltyScore ?? 0) + 1,
                      analyticsEnabled: prev.premium?.analyticsEnabled ?? false,
                    },
                  }));
                }
              }}
              style={[styles.primaryCta, { opacity: loading ? 0.45 : 1 }]}
              left={<Ionicons name="checkmark-circle" size={18} color={colors.obsidian} />}
            />

            <View style={styles.secondaryRow}>
              <TouchableOpacity style={styles.secondaryCta} activeOpacity={0.9} onPress={() => void loadQuestion()}>
                <Text style={[styles.secondaryText, { color: muted }]}>{t('session.anotherQuestion')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryCta} activeOpacity={0.9} onPress={() => setRevealed(true)}>
                <Text style={[styles.secondaryText, { color: muted }]}>{t('session.reveal')}</Text>
              </TouchableOpacity>
            </View>

            {revealed ? (
              <View style={[styles.result, { backgroundColor: cardBg }]}>
                <Ionicons name={isCorrect ? 'checkmark-circle' : 'close-circle'} size={18} color={isCorrect ? '#10B981' : '#F87171'} />
                <Text style={[styles.resultText, { color: colors.text }]}>
                  {isCorrect ? t('session.correct') : t('session.wrong')}{' '}
                  {(isCorrect ? positiveMicroTexts : retryMicroTexts)[Math.floor(Math.random() * 3)]}
                </Text>
              </View>
            ) : null}

            {revealed && q?.explanation ? (
              <View style={[styles.explain, { backgroundColor: cardBg }]}>
                <Text style={[styles.explainText, { color: muted }]}>{q.explanation}</Text>
              </View>
            ) : null}
          </Container>
        </ScrollView> : null}
      </SafeAreaView>
    </View>
  );

  function OptionRow({
    label,
    selected,
    state,
    onPress,
  }: {
    label: string;
    selected: boolean;
    state: 'idle' | 'correct' | 'wrong';
    onPress: () => void;
  }) {
    const bg =
      state === 'correct'
        ? 'rgba(16,185,129,0.18)'
        : state === 'wrong'
          ? 'rgba(248,113,113,0.14)'
          : optionIdle;
    const ring = selected ? colors.secondary : theme.isDark ? 'rgba(248,250,252,0.25)' : colors.onSurfaceVariant;
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={[styles.optionRow, { backgroundColor: bg, borderColor: ring }]}>
        <Text style={[styles.optionText, { color: colors.text }]}>{label}</Text>
        <View style={[styles.radio, { borderColor: ring, backgroundColor: selected ? `${colors.secondary}33` : 'transparent' }]} />
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1 },
  alertWrap: { paddingTop: 6, paddingBottom: 6 },
  alert: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  gateCard: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  alertText: { flex: 1, fontSize: 12.5, lineHeight: 18, fontWeight: '700' },
  gateMotivation: { fontSize: 12.5, lineHeight: 18, fontWeight: '600' },
  gateTease: { fontSize: 11.5, lineHeight: 17, fontWeight: '700' },
  gateActions: { marginTop: 4, flexDirection: 'row', gap: 8 },
  gateBtnPrimary: { flex: 1, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  gateBtnPrimaryText: { color: '#F8FAFC', fontSize: 12, fontWeight: '900' },
  gateBtnSecondary: { flex: 1, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  gateBtnSecondaryText: { fontSize: 12, fontWeight: '900' },
  delayDoneBtn: { borderRadius: 12, paddingVertical: 10, alignItems: 'center', marginBottom: 8 },
  delayDoneText: { fontSize: 12, fontWeight: '900' },

  content: { paddingTop: 16 },
  kickerRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  kicker: { fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  title: { marginTop: 14, fontSize: 40, fontWeight: '900', letterSpacing: -1.2, lineHeight: 42 },
  question: { marginTop: 14, fontSize: 15, lineHeight: 22, fontWeight: '600' },
  options: { gap: 12 },
  optionRow: { borderRadius: 18, padding: 14, borderWidth: 1, flexDirection: 'row', gap: 12, alignItems: 'center' },
  optionText: { flex: 1, fontSize: 14, lineHeight: 20, fontWeight: '700' },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1 },

  primaryCta: { height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  primaryText: { fontSize: 15, fontWeight: '900', letterSpacing: -0.2 },
  secondaryRow: { marginTop: 14, flexDirection: 'row', justifyContent: 'space-between' },
  secondaryCta: { alignItems: 'center', paddingVertical: 8, paddingHorizontal: 10 },
  secondaryText: { fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  result: { marginTop: 18, borderRadius: 18, padding: 14, flexDirection: 'row', gap: 10, alignItems: 'center' },
  resultText: { flex: 1, fontSize: 13, lineHeight: 18, fontWeight: '700' },
  explain: { marginTop: 12, borderRadius: 18, padding: 14 },
  explainText: { fontSize: 12.5, lineHeight: 18, fontWeight: '600' },
});
