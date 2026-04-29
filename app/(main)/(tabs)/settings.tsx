import React, { useMemo } from 'react';
import {
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme, type ThemePreference } from '../../../constants/themeContext';
import Container from '../../../components/ui/container';
import { useRouter } from 'expo-router';
import HeaderBar from '../../../components/ui/headerBar';
import { setLanguagePreference } from '../../../i18n/i18n';
import { KEYS } from '../../../lib/keys';
import { useStoredState } from '../../../lib/useStored';
import { DEFAULT_PROFILE, DEFAULT_SHIELD, DEFAULT_SUBSCRIPTION } from '../../../lib/defaults';
import type { AppProfile, ShieldConfig, Subscription } from '../../../lib/appModel';
import i18n from '../../../i18n/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { premiumFeatureFlags } from '../../../lib/featureFlags';

export default function SettingsTab() {
  const theme = useTheme();
  const colors = theme.colors;
  const s = theme.spacing;
  const router = useRouter();
  const { t } = useTranslation();

  const { value: profile } = useStoredState<AppProfile>(KEYS.profile, DEFAULT_PROFILE);
  const { value: shield } = useStoredState<ShieldConfig>(KEYS.shield, DEFAULT_SHIELD);
  const { value: sub } = useStoredState<Subscription>(KEYS.subscription, DEFAULT_SUBSCRIPTION);

  const themeLabel = useMemo(() => {
    if (theme.themePreference === 'light') return t('common.themeLight');
    if (theme.themePreference === 'dark') return t('common.themeDark');
    return t('common.themeSystem');
  }, [t, theme.themePreference]);

  const cycleLanguage = async () => {
    const next = i18n.language === 'fr' ? 'en' : 'fr';
    await setLanguagePreference(next);
  };

  const cycleTheme = async () => {
    const order: ThemePreference[] = ['light', 'dark', 'system'];
    const next = order[(order.indexOf(theme.themePreference) + 1) % order.length];
    await theme.setThemePreference(next);
  };

  const clearAll = async () => {
    Alert.alert(t('settings.resetData'), t('settings.resetDataConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.delete'),
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.clear();
        },
      },
    ]);
  };
  const flags = premiumFeatureFlags();
  const scheduleIsPremium = flags.scheduleBlocking;
  const unlockDelayIsPremium = flags.unlockDelay;
  const behaviorPenaltyIsPremium = flags.behaviorPenalty;

  const showPremiumModal = () => {
    Alert.alert(t('premiumModal.title'), t('premiumModal.body'), [
      { text: t('premiumModal.continueFree'), style: 'cancel' },
      { text: t('premiumModal.tryPremium'), onPress: () => router.push('/(main)/paywall') },
    ]);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <HeaderBar title={t('tabs.settings')} showSettings={false} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: s.xxl }}
          keyboardShouldPersistTaps="handled"
        >
          <Container paddingX="lg">
            <Text style={[styles.pageTitle, { color: colors.text }]}>{t('settings.title')}</Text>
            <Text style={[styles.pageSub, { color: colors.onSurfaceVariant }]}>{t('settings.subtitle')}</Text>

            <View style={{ height: s.lg }} />

            <Text style={[styles.section, { color: colors.onSurfaceVariant }]}>{t('settings.profileSection')}</Text>
            <View style={[styles.card, { backgroundColor: colors.surfaceContainerLow }]}>
              <Text style={[styles.mono, { color: colors.text }]}>
                {profile.situation === 'student' ? t('setup.student') : t('setup.professional')}
              </Text>
              {profile.situation === 'student' ? (
                <Text style={[styles.body, { color: colors.onSurfaceVariant }]}>
                  {(profile.level ?? '—') + ' · ' + (profile.subject ?? '—')}
                </Text>
              ) : (
                <Text style={[styles.body, { color: colors.onSurfaceVariant }]}>
                  {(profile.proTopics ?? []).join(', ') || '—'}
                  {profile.customGoal ? '\n' + profile.customGoal : ''}
                </Text>
              )}
              <View style={{ height: s.md }} />
              <TouchableOpacity style={[styles.btn, { backgroundColor: theme.isDark ? colors.secondary : colors.obsidian }]} onPress={() => router.push('/(main)/profile-edit')}>
                <Text style={[styles.btnText, { color: colors.cloud }]}>{t('settings.editProfile')}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.cloud} />
              </TouchableOpacity>
            </View>

            <View style={{ height: s.lg }} />

            <Text style={[styles.section, { color: colors.onSurfaceVariant }]}>{t('common.language')}</Text>
            <RowButton
              icon="language-outline"
              title={t('common.language')}
              subtitle={i18n.language === 'fr' ? 'FR' : 'EN'}
              onPress={() => void cycleLanguage()}
            />

            <View style={{ height: s.sm }} />

            <Text style={[styles.section, { color: colors.onSurfaceVariant }]}>{t('common.theme')}</Text>
            <RowButton icon="contrast-outline" title={t('common.theme')} subtitle={themeLabel} onPress={() => void cycleTheme()} />

            <View style={{ height: s.sm }} />

            <RowButton
              icon="time-outline"
              title={t('settings.limits')}
              subtitle={t('settings.limitsSummary', {
                session: shield.limits.sessionMaxMinutes,
                daily: shield.limits.dailyMaxMinutes,
              })}
              onPress={() => router.push('/(main)/limits')}
            />

            <View style={{ height: s.sm }} />

            <Text style={[styles.section, { color: colors.onSurfaceVariant }]}>{t('settings.focusControl')}</Text>

            <RowButton
              icon="calendar-outline"
              title={t('settings.focusSchedule')}
              subtitle={scheduleIsPremium && !sub.isPremium ? t('common.premiumLocked') : t('settings.enabled')}
              onPress={() => {
                if (scheduleIsPremium && !sub.isPremium) {
                  showPremiumModal();
                  return;
                }
                router.push('/(main)/schedule-blocking');
              }}
            />

            <View style={{ height: s.sm }} />

            <RowButton
              icon="hourglass-outline"
              title={t('settings.focusUnlockDelay')}
              subtitle={
                unlockDelayIsPremium && !sub.isPremium
                  ? t('common.premiumLocked')
                  : sub.isPremium
                  ? t('settings.focusUnlockDelayHint', { n: shield.premium?.unlockDelaySeconds ?? 0 })
                  : t('settings.enabled')
              }
              onPress={() => {
                if (unlockDelayIsPremium && !sub.isPremium) {
                  showPremiumModal();
                  return;
                }
                router.push('/(main)/unlock-delay');
              }}
            />

            <View style={{ height: s.sm }} />

            <RowButton
              icon="warning-outline"
              title={t('settings.focusBehaviorPenalty')}
              subtitle={behaviorPenaltyIsPremium && !sub.isPremium ? t('common.premiumLocked') : t('settings.enabled')}
              onPress={() => {
                if (behaviorPenaltyIsPremium && !sub.isPremium) {
                  showPremiumModal();
                  return;
                }
                router.push('/(main)/behavior-penalty');
              }}
            />

            <View style={{ height: s.sm }} />

            <RowButton
              icon="sparkles-outline"
              title={t('settings.premium')}
              subtitle={sub.isPremium ? 'ON' : 'OFF'}
              onPress={() => router.push('/(main)/paywall')}
            />

            <View style={{ height: s.sm }} />

            <RowButton
              icon="shield-checkmark-outline"
              title={t('settings.quizDemo')}
              subtitle={t('settings.quizDemoHint')}
              onPress={() => router.push('/(main)/focus-session?source=demo')}
            />

            <View style={{ height: s.sm }} />

            <RowButton
              icon="information-circle-outline"
              title={t('settings.permissions')}
              subtitle={t('settings.permissionsHint')}
              onPress={() => void Linking.openSettings()}
            />

            <RowButton
              icon="document-text-outline"
              title={t('settings.privacyPolicy')}
              subtitle={t('settings.privacyPolicyHint')}
              onPress={() => router.push('/privacy-policy' as never)}
            />
            <View style={{ height: s.sm }} />
            <RowButton
              icon="document-outline"
              title={t('settings.terms')}
              subtitle={t('settings.termsHint')}
              onPress={() => router.push('/terms-conditions' as never)}
            />
            <View style={{ height: s.sm }} />
            <View style={[styles.card, { backgroundColor: colors.surfaceContainerLow }]}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>{t('settings.contact')}</Text>
              <Text style={[styles.rowSub, { color: colors.onSurfaceVariant }]}>
                {String(process.env.EXPO_PUBLIC_CONTACT_NAME ?? '')}
              </Text>
              <Text style={[styles.rowSub, { color: colors.onSurfaceVariant }]}>
                {String(process.env.EXPO_PUBLIC_CONTACT_EMAIL ?? '')}
              </Text>
              <Text style={[styles.rowSub, { color: colors.onSurfaceVariant }]}>
                {String(process.env.EXPO_PUBLIC_CONTACT_PHONE ?? '')}
              </Text>
              <Text style={[styles.rowSub, { color: colors.onSurfaceVariant }]}>
                {String(process.env.EXPO_PUBLIC_CONTACT_LINKEDIN ?? '')}
              </Text>
            </View>
            <View style={{ height: s.sm }} />
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.danger }]} onPress={clearAll}>
                <Ionicons name="trash" size={18} color={colors.cloud} />
                <Text style={[styles.btnText, { color: colors.cloud }]}>{t('settings.resetData')}</Text>
            </TouchableOpacity>
            
          </Container>
        </ScrollView>
      </SafeAreaView>
    </View>
  );

  function RowButton({
    icon,
    title,
    subtitle,
    onPress,
  }: {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    title: string;
    subtitle: string;
    onPress: () => void;
  }) {
    return (
      <TouchableOpacity style={[styles.card, { backgroundColor: colors.surfaceContainerLow }]} activeOpacity={0.92} onPress={onPress}>
        <View style={styles.rowInner}>
          <View style={[styles.iconWrap, { backgroundColor: colors.surface }]}>
            <Ionicons name={icon} size={20} color={colors.text} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowTitle, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.rowSub, { color: colors.onSurfaceVariant }]}>{subtitle}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.onSurfaceVariant} />
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1 },
  pageTitle: { fontSize: 28, fontWeight: '900', letterSpacing: -0.8, marginTop: 4 },
  pageSub: { marginTop: 8, fontSize: 14, lineHeight: 20, maxWidth: 360, fontWeight: '600' },
  section: { fontSize: 11, fontWeight: '800', letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase' },
  card: { borderRadius: 22, padding: 14 },
  mono: { fontSize: 15, fontWeight: '800' },
  body: { marginTop: 6, fontSize: 13, lineHeight: 18, fontWeight: '600' },
  btn: { marginTop: 12, height: 44, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnText: { fontSize: 13, fontWeight: '900' },
  rowInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: 15, fontWeight: '800' },
  rowSub: { marginTop: 2, fontSize: 12.5, fontWeight: '600' },
});
