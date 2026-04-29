import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
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
import type { AppProfile, ShieldConfig } from '../../lib/appModel';
import { useStoredState } from '../../lib/useStored';
import { QUESTION_BANK } from '../../data/questionBank';

const STUDENT_SUBJECTS = Object.keys(QUESTION_BANK).map((s) => s.charAt(0).toUpperCase() + s.slice(1));
const PURPOSES: Array<{ id: NonNullable<AppProfile['purpose']>; label: string }> = [
  { id: 'reduce_distractions', label: 'setup.purpose.reduce_distractions' },
  { id: 'study_better', label: 'setup.purpose.study_better' },
  { id: 'increase_productivity', label: 'setup.purpose.increase_productivity' },
  { id: 'control_screen_time', label: 'setup.purpose.control_screen_time' },
];

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

  const [selectedSubject, setSelectedSubject] = useState(profile.subject ?? STUDENT_SUBJECTS[0]);
  const [purposeOpen, setPurposeOpen] = useState(false);
  const [subjectOpen, setSubjectOpen] = useState(false);
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
    setSelectedSubject(profile.subject ?? STUDENT_SUBJECTS[0]);
  }, [ready, profile.subject, profile.customGoal, profile.proTopics]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <HeaderBar title={t('setup.profile_title')} showSettings={!isEditFlow} />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
            
            <View style={[styles.progressTrack, { backgroundColor: colors.surfaceContainerLow }]}>
              <View style={[styles.progressFill, { width: '33%', backgroundColor: colors.secondary }]} />
            </View>

            <View style={{ height: s.md }} />

            <Text style={[styles.kicker, { color: colors.onSurfaceVariant }]}>SCROLFY</Text>
            <Text style={[styles.title, { color: colors.text }]}>{t('setup.profileHeadline')}</Text>
            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
              {t('setup.profileSubhead')}
            </Text>

            <View style={{ height: s.lg }} />

            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('setup.purpose.title')}</Text>

            <View style={{ height: s.lg }} />

            <SurfaceCard>
                  <Text style={[styles.fieldLabel, { color: colors.onSurfaceVariant }]}>{t('setup.purpose.selectOne')}</Text>
                  <View style={styles.dropdownWrap}>
                    <TouchableOpacity
                      style={[styles.select, { backgroundColor: colors.surface }]}
                      onPress={() => {
                        setPurposeOpen((v) => !v);
                        setSubjectOpen(false);
                      }}
                    >
                      <Text style={[styles.selectText, { color: colors.text }]}>{t(PURPOSES.find((p) => p.id === profile.purpose)?.label ?? PURPOSES[0].label)}</Text>
                      <Ionicons name={purposeOpen ? 'chevron-up' : 'chevron-down'} size={16} color={colors.onSurfaceVariant} />
                    </TouchableOpacity>
                    {purposeOpen ? (
                      <View style={[styles.dropdownList, { backgroundColor: colors.surfaceContainerLow }]}>
                        {PURPOSES.map((purpose) => (
                          <TouchableOpacity
                            key={purpose.id}
                            style={[styles.dropdownItem, { backgroundColor: colors.surface }]}
                            onPress={() => {
                              void setProfile((p) => ({ ...p, situation: 'student', purpose: purpose.id }));
                              setPurposeOpen(false);
                            }}
                          >
                            <Text style={[styles.dropdownText, { color: colors.text }]}>{t(purpose.label)}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    ) : null}
                  </View>
                  <View style={{ height: s.md }} />
                  <Text style={[styles.fieldLabel, { color: colors.onSurfaceVariant }]}>{t('setup.subject.title')}</Text>
                  <View style={styles.dropdownWrap}>
                    <TouchableOpacity
                      style={[styles.select, { backgroundColor: colors.surface }]}
                      onPress={() => {
                        setSubjectOpen((v) => !v);
                        setPurposeOpen(false);
                      }}
                    >
                      <Text style={[styles.selectText, { color: colors.text }]}>{selectedSubject}</Text>
                      <Ionicons name={subjectOpen ? 'chevron-up' : 'chevron-down'} size={16} color={colors.onSurfaceVariant} />
                    </TouchableOpacity>
                    {subjectOpen ? (
                      <View style={[styles.dropdownList, { backgroundColor: colors.surfaceContainerLow }]}>
                        {STUDENT_SUBJECTS.map((subj) => (
                          <TouchableOpacity
                            key={subj}
                            style={[styles.dropdownItem, { backgroundColor: colors.surface }]}
                            onPress={() => {
                              setSelectedSubject(subj);
                              setSubjectOpen(false);
                            }}
                          >
                            <Text style={[styles.dropdownText, { color: colors.text }]}>{subj}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    ) : null}
                  </View>
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
                const subjectFinal = selectedSubject || profile.subject || STUDENT_SUBJECTS[0];
                if (!STUDENT_SUBJECTS.includes(subjectFinal)) {
                  Alert.alert(t('setup.subject.invalidTitle'), t('setup.subject.invalidBody'));
                  return;
                }
                await setProfile((p) => ({
                  ...p,
                  situation: 'student',
                  subject: subjectFinal,
                  customGoal: '',
                  proTopics: [],
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
              <Text style={[styles.primaryCtaText, { color: colors.cloud }]}>{t('common.continue')}</Text>
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

  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  suggestion: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14 },
  suggestionText: { fontSize: 13, fontWeight: '700' },
  dropdownWrap: { position: 'relative', zIndex: 20 },
  dropdownList: { position: 'absolute', top: 52, left: 0, right: 0, gap: 8, maxHeight: 220, borderRadius: 14, padding: 8, zIndex: 30 },
  dropdownItem: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  dropdownText: { fontSize: 13.5, fontWeight: '700' },

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

