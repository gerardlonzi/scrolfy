import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../constants/themeContext';
import Container from '../../components/ui/container';
import { usePathname, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import HeaderBar from '../../components/ui/headerBar';
import { KEYS } from '../../lib/keys';
import { DEFAULT_PROFILE, DEFAULT_SHIELD } from '../../lib/defaults';
import type { AppProfile, ShieldConfig, Situation } from '../../lib/appModel';
import { useStoredState } from '../../lib/useStored';

const LEVELS = ['6ème', '5ème', '4ème', '3ème', 'Seconde', 'Première', 'Terminale', 'Licence', 'Master', 'Doctorat'];
const STUDENT_SUBJECTS = ['Philosophie', 'Mathématiques', 'Physique', 'Histoire', 'Anglais', 'Économie', 'Informatique'];
const PRO_TOPICS = ['Leadership', 'Gestion de Projet', 'Management', 'Finance', 'Culture Générale', 'Motivation', 'Langues'];

export default function ProfileSetupScreen() {
  const theme = useTheme();
  const colors = theme.colors;
  const s = theme.spacing;
  const router = useRouter();
  const pathname = usePathname();
  const isEditFlow = pathname.includes('profile-edit');
  const { t } = useTranslation();

  const { value: profile, setValue: setProfile, ready } = useStoredState<AppProfile>(KEYS.profile, DEFAULT_PROFILE);
  const { value: shield, setValue: setShield } = useStoredState<ShieldConfig>(KEYS.shield, DEFAULT_SHIELD);

  const [query, setQuery] = useState(profile.subject ?? 'Philosophie');
  const [customGoal, setCustomGoal] = useState(profile.customGoal ?? '');
  const didInitInputs = useRef(false);
  const permissionsComplete = useMemo(() => {
    const p = shield.permissions ?? {};
    if (!p.notificationsGranted) return false;
    if (Platform.OS === 'android' && (!p.overlayAcknowledged || !p.accessibilityAcknowledged)) return false;
    return true;
  }, [shield.permissions]);

  useEffect(() => {
    if (!ready) return;
    if (didInitInputs.current) return;
    didInitInputs.current = true;
    setQuery(profile.subject ?? '');
    setCustomGoal(profile.customGoal ?? '');
  }, [ready, profile.subject, profile.customGoal]);

  const levelIndex = useMemo(() => Math.max(0, LEVELS.indexOf(profile.level ?? 'Doctorat')), [profile.level]);
  const subjectSuggestions = useMemo(() => {
    const q = (query ?? '').trim().toLowerCase();
    if (!q) return STUDENT_SUBJECTS;
    return STUDENT_SUBJECTS.filter((s) => s.toLowerCase().includes(q));
  }, [query]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <HeaderBar title={t('setup.profile_title')} showSettings={!isEditFlow} />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        >
          <ScrollView
            contentContainerStyle={{ paddingBottom: s.xxl }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'none'}
            automaticallyAdjustKeyboardInsets
          >
          <Container paddingX="xl">
            {!permissionsComplete ? (
              <>
                <View style={[styles.warningBox, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="warning" size={16} color="#B91C1C" />
                  <Text style={[styles.warningText, { color: '#7F1D1D' }]}>
                    Sans activation des permissions Android (notifications, accessibilite, overlay), le blocage des apps ne sera pas possible.
                  </Text>
                </View>
                <View style={{ height: s.md }} />
              </>
            ) : null}
            <View style={[styles.progressTrack, { backgroundColor: colors.surfaceContainerLow }]}>
              <View style={[styles.progressFill, { width: '33%', backgroundColor: colors.secondary }]} />
            </View>

            <View style={{ height: s.md }} />

            <Text style={[styles.kicker, { color: colors.onSurfaceVariant }]}>SCROLFY</Text>
            <Text style={[styles.title, { color: colors.text }]}>Quelle est votre{'\n'}situation ?</Text>
            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
              Personnalisons votre sanctuaire d’apprentissage pour maximiser votre flow.
            </Text>

            <View style={{ height: s.lg }} />

            <ChoiceCard
              active={profile.situation === 'student'}
              title="Élève / Étudiant"
              description="Pour ceux qui naviguent dans le monde académique."
              iconName="school-outline"
              onPress={() => void setProfile((p) => ({ ...p, situation: 'student' }))}
            />
            <View style={{ height: s.md }} />
            <ChoiceCard
              active={profile.situation === 'pro'}
              title="Professionnel"
              description="Pour ceux qui optimisent leur carrière et compétences."
              iconName="briefcase-outline"
              onPress={() => void setProfile((p) => ({ ...p, situation: 'pro' }))}
            />

            <View style={{ height: s.xl }} />

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Précisez vos objectifs</Text>

            <View style={{ height: s.lg }} />

            <SurfaceCard>
              {profile.situation === 'student' ? (
                <>
                  <Text style={[styles.fieldLabel, { color: colors.onSurfaceVariant }]}>Définissez votre niveau</Text>
                  <TouchableOpacity
                    style={[styles.select, { backgroundColor: colors.surface }]}
                    onPress={() => void setProfile((p) => ({ ...p, level: LEVELS[(levelIndex + 1) % LEVELS.length] }))}
                    accessibilityRole="button"
                  >
                    <Text style={[styles.selectText, { color: colors.text }]}>{profile.level ?? 'Doctorat'}</Text>
                    <Ionicons name="chevron-down" size={18} color={colors.onSurfaceVariant} />
                  </TouchableOpacity>

                  <View style={{ height: s.md }} />

                  <Text style={[styles.fieldLabel, { color: colors.onSurfaceVariant }]}>Matière cible</Text>
                  <View style={[styles.inputRow, { backgroundColor: colors.surface }]}>
                    <TextInput
                      value={query}
                      onChangeText={(v) => {
                        setQuery(v);
                        void setProfile((p) => ({ ...p, subject: v }));
                      }}
                      placeholder="Ex: Philosophie"
                      placeholderTextColor={colors.onSurfaceVariant}
                      style={[styles.input, { color: colors.text }]}
                      blurOnSubmit={false}
                    />
                    <Ionicons name="search" size={18} color={colors.onSurfaceVariant} />
                  </View>
                  <View style={{ height: s.sm }} />
                  <View style={styles.suggestions}>
                    {subjectSuggestions.slice(0, 6).map((subj) => (
                      <TouchableOpacity
                        key={subj}
                        style={[styles.suggestion, { backgroundColor: colors.surface }]}
                        onPress={() => {
                          setQuery(subj);
                          void setProfile((p) => ({ ...p, subject: subj }));
                        }}
                      >
                        <Text style={[styles.suggestionText, { color: colors.text }]}>{subj}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              ) : (
                <>
                  <Text style={[styles.fieldLabel, { color: colors.onSurfaceVariant }]}>Sujets d’intérêt</Text>
                  <View style={styles.chipsRow}>
                    {PRO_TOPICS.map((t) => (
                      <TopicChip
                        key={t}
                        text={t}
                        active={Boolean(profile.proTopics?.includes(t))}
                        onToggle={() =>
                          void setProfile((p) => {
                            const cur = new Set(p.proTopics ?? []);
                            if (cur.has(t)) cur.delete(t);
                            else cur.add(t);
                            return { ...p, proTopics: Array.from(cur) };
                          })
                        }
                      />
                    ))}
                  </View>

                  <View style={{ height: s.md }} />

                  <Text style={[styles.fieldLabel, { color: colors.onSurfaceVariant }]}>Objectif personnalisé</Text>
                  <View style={[styles.inputRow, { backgroundColor: colors.surface }]}>
                    <TextInput
                      value={customGoal}
                      onChangeText={(v) => {
                        setCustomGoal(v);
                        void setProfile((p) => ({ ...p, customGoal: v }));
                      }}
                      placeholder="Ex: Négociation, Productivité…"
                      placeholderTextColor={colors.onSurfaceVariant}
                      style={[styles.input, { color: colors.text }]}
                      blurOnSubmit={false}
                    />
                    <Ionicons name="sparkles-outline" size={18} color={colors.onSurfaceVariant} />
                  </View>
                </>
              )}
            </SurfaceCard>

            <View style={{ height: s.xl }} />

            <View style={styles.privacyRow}>
              <Ionicons name="shield-checkmark" size={14} color={colors.secondary} />
              <Text style={[styles.privacyText, { color: colors.onSurfaceVariant }]}>Données privées et sécurisées</Text>
            </View>

            <View style={{ height: s.lg }} />

            <TouchableOpacity
              style={[styles.primaryCta, { backgroundColor: theme.isDark ? colors.secondary : colors.obsidian }]}
              activeOpacity={0.9}
              onPress={async () => {
                const subjectFinal =
                  profile.situation === 'student' ? (query.trim() || profile.subject || 'Philosophie') : profile.subject;
                const goalFinal = profile.situation === 'pro' ? customGoal.trim() : profile.customGoal ?? '';
                await setProfile((p) => ({
                  ...p,
                  subject: subjectFinal,
                  customGoal: goalFinal,
                  ...(!isEditFlow ? { completedOnboarding: true } : {}),
                }));
                if (!isEditFlow) {
                  await setShield((c) => ({ ...c, enabled: false }));
                  router.replace('/(main)/(tabs)/focus');
                } else {
                  router.back();
                }
              }}
            >
              <Text style={[styles.primaryCtaText, { color: colors.cloud }]}>Suivant</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.cloud} />
            </TouchableOpacity>
          </Container>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );

  function SurfaceCard({ children }: { children: React.ReactNode }) {
    return <View style={[styles.surfaceCard, { backgroundColor: colors.surfaceContainerLow }]}>{children}</View>;
  }

  function ChoiceCard({
    active,
    title,
    description,
    iconName,
    onPress,
  }: {
    active: boolean;
    title: string;
    description: string;
    iconName: any;
    onPress: () => void;
  }) {
    return (
      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.9}
        onPress={onPress}
        style={[
          styles.choiceCard,
          {
            backgroundColor: colors.surfaceContainerLow,
            borderColor: active ? colors.secondary : 'transparent',
          },
        ]}
      >
        <View style={[styles.choiceIcon, { backgroundColor: colors.surface }]}>
          <Ionicons name={iconName} size={18} color={colors.text} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.choiceTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.choiceDesc, { color: colors.onSurfaceVariant }]}>{description}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  function Chip({ text }: { text: string }) {
    return (
      <View style={[styles.chip, { backgroundColor: colors.surface }]}>
        <Text style={[styles.chipText, { color: colors.text }]}>{text}</Text>
      </View>
    );
  }

  function TopicChip({ text, active, onToggle }: { text: string; active: boolean; onToggle: () => void }) {
    return (
      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.9}
        onPress={onToggle}
        style={[
          styles.chip,
          {
            backgroundColor: active ? colors.secondary : colors.surface,
          },
        ]}
      >
        <Text style={[styles.chipText, { color: active ? colors.obsidian : colors.text }]}>{text}</Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1 },
  header: { paddingTop: 10, paddingBottom: 10 },
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brand: { fontSize: 16, fontWeight: '800', letterSpacing: -0.2 },
  lang: { fontSize: 12, fontWeight: '700' },
  progressTrack: { height: 4, borderRadius: 999, overflow: 'hidden', marginTop: 12 },
  progressFill: { height: '100%', borderRadius: 999 },

  kicker: { fontSize: 11, letterSpacing: 2, fontWeight: '800' },
  title: { fontSize: 38, lineHeight: 40, letterSpacing: -1.2, fontWeight: '900', marginTop: 14 },
  subtitle: { fontSize: 15, lineHeight: 22, marginTop: 10, maxWidth: 340 },

  choiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 20,
    borderWidth: 2,
  },
  choiceIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  choiceTitle: { fontSize: 15, fontWeight: '800' },
  choiceDesc: { fontSize: 12.5, marginTop: 2, lineHeight: 18 },

  sectionTitle: { fontSize: 18, fontWeight: '900', letterSpacing: -0.2 },
  surfaceCard: { padding: 14, borderRadius: 24 },

  fieldLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 },
  select: { height: 46, borderRadius: 16, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectText: { fontSize: 14, fontWeight: '700' },

  inputRow: { height: 46, borderRadius: 16, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  input: { flex: 1, fontSize: 14, fontWeight: '600' },

  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  suggestion: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14 },
  suggestionText: { fontSize: 13, fontWeight: '700' },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14 },
  chipText: { fontSize: 13, fontWeight: '700' },

  privacyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  privacyText: { fontSize: 12, fontWeight: '600' },

  primaryCta: { height: 58, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  primaryCtaText: { fontSize: 16, fontWeight: '900', letterSpacing: -0.2 },
  warningBox: {
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  warningText: { flex: 1, fontSize: 12, lineHeight: 17, fontWeight: '700' },
});

