import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../constants/themeContext';
import Container from '../../components/ui/container';
import GradientButton from '../../components/ui/GradientButton';
import { useRouter } from 'expo-router';
import HeaderBar from '../../components/ui/headerBar';
import { useStoredState } from '../../lib/useStored';
import { KEYS } from '../../lib/keys';
import { DEFAULT_SUBSCRIPTION } from '../../lib/defaults';
import type { Subscription } from '../../lib/appModel';

export default function PaywallScreen() {
  const theme = useTheme();
  const colors = theme.colors;
  const s = theme.spacing;
  const router = useRouter();
  const { value: sub, setValue: setSub } = useStoredState<Subscription>(KEYS.subscription, DEFAULT_SUBSCRIPTION);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <HeaderBar title="Scrolfy Premium" showSettings={false} />

        <Container paddingX="lg" style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>Libérez votre focus.</Text>
          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
            Atteignez vos objectifs avec la méthode Obsidian. Transformez votre distraction en productivité pure avec nos outils d’élite.
          </Text>

          <View style={{ height: s.xl }} />

          <View style={[styles.tableCard, { backgroundColor: colors.surfaceContainerLow }]}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableTitle, { color: colors.onSurfaceVariant }]}>FONCTIONNALITÉS</Text>
              <Text style={[styles.tableCol, { color: colors.onSurfaceVariant }]}>GRATUIT</Text>
              <Text style={[styles.tableCol, { color: colors.onSurfaceVariant }]}>PREMIUM</Text>
            </View>

            <FeatureRow name="Apps bloquées" free="1" premium="✓" />
            <FeatureRow name="IA Omnisciente" free="—" premium="✓" />
            <FeatureRow name="Mode Offline" free="—" premium="✓" />
            <FeatureRow name="Sujets personnalisés" free="Basique" premium="✓" />
          </View>

          <View style={{ height: s.xl }} />

          <GradientButton
            variant="premium"
            title="Commencer l’essai gratuit de 3 jours"
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

          <Text style={[styles.price, { color: colors.onSurfaceVariant }]}>Puis 9,99€/mois</Text>
          <Text style={[styles.cancel, { color: colors.onSurfaceVariant }]}>Annulable à tout moment</Text>

          <View style={{ height: s.md }} />

          <View style={styles.footerRow}>
            <Text style={[styles.footerLink, { color: colors.onSurfaceVariant }]}>Confidentialité</Text>
            <Text style={[styles.footerLink, { color: colors.onSurfaceVariant }]}>Conditions</Text>
            <Text style={[styles.footerLink, { color: colors.onSurfaceVariant }]}>Aide</Text>
          </View>
        </Container>
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
});

