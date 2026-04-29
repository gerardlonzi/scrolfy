import React, { useMemo } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getPermissionsAsync, requestPermissionsAsync } from 'expo-notifications/build/NotificationPermissions';
import { Image } from 'expo-image';
import { useTheme } from '../../../constants/themeContext';
import Container from '../../../components/ui/container';
import { useRouter } from 'expo-router';
import HeaderBar from '../../../components/ui/headerBar';
import GradientButton from '../../../components/ui/GradientButton';
import { useStoredState } from '../../../lib/useStored';
import { KEYS } from '../../../lib/keys';
import { DEFAULT_SHIELD, DEFAULT_SUBSCRIPTION } from '../../../lib/defaults';
import type { ShieldConfig, Subscription, WatchedApp } from '../../../lib/appModel';
import { useTranslation } from 'react-i18next';
import { startMonitoring, stopMonitoring } from '../../../lib/androidInterception';
import { premiumFeatureFlags } from '../../../lib/featureFlags';

const ICONS: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  instagram: 'logo-instagram',
  facebook: 'logo-facebook',
  telegram: 'paper-plane-outline',
  whatsapp: 'logo-whatsapp',
  snapchat: 'chatbubble-ellipses-outline',
  x: 'logo-twitter',
  reddit: 'logo-reddit',
  youtube: 'logo-youtube',
  tiktok: 'musical-notes',
};

const LOGOS: Record<string, string> = {
  instagram: 'https://img.icons8.com/color/96/instagram-new.png',
  facebook: 'https://img.icons8.com/color/96/facebook-new.png',
  telegram: 'https://img.icons8.com/color/96/telegram-app.png',
  whatsapp: 'https://img.icons8.com/color/96/whatsapp.png',
  snapchat: 'https://img.icons8.com/color/96/snapchat.png',
  x: 'https://img.icons8.com/color/96/twitterx.png',
  reddit: 'https://img.icons8.com/color/96/reddit.png',
  youtube: 'https://img.icons8.com/color/96/youtube-play.png',
  tiktok: 'https://img.icons8.com/color/96/tiktok.png',
};

function getDynamicPremiumIds() {
  return new Set(
    String(process.env.EXPO_PUBLIC_PREMIUM_APP_IDS ?? '')
      .split(',')
      .map((v) => v.trim().toLowerCase())
      .filter(Boolean),
  );
}

export default function FocusTab() {
  const theme = useTheme();
  const colors = theme.colors;
  const s = theme.spacing;
  const router = useRouter();
  const { t } = useTranslation();

  const { value: shield, setValue: setShield } = useStoredState<ShieldConfig>(KEYS.shield, DEFAULT_SHIELD);
  const { value: sub } = useStoredState<Subscription>(KEYS.subscription, DEFAULT_SUBSCRIPTION);
  const [dailyOpen, setDailyOpen] = React.useState(false);
  const premiumIds = useMemo(() => getDynamicPremiumIds(), []);
  const apps = useMemo(
    () => shield.apps.map((a) => ({ ...a, premium: premiumIds.has(a.id.toLowerCase()) || Boolean(a.premium) })),
    [premiumIds, shield.apps],
  );

  const enabledSet = useMemo(() => new Set(shield.watchedAppIds), [shield.watchedAppIds]);
  const freeLimit = 3;
  const nonPremiumEnabledCount = useMemo(() => {
    const localPremiumIds = new Set(apps.filter((a) => a.premium).map((a) => a.id));
    return shield.watchedAppIds.filter((id) => !localPremiumIds.has(id)).length;
  }, [apps, shield.watchedAppIds]);
  const flags = premiumFeatureFlags();
  const permissionsComplete = useMemo(() => {
    const p = shield.permissions ?? {};
    if (!p.notificationsGranted) return false;
    if (Platform.OS === 'android' && (!p.overlayAcknowledged || !p.accessibilityAcknowledged)) return false;
    return true;
  }, [shield.permissions]);

  async function verifyAppInstalled(scheme: string | undefined): Promise<boolean> {
    if (!scheme) return true;
    try {
      return await Linking.canOpenURL(scheme);
    } catch {
      return false;
    }
  }

  async function ensureNotificationPermissionOnce(): Promise<boolean> {
    if (shield.permissions?.notificationsGranted) return true;
    try {
      const before = await getPermissionsAsync();
      if (!before.granted) {
        await requestPermissionsAsync();
      }
      const after = await getPermissionsAsync();
      const granted = Boolean(after.granted);
      await setShield((prev) => ({
        ...prev,
        permissions: {
          ...(prev.permissions ?? {}),
          notificationsRequested: true,
          notificationsGranted: granted,
        },
      }));
      return granted;
    } catch {
      await setShield((prev) => ({
        ...prev,
        permissions: { ...(prev.permissions ?? {}), notificationsRequested: true, notificationsGranted: false },
      }));
      return false;
    }
  }

  async function askBlockingPermissionsIfNeeded() {
    const granted = await ensureNotificationPermissionOnce();
    if (!granted) {
      Alert.alert(t('focus.shieldTitle'), t('focus.enableNotificationsBody'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('focus.openOsSettings'), onPress: () => void Linking.openSettings() },
      ]);
      return false;
    }

    if (Platform.OS === 'android') {
      const p = shield.permissions ?? {};
      if (!p.overlayAcknowledged || !p.accessibilityAcknowledged) {
        return await new Promise<boolean>((resolve) => {
          Alert.alert(
            t('focus.shieldTitle'),
            t('focus.enableAndroidPermissionsBody'),
            [
              { text: t('common.cancel'), style: 'cancel', onPress: () => resolve(false) },
              { text: t('focus.openOsSettings'), onPress: () => { void Linking.openSettings(); resolve(false); } },
              {
                text: t('focus.iEnabledIt'),
                onPress: async () => {
                  await setShield((prev) => ({
                    ...prev,
                    permissions: {
                      ...(prev.permissions ?? {}),
                      overlayAcknowledged: true,
                      accessibilityAcknowledged: true,
                      accessibilityGuided: true,
                    },
                  }));
                  resolve(true);
                },
              },
            ],
          );
        });
      }
    }

    return true;
  }

  function showPremiumModal() {
    Alert.alert(t('premiumModal.title'), t('premiumModal.body'), [
      { text: t('premiumModal.continueFree'), style: 'cancel' },
      { text: t('premiumModal.tryPremium'), onPress: () => router.push('/(main)/paywall') },
    ]);
  }

  async function setDailyLimit(value: number) {
    await setShield((prev) => ({
      ...prev,
      limits: { ...prev.limits, dailyMaxMinutes: value },
      enabled: false,
    }));
    setDailyOpen(false);
  }

  const isSchedulePremium = flags.scheduleBlocking;
  const isStrictPremium = flags.strictMode;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <HeaderBar title={t('tabs.focus')} />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 150 }}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'none'}
            onScrollBeginDrag={() => setDailyOpen(false)}
          >
            <Container paddingX="lg">
            {!permissionsComplete ? (
              <>
                <View style={[styles.permissionDanger, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="warning" size={16} color="#B91C1C" />
                  <Text style={[styles.permissionDangerText, { color: '#7F1D1D' }]}>
                    {t('common.activePermissionNotif')}
                  </Text>
                </View>
                <View style={{ height: s.md }} />
              </>
            ) : null}
            <Text style={[styles.title, { color: colors.text }]}>{t('focus.appsTitle')}</Text>
            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>{t('focus.appsSubtitle')}</Text>

            <View style={{ height: s.xl }} />

            <View style={[styles.listCard, { backgroundColor: colors.surfaceContainerLow }]}>
              {apps.map((app, idx) => (
                <View key={app.id}>
                  <AppRow
                    app={app}
                    value={enabledSet.has(app.id)}
                    onToggle={async (v) => {
                      if (app.premium && !sub.isPremium) {
                        showPremiumModal();
                        return;
                      }

                      if (!sub.isPremium && v) {
                        if (!app.premium && nonPremiumEnabledCount >= freeLimit) {
                          showPremiumModal();
                          return;
                        }
                      }

                      if (v) {
                        const ok = await verifyAppInstalled(app.scheme);
                        if (!ok) {
                          Alert.alert(
                            t('focus.notInstalledTitle'),
                            t('focus.notInstalledBody', { name: app.name, scheme: app.scheme ?? '' }),
                          );
                          return;
                        }
                      }

                      await setShield((prev) => {
                        const set = new Set(prev.watchedAppIds);
                        if (v) set.add(app.id);
                        else set.delete(app.id);
                        return { ...prev, watchedAppIds: Array.from(set), enabled: false };
                      });

                      if (v) {
                        await askBlockingPermissionsIfNeeded();
                      }
                    }}
                  />
                  {idx < apps.length - 1 ? <View style={{ height: 8 }} /> : null}
                </View>
              ))}
            </View>

            <View style={{ height: s.xl }} />

            <View style={[styles.listCard, { backgroundColor: colors.surfaceContainerLow }]}>
              <Text style={[styles.controlHeader, { color: colors.text }]}>{t('focus.controlHeader')}</Text>
              <View style={{ height: s.sm }} />
              <View style={styles.controlRowSpaced}>
                <Text style={[styles.controlLabel, { color: colors.text }]}>{t('focus.dailyLimit')}</Text>
                <TouchableOpacity
                  style={[styles.dailyDropdown, { backgroundColor: colors.surface }]}
                  onPress={() => setDailyOpen((v) => !v)}
                >
                  <Text style={[styles.dailyDropdownText, { color: colors.text }]}>
                    {shield.limits.dailyMaxMinutes === 30
                      ? '30min'
                      : shield.limits.dailyMaxMinutes === 60
                        ? '1h'
                        : shield.limits.dailyMaxMinutes === 120
                          ? '2h'
                          : t('focus.custom')}
                  </Text>
                  <Ionicons name={dailyOpen ? 'chevron-up' : 'chevron-down'} size={14} color={colors.onSurfaceVariant} />
                </TouchableOpacity>
              </View>
              {dailyOpen ? (
                <View style={[styles.dropdownList, { backgroundColor: colors.surface }]}>
                  <TouchableOpacity style={styles.dropdownItem} onPress={() => void setDailyLimit(30)}>
                    <Text style={[styles.dropdownText, { color: colors.text }]}>30min</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.dropdownItem} onPress={() => void setDailyLimit(60)}>
                    <Text style={[styles.dropdownText, { color: colors.text }]}>1h</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.dropdownItem} onPress={() => void setDailyLimit(120)}>
                    <Text style={[styles.dropdownText, { color: colors.text }]}>2h</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setDailyOpen(false);
                      router.push('/(main)/limits');
                    }}
                  >
                    <Text style={[styles.dropdownText, { color: colors.text }]}>{t('focus.custom')}</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
              <TouchableOpacity
                style={styles.controlRowSpaced}
                onPress={() => {
                  if (isSchedulePremium && !sub.isPremium) {
                    showPremiumModal();
                  }
                }}
              >
                <Text style={[styles.controlLabel, { color: colors.text }]}>{t('focus.schedule')}</Text>
                {isSchedulePremium && !sub.isPremium ? (
                  <View style={[styles.premiumPill, { backgroundColor: theme.isDark ? '#3D1A4D' : '#F5E9FF' }]}>
                    <Ionicons name="diamond" size={11} color={theme.isDark ? '#E9D5FF' : '#7E22CE'} />
                    <Text style={[styles.premiumText, { color: theme.isDark ? '#E9D5FF' : '#7E22CE' }]}>{t('common.premiumLocked')}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.controlRowSpaced}
                onPress={() => {
                  if (isStrictPremium && !sub.isPremium) {
                    showPremiumModal();
                  }
                }}
              >
                <Text style={[styles.controlLabel, { color: colors.text }]}>{t('focus.strictMode')}</Text>
                {isStrictPremium && !sub.isPremium ? (
                  <View style={[styles.premiumPill, { backgroundColor: theme.isDark ? '#3D1A4D' : '#F5E9FF' }]}>
                    <Ionicons name="diamond" size={11} color={theme.isDark ? '#E9D5FF' : '#7E22CE'} />
                    <Text style={[styles.premiumText, { color: theme.isDark ? '#E9D5FF' : '#7E22CE' }]}>{t('common.premiumLocked')}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            </View>

            <View style={{ height: s.md }} />
            <Text style={[styles.helper, { color: colors.onSurfaceVariant }]}>
              {t('focus.selectedCount', { n: shield.watchedAppIds.length, total: shield.apps.length })}
              {sub.isPremium ? ` · ${t('focus.premium')}` : ` · ${t('focus.free')}`}
            </Text>
            </Container>
          </ScrollView>
          <View style={[styles.stickyFooter, { backgroundColor: colors.background }]}>
            <Container paddingX="lg">
              <GradientButton
                title={shield.enabled ? t('focus.stop') : t('focus.activate')}
                onPress={async () => {
                  if (shield.enabled) {
                    await setShield((prev) => ({ ...prev, enabled: false }));
                    await stopMonitoring();
                    return;
                  }
                  if (!shield.watchedAppIds.length) {
                    Alert.alert(t('focus.requiredTitle'), t('focus.requiredSelectionBody'));
                    return;
                  }

                  const ready = await askBlockingPermissionsIfNeeded();
                  if (!ready) return;

                  await setShield((prev) => ({ ...prev, enabled: true, sessionStartedAt: Date.now() }));
                  await startMonitoring();
                  router.push('/(main)/focus-session');
                }}
                style={styles.primaryCta}
                left={<Ionicons name="shield-checkmark" size={18} color={colors.obsidian} />}
              />
            </Container>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );

  function AppRow({ app, value, onToggle }: { app: WatchedApp; value: boolean; onToggle: (v: boolean) => void | Promise<void> }) {
    const isLocked = Boolean(app.premium) && !sub.isPremium;
    const icon = ICONS[app.id] ?? 'apps-outline';
    return (
      <View style={styles.appRow}>
        <View style={[styles.appIcon, { backgroundColor: colors.surface }]}>
          {LOGOS[app.id] ? (
            <Image source={{ uri: LOGOS[app.id] }} style={styles.logo} contentFit="contain" />
          ) : (
            <Ionicons name={icon} size={20} color={colors.text} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.appTitleRow}>
            <Text style={[styles.appName, { color: colors.text }]}>{app.name}</Text>
            {isLocked ? (
              <View style={[styles.premiumPill, { backgroundColor: theme.isDark ? '#3D1A4D' : '#F5E9FF' }]}>
                <Ionicons name="diamond" size={11} color={theme.isDark ? '#E9D5FF' : '#7E22CE'} />
                <Text style={[styles.premiumText, { color: theme.isDark ? '#E9D5FF' : '#7E22CE' }]}>PREMIUM</Text>
              </View>
            ) : null}
          </View>
          <Text style={[styles.appCategory, { color: colors.onSurfaceVariant }]}>{app.category}</Text>
        </View>
        <View
          style={{
            borderWidth: 1.5,
            borderColor: colors.secondary,
            borderRadius: 22,
            paddingHorizontal: 2,
            paddingVertical: 2,
            justifyContent: 'center',
          }}
        >
          <Switch
            value={value}
            onValueChange={(v) => void onToggle(v)}
            trackColor={{ false: theme.isDark ? '#334155' : '#CBD5E1', true: colors.secondary }}
            thumbColor={value ? colors.cloud : theme.isDark ? '#E2E8F0' : '#475569'}
            ios_backgroundColor={theme.isDark ? '#334155' : '#CBD5E1'}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1 },

  title: { fontSize: 44, fontWeight: '900', letterSpacing: -1.6, lineHeight: 46, marginTop: 8 },
  subtitle: { fontSize: 15, lineHeight: 22, marginTop: 10, maxWidth: 340 },

  listCard: { borderRadius: 26, padding: 12 },
  appRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 5, paddingHorizontal: 5},
  appIcon: { width: 36, height: 36, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  appTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  appName: { fontSize: 16, fontWeight: '900', letterSpacing: -0.2 },
  appCategory: { marginTop: 2, fontSize: 12.5, fontWeight: '600' },

  premiumPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  premiumText: { fontSize: 9.5, fontWeight: '900', letterSpacing: 0.8 },

  primaryCta: { height: 60, borderRadius: 18, flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center' },
  primaryCtaText: { fontSize: 16, fontWeight: '900', letterSpacing: -0.2 },
  helper: { textAlign: 'center', fontSize: 12, fontWeight: '600' },
  permissionDanger: {
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  permissionDangerText: { flex: 1, fontSize: 12, lineHeight: 17, fontWeight: '700' },

  logo: { width: 22, height: 22 },
  controlHeader: { fontSize: 14, fontWeight: '900' },
  controlRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  controlRowSpaced: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 12 },
  controlLabel: { fontSize: 13.5, fontWeight: '700' },
  dailyDropdown: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, minWidth: 90, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  dailyDropdownText: { fontSize: 12, fontWeight: '800' },
  dropdownList: { marginTop: 8, borderRadius: 14, overflow: 'hidden' },
  dropdownItem: { paddingHorizontal: 12, paddingVertical: 10 },
  dropdownText: { fontSize: 12.5, fontWeight: '700' },
  stickyFooter: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingBottom: 10, paddingTop: 8 },
});
