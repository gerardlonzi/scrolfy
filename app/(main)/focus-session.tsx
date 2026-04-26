import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
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
import { useLocalSearchParams } from 'expo-router';
import { useStoredState } from '../../lib/useStored';
import { KEYS } from '../../lib/keys';
import { DEFAULT_PROFILE, DEFAULT_SHIELD, DEFAULT_STATS, dayKey } from '../../lib/defaults';
import type { AppProfile, ShieldConfig, Stats } from '../../lib/appModel';
import { generateQuestion } from '../../lib/quiz';
import { useTranslation } from 'react-i18next';



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
  const { value: profile } = useStoredState<AppProfile>(KEYS.profile, DEFAULT_PROFILE);
  const { value: shield } = useStoredState<ShieldConfig>(KEYS.shield, DEFAULT_SHIELD);
  const { value: stats, setValue: setStats } = useStoredState<Stats>(KEYS.stats, DEFAULT_STATS);
  const statsRef = useRef(stats);
  const { t } = useTranslation();


  statsRef.current = stats;

  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'offline' | 'ai'>('offline');
  const [q, setQ] = useState<QState | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

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

  const loadQuestion = useCallback(async () => {
    setLoading(true);
    setRevealed(false);
    setSelected(null);
    const asked = statsRef.current.askedQuestionIds ?? [];
    const res = await generateQuestion(profile, asked);
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
    setLoading(false);
  }, [profile, setStats]);

  useEffect(() => {
    void loadQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chargement initial uniquement
  }, []);

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
        <HeaderBar title="Interception" showSettings={false} />

        {!permissionsComplete ? (
          <Container paddingX="xl" style={styles.alertWrap}>
            <View style={[styles.alert, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="warning" size={16} color="#B91C1C" />
              <Text style={[styles.alertText, { color: '#7F1D1D' }]}>
              {t('common.activePermissionNotif')} </Text>
            </View>
          </Container>
        ) : null}

        {shouldShowAlert && !isDemo ? (
          <Container paddingX="xl" style={styles.alertWrap}>
            <View style={[styles.alert, { backgroundColor: theme.isDark ? 'rgba(254,226,226,0.22)' : '#FEE2E2' }]}>
              <Ionicons name="warning" size={16} color="#B91C1C" />
              <Text style={[styles.alertText, { color: theme.isDark ? '#FECACA' : '#7F1D1D' }]}>
                Attention : vous avez dépassé votre limite de scroll définie. Validez ce quiz pour continuer.
              </Text>
            </View>
          </Container>
        ) : null}

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: s.xxl }}
          showsVerticalScrollIndicator={false}
        >
          <Container paddingX="lg" style={styles.content}>
            <View style={styles.kickerRow}>
              <Ionicons name="sparkles" size={14} color={theme.isDark ? colors.secondary : colors.obsidian} />
              <Text style={[styles.kicker, { color: muted }]}>SCROLFY · {source.toUpperCase()}</Text>
            </View>

            <Text style={[styles.title, { color: colors.text }]}>Vérification de{'\n'}focus</Text>
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
              title="Valider ma réponse"
              onPress={async () => {
                setRevealed(true);
                if (!q || selected == null) return;

                await setStats((prev) => {
                  const today = dayKey();
                  const answered = prev.answered + 1;
                  const correct = prev.correct + (selected === q.correctIndex ? 1 : 0);

                  let streak = prev.streakDays;
                  if (selected === q.correctIndex) {
                    if (prev.lastQuizDayKey && prev.lastQuizDayKey !== today) {
                      const prevDate = new Date(prev.lastQuizDayKey);
                      const todayDate = new Date(today);
                      const diffDays = Math.round((todayDate.getTime() - prevDate.getTime()) / 86_400_000);
                      streak = diffDays === 1 ? streak + 1 : 1;
                    } else if (!prev.lastQuizDayKey) {
                      streak = 1;
                    }
                  }

                  return {
                    ...prev,
                    answered,
                    correct,
                    lastQuizDayKey: selected === q.correctIndex ? today : prev.lastQuizDayKey,
                    streakDays: streak,
                    savedMinutes: prev.savedMinutes + (selected === q.correctIndex ? 10 : 0),
                    lastMastery: selected === q.correctIndex ? { title: q.prompt.slice(0, 48), scorePct: 100, at: Date.now() } : prev.lastMastery,
                  };
                });
              }}
              style={[styles.primaryCta, { opacity: selected == null || loading ? 0.45 : 1 }]}
              left={<Ionicons name="checkmark-circle" size={18} color={colors.obsidian} />}
            />

            <View style={styles.secondaryRow}>
              <TouchableOpacity style={styles.secondaryCta} activeOpacity={0.9} onPress={() => void loadQuestion()}>
                <Text style={[styles.secondaryText, { color: muted }]}>AUTRE QUESTION</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryCta} activeOpacity={0.9} onPress={() => setRevealed(true)}>
                <Text style={[styles.secondaryText, { color: muted }]}>AFFICHER</Text>
              </TouchableOpacity>
            </View>

            {revealed ? (
              <View style={[styles.result, { backgroundColor: cardBg }]}>
                <Ionicons name={isCorrect ? 'checkmark-circle' : 'close-circle'} size={18} color={isCorrect ? '#10B981' : '#F87171'} />
                <Text style={[styles.resultText, { color: colors.text }]}>
                  {isCorrect
                    ? 'Bravo ! Vous avez gagné 10 minutes d’accès.'
                    : 'Dommage. Retentez une autre question ou fermez l’application.'}
                </Text>
              </View>
            ) : null}

            {revealed && q?.explanation ? (
              <View style={[styles.explain, { backgroundColor: cardBg }]}>
                <Text style={[styles.explainText, { color: muted }]}>{q.explanation}</Text>
              </View>
            ) : null}
          </Container>
        </ScrollView>
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
  alertText: { flex: 1, fontSize: 12.5, lineHeight: 18, fontWeight: '700' },

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
