import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Localization from 'expo-localization';
import { useTheme } from '../../constants/themeContext';
import Container from '../../components/ui/container';
import GradientButton from '../../components/ui/GradientButton';
import { useRouter } from 'expo-router';
import HeaderBar from '../../components/ui/headerBar';
import { useStoredState } from '../../lib/useStored';
import { KEYS } from '../../lib/keys';
import { DEFAULT_SUBSCRIPTION } from '../../lib/defaults';
import type { Subscription } from '../../lib/appModel';
import { useTranslation } from 'react-i18next';

export default function PaywallScreen() {
  const theme = useTheme();
  const colors = theme.colors;
  const s = theme.spacing;
  const router = useRouter();
  const { t } = useTranslation();
  const { value: sub, setValue: setSub } = useStoredState<Subscription>(KEYS.subscription, DEFAULT_SUBSCRIPTION);
  const country = Localization.getLocales()[0]?.regionCode ?? 'FR';
  const currency = String(process.env.DEFAULT_CURRENCY ?? 'EUR');
  const monthly = Number(process.env.PREMIUM_MONTHLY_PRICE ?? 4.99);
  const yearly = Number(process.env.PREMIUM_YEARLY_PRICE ?? 39.99);
  const formatPrice = (value: number) =>
    new Intl.NumberFormat(country === 'FR' ? 'fr-FR' : 'en-GB', { style: 'currency', currency }).format(value);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <HeaderBar title="Scrolfy Premium" showSettings={false} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: s.xl }}>
        <Container paddingX="lg" style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>{t('paywall.title')}</Text>
          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
            {t('paywall.subtitle')}
          </Text>

          <View style={{ height: s.xl }} />

          <View style={[styles.tableCard, { backgroundColor: colors.surfaceContainerLow }]}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableTitle, { color: colors.onSurfaceVariant }]}>{t('paywall.features')}</Text>
              <Text style={[styles.tableCol, { color: colors.onSurfaceVariant }]}>{t('paywall.free')}</Text>
              <Text style={[styles.tableCol, { color: colors.onSurfaceVariant }]}>{t('paywall.premium')}</Text>
            </View>

            <FeatureRow name={t('paywall.rows.upTo3Apps')} free="✓" premium="✓" />
            <FeatureRow name={t('paywall.rows.simpleDailyLimit')} free="✓" premium="✓" />
            <FeatureRow name={t('paywall.rows.unlimitedApps')} free="—" premium="✓" />
            <FeatureRow name={t('paywall.rows.strictMode')} free="—" premium="✓" />
            <FeatureRow name={t('paywall.rows.scheduleBlocking')} free="—" premium="✓" />
            <FeatureRow name={t('paywall.rows.unlockDelay')} free="—" premium="✓" />
            <FeatureRow name={t('paywall.rows.behaviorPenalty')} free="—" premium="✓" />
            <FeatureRow name={t('paywall.rows.advancedAnalytics')} free="Basic" premium="✓" />
          </View>

          <View style={{ height: s.xl }} />

          <View style={styles.socialProofWrap}>
            <View style={styles.avatars}>
              <View style={[styles.avatar, { backgroundColor: '#F59E0B' }]} />
              <View style={[styles.avatar, { backgroundColor: '#3B82F6', marginLeft: -10 }]} />
              <View style={[styles.avatar, { backgroundColor: '#10B981', marginLeft: -10 }]} />
            </View>
            <Text style={[styles.socialProofText, { color: colors.onSurfaceVariant }]}>{t('paywall.socialProof')}</Text>
          </View>
          <GradientButton
            variant="premium"
            title={t('paywall.ctaTrial')}
            onPress={() => {}}
            style={styles.primaryCta}
            left={<Ionicons name="sparkles" size={16} color={colors.cloud} />}
          />
          <TouchableOpacity
            style={[styles.secondaryCta, { backgroundColor: colors.surfaceContainerLow }]}
            activeOpacity={0.92}
            onPress={() => void setSub({ isPremium: true })}
          >
            <Text style={[styles.secondaryText, { color: colors.text }]}>
              (Dev) Activer Premium : {sub.isPremium ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.price, { color: colors.onSurfaceVariant }]}>
            {formatPrice(monthly)} / month · {formatPrice(yearly)} / year
          </Text>
          <Text style={[styles.cancel, { color: colors.onSurfaceVariant }]}>{t('paywall.hint')}</Text>

          <View style={{ height: s.md }} />

          <View style={styles.footerRow}>
            <Text style={[styles.footerLink, { color: colors.onSurfaceVariant }]}>Confidentialité</Text>
            <Text style={[styles.footerLink, { color: colors.onSurfaceVariant }]}>Conditions</Text>
            <Text style={[styles.footerLink, { color: colors.onSurfaceVariant }]}>Aide</Text>
          </View>
        </Container>
        </ScrollView>
      </SafeAreaView>
    </View>
  );

  function FeatureRow({ name, free, premium }: { name: string; free: string; premium: string }) {
    return (
      <View style={styles.row}>
        <Text style={[styles.featureName, { color: colors.text }]}>{name}</Text>
        <Text style={[styles.featureCell, { color: colors.onSurfaceVariant }]}>{free}</Text>
        <Text style={[styles.featureCell, { color: colors.secondary }]}>{premium}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1 },
  content: { paddingTop: 8 },
  title: { fontSize: 44, fontWeight: '900', letterSpacing: -1.6, lineHeight: 46, marginTop: 10 },
  subtitle: { fontSize: 15, lineHeight: 22, marginTop: 12, maxWidth: 360 },

  tableCard: { borderRadius: 26, padding: 14 },
  tableHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  tableTitle: { flex: 1, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  tableCol: { width: 74, textAlign: 'center', fontSize: 10, fontWeight: '900', letterSpacing: 1.6 },

  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  featureName: { flex: 1, fontSize: 14, fontWeight: '800' },
  featureCell: { width: 74, textAlign: 'center', fontSize: 13, fontWeight: '900' },

  primaryCta: { height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  primaryText: { fontSize: 15, fontWeight: '900', letterSpacing: -0.2 },
  secondaryCta: { marginTop: 10, height: 48, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { fontSize: 12.5, fontWeight: '800' },
  price: { marginTop: 12, textAlign: 'center', fontSize: 12.5, fontWeight: '700' },
  cancel: { marginTop: 6, textAlign: 'center', fontSize: 11.5, fontWeight: '700' },

  footerRow: { marginTop: 18, flexDirection: 'row', justifyContent: 'space-between' },
  footerLink: { fontSize: 11, fontWeight: '800' },
  socialProofWrap: { marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatars: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#fff' },
  socialProofText: { fontSize: 12, fontWeight: '700' },
});

