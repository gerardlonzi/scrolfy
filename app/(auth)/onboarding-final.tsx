import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView, Platform } from 'react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons'; 
import { useTheme } from '../../constants/themeContext'; 
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { getJson } from '../../lib/storage';
import { KEYS } from '../../lib/keys';
import { DEFAULT_PROFILE } from '../../lib/defaults';
import type { AppProfile } from '../../lib/appModel';
import Container from '../../components/ui/container';

const { width } = Dimensions.get('window');

export default function OnboardingFinal() {
  const theme = useTheme();
  const { t } = useTranslation();
  const colors = theme.colors;
  const router = useRouter();
  const s = theme.spacing;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.backgroundDecor}>
        <View style={[styles.blurCircle, { top: -50, right: -50, backgroundColor: colors.secondary, opacity: 0.1 }]} />
        <View style={[styles.blurCircle, { bottom: -50, left: -50, backgroundColor: colors.primary, opacity: 0.05 }]} />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <Container style={styles.main} paddingX="xl">
          <Animated.View entering={FadeInUp.delay(200).duration(1000)} style={styles.graphicContainer}>
          <View style={[styles.tonalCard, { backgroundColor: colors.surfaceContainerLow }]}>
            <View style={[styles.glassEffect, { backgroundColor: colors.surface, opacity: 0.4 }]} />
            
            <View style={styles.iconWrapper}>
              <View style={styles.mainIconContainer}>
                <Ionicons name="school" size={80} color={colors.text} />
                <View style={[styles.badge, { backgroundColor: '#6cf8bb' }]}>
                  <Ionicons name="lock-open" size={24} color="#002113" />
                </View>
              </View>
              <View style={[styles.decorativeLine, { backgroundColor: colors.secondary, opacity: 0.3 }]} />
            </View>
          </View>
          </Animated.View>

          {/* Texte Final Dynamique */}
          <Animated.View entering={FadeInUp.delay(400)} style={styles.textContent}>
            <Text style={[styles.title, { color: colors.text }]}>{t('onboarding.slide3.title')}</Text>
            <Text style={[styles.description, { color: colors.onSurfaceVariant }]}>{t('onboarding.slide3.description')}</Text>
          </Animated.View>

          {/* Bouton d'Action Dynamique */}
          <Animated.View entering={FadeInDown.delay(600)} style={styles.actionArea}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: theme.isDark ? colors.secondary : colors.obsidian }]}
              activeOpacity={0.9}
              onPress={async () => {
                const profile = await getJson<AppProfile>(KEYS.profile, DEFAULT_PROFILE);
                if (profile.completedOnboarding) {
                  router.replace('/(main)/(tabs)/focus');
                } else {
                  router.replace('/(auth)/profile-setup');
                }
              }}
            >
              <Text style={[styles.buttonText, { color: colors.cloud }]}>{t('onboarding.buttons.start')}</Text>
            </TouchableOpacity>
          </Animated.View>
        </Container>
      </SafeAreaView>

      <Container style={[styles.footer, { bottom: s.xxl }]} paddingX="xl">
        <View style={styles.pagination}>
          <View style={[styles.dot, { backgroundColor: colors.slate, opacity: 0.3 }]} />
          <View style={[styles.dot, { backgroundColor: colors.slate, opacity: 0.3 }]} />
          <View style={[styles.dotActive, { backgroundColor: colors.secondary }]} />
        </View>
      </Container>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
  backgroundDecor: { ...StyleSheet.absoluteFillObject, zIndex: 0 },
  blurCircle: { position: 'absolute', width: width, height: width, borderRadius: width / 2 },
  safeArea: { flex: 1 },
  main: { flex: 1, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  graphicContainer: { width: 260, height: 260, marginBottom: 60 },
  tonalCard: { flex: 1, borderRadius: 48, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  glassEffect: { position: 'absolute', inset: 16, borderRadius: 24 },
  iconWrapper: { alignItems: 'center', justifyContent: 'center' },
  mainIconContainer: { position: 'relative', marginBottom: 16 },
  badge: {
    position: 'absolute', top: -8, right: -8, padding: 10, borderRadius: 20,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  decorativeLine: { height: 6, width: 64, borderRadius: 3, marginTop: 8 },
  textContent: { alignItems: 'center', gap: 20, marginBottom: 48 },
  title: { fontSize: 42, fontWeight: '800', textAlign: 'center', lineHeight: 46, letterSpacing: -1.5 },
  description: { fontSize: 19, textAlign: 'center', lineHeight: 28, maxWidth: 420 },
  actionArea: { width: '100%' },
  primaryButton: {
    width: '100%', paddingVertical: 20, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20 },
      android: { elevation: 8 },
    }),
  },
  buttonText: { fontSize: 18, fontWeight: '700', letterSpacing: -0.2 },
  footer: { position: 'absolute', width: '100%', alignItems: 'center' },
  pagination: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { width: 40, height: 8, borderRadius: 4 },
});