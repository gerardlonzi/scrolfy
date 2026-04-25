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
  TextInput,
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

export default function FocusTab() {
  const theme = useTheme();
  const colors = theme.colors;
  const s = theme.spacing;
  const router = useRouter();
  const { t } = useTranslation();

  const { value: shield, setValue: setShield } = useStoredState<ShieldConfig>(KEYS.shield, DEFAULT_SHIELD);
  const { value: sub } = useStoredState<Subscription>(KEYS.subscription, DEFAULT_SUBSCRIPTION);
  const [customName, setCustomName] = React.useState('');
  const [customScheme, setCustomScheme] = React.useState('');

  const enabledSet = useMemo(() => new Set(shield.watchedAppIds), [shield.watchedAppIds]);
  const freeLimit = 1;
  const nonPremiumEnabledCount = useMemo(() => {
    const premiumIds = new Set(shield.apps.filter((a) => a.premium).map((a) => a.id));
    return shield.watchedAppIds.filter((id) => !premiumIds.has(id)).length;
  }, [shield.apps, shield.watchedAppIds]);
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

  function normalizeName(name: string) {
    return name.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  function schemeKey(scheme: string) {
    return scheme.trim().toLowerCase().replace(/:\/+$/, '');
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
      Alert.alert(t('focus.shieldTitle'), 'Activez les notifications dans les reglages pour continuer.', [
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
            'Activez aussi Accessibilite et Autorisation overlay dans les reglages Android pour le blocage en temps reel.',
            [
              { text: t('common.cancel'), style: 'cancel', onPress: () => resolve(false) },
              { text: t('focus.openOsSettings'), onPress: () => { void Linking.openSettings(); resolve(false); } },
              {
                text: "J'ai active",
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
            contentContainerStyle={{ paddingBottom: s.xxl }}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'none'}
          >
            <Container paddingX="lg">
            {!permissionsComplete ? (
              <>
                <View style={[styles.permissionDanger, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="warning" size={16} color="#B91C1C" />
                  <Text style={[styles.permissionDangerText, { color: '#7F1D1D' }]}>
                    Sans activation des permissions Android (notifications, accessibilite, overlay), le blocage des apps ne sera pas possible.
                  </Text>
                </View>
                <View style={{ height: s.md }} />
              </>
            ) : null}
            <Text style={[styles.title, { color: colors.text }]}>{t('focus.appsTitle')}</Text>
            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>{t('focus.appsSubtitle')}</Text>

            <View style={{ height: s.xl }} />

            <View style={[styles.listCard, { backgroundColor: colors.surfaceContainerLow }]}>
              {shield.apps.map((app, idx) => (
                <View key={app.id}>
                  <AppRow
                    app={app}
                    value={enabledSet.has(app.id)}
                    onToggle={async (v) => {
                      if (app.premium && !sub.isPremium) {
                        router.push('/(main)/paywall');
                        return;
                      }

                      if (!sub.isPremium && v) {
                        if (!app.premium && nonPremiumEnabledCount >= freeLimit) {
                          Alert.alert(t('focus.freeLimitTitle'), t('focus.freeLimitBody'));
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
                        return { ...prev, watchedAppIds: Array.from(set) };
                      });

                      if (v) {
                        await askBlockingPermissionsIfNeeded();
                      }
                    }}
                  />
                  {idx < shield.apps.length - 1 ? <View style={{ height: 8 }} /> : null}
                </View>
              ))}
            </View>

            <View style={{ height: s.lg }} />

            <View style={[styles.customCard, { backgroundColor: colors.surfaceContainerLow }]}>
              <Text style={[styles.customTitle, { color: colors.text }]}>{t('focus.customTitle')}</Text>
              <Text style={[styles.customHint, { color: colors.onSurfaceVariant }]}>{t('focus.customHint')}</Text>
              <View style={{ height: s.md }} />
              <View style={[styles.inputRow, { backgroundColor: colors.surface }]}>
                <TextInput
                  value={customName}
                  onChangeText={setCustomName}
                  placeholder={t('focus.customNamePh')}
                  placeholderTextColor={colors.onSurfaceVariant}
                  style={[styles.input, { color: colors.text }]}
                  blurOnSubmit={false}
                />
              </View>
              <View style={{ height: s.sm }} />
              <View style={[styles.inputRow, { backgroundColor: colors.surface }]}>
                <TextInput
                  value={customScheme}
                  onChangeText={setCustomScheme}
                  placeholder={t('focus.customSchemePh')}
                  placeholderTextColor={colors.onSurfaceVariant}
                  style={[styles.input, { color: colors.text }]}
                  autoCapitalize="none"
                  blurOnSubmit={false}
                />
              </View>
              <View style={{ height: s.md }} />
              <TouchableOpacity
                style={[styles.addBtn, { backgroundColor: theme.isDark ? colors.secondary : colors.obsidian }]}
                activeOpacity={0.9}
                onPress={async () => {
                  const name = customName.trim();
                  if (!name) {
                    Alert.alert('Champ requis', 'Veuillez entrer un nom d application.');
                    return;
                  }
                  const scheme = customScheme.trim();
                  if (!scheme) {
                    Alert.alert(t('focus.schemeRequiredTitle'), t('focus.schemeRequiredBody'));
                    return;
                  }
                  const ok = await verifyAppInstalled(scheme);
                  if (!ok) {
                    Alert.alert(t('focus.notInstalledTitle'), t('focus.customInvalidScheme'));
                    return;
                  }
                  const nameKey = normalizeName(name);
                  const duplicate = shield.apps.some((a) => normalizeName(a.name) === nameKey);
                  if (duplicate) {
                    Alert.alert(t('focus.duplicateTitle'), t('focus.duplicateBody', { name }));
                    return;
                  }
                  const id = `custom:${nameKey.replace(/\s+/g, '-')}:${schemeKey(scheme)}`;
                  await setShield((prev) => ({
                    ...prev,
                    apps: [{ id, name, category: 'Custom', scheme }, ...prev.apps],
                  }));
                  setCustomName('');
                  setCustomScheme('');
                }}
              >
                <Text style={[styles.addBtnText, { color: colors.cloud }]}>{t('focus.add')}</Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: s.xl }} />

            <GradientButton
              title={t('focus.activate')}
              onPress={async () => {
                if (!shield.watchedAppIds.length) {
                  Alert.alert('Selection requise', 'Selectionnez au moins une application a bloquer.');
                  return;
                }

                const ready = await askBlockingPermissionsIfNeeded();
                if (!ready) return;

                await setShield((prev) => ({ ...prev, enabled: true, sessionStartedAt: Date.now() }));
                router.push('/(main)/focus-session');
              }}
              style={styles.primaryCta}
              left={<Ionicons name="shield-checkmark" size={18} color={colors.obsidian} />}
            />

            <View style={{ height: s.md }} />
            <Text style={[styles.helper, { color: colors.onSurfaceVariant }]}>
              {t('focus.selectedCount', { n: shield.watchedAppIds.length, total: shield.apps.length })}
              {sub.isPremium ? ` · ${t('focus.premium')}` : ` · ${t('focus.free')}`}
            </Text>
            </Container>
          </ScrollView>
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
              <View style={[styles.premiumPill, { backgroundColor: colors.surface }]}>
                <Ionicons name="lock-closed" size={12} color={colors.onSurfaceVariant} />
                <Text style={[styles.premiumText, { color: colors.onSurfaceVariant }]}>PREMIUM</Text>
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
  appRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 10 },
  appIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  appTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  appName: { fontSize: 16, fontWeight: '900', letterSpacing: -0.2 },
  appCategory: { marginTop: 2, fontSize: 12.5, fontWeight: '600' },

  premiumPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  premiumText: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },

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

  customCard: { borderRadius: 26, padding: 14 },
  customTitle: { fontSize: 14, fontWeight: '900', letterSpacing: -0.2 },
  customHint: { marginTop: 6, fontSize: 12.5, lineHeight: 18, fontWeight: '600' },
  inputRow: { minHeight: 46, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 10 },
  input: { flex: 1, fontSize: 14, fontWeight: '600' },
  addBtn: { height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { fontSize: 13, fontWeight: '900' },
  logo: { width: 26, height: 26 },
});
