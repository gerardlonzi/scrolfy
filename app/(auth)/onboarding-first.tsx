import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView, Platform } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons'; 
import { useTheme } from '../../constants/themeContext'; 
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import Container from '../../components/ui/container';
import { getJson } from '../../lib/storage';
import { KEYS } from '../../lib/keys';
import { DEFAULT_PROFILE } from '../../lib/defaults';
import type { AppProfile } from '../../lib/appModel';


const { width } = Dimensions.get('window');

export default function OnboardingFirst() {
  const theme = useTheme();
  const { t } = useTranslation();
  const colors = theme.colors;
  const router = useRouter();
  const s = theme.spacing;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <Container style={styles.main} paddingX="xl">
        
        {/* Bouton Passer */}
        <View style={[styles.topAction, { top: Platform.OS === 'ios' ? s.lg : s.xl, right: s.xl }]}>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={async () => {
              const profile = await getJson<AppProfile>(KEYS.profile, DEFAULT_PROFILE);
              if (profile.completedOnboarding) {
                router.replace('/(main)/(tabs)/focus');
              } else {
                router.replace('/(auth)/onboarding-final');
              }
            }}
          >
            <Text style={[styles.skipText, { color: colors.onSurfaceVariant }]}>{t('onboarding.buttons.skip')}</Text>
          </TouchableOpacity>
        </View>

        {/* Section Graphique */}
        <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.graphicContainer}>
          <View style={[styles.layerBase, styles.layer1, { backgroundColor: colors.slate, opacity: 0.2 }]} />
          <View style={[styles.layerBase, styles.layer2, { backgroundColor: colors.slate, opacity: 0.1 }]} />
          
          <View style={[styles.mainCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.iconCircle, { backgroundColor: colors.obsidian }]}>
              <Ionicons name="lock-closed" size={44} color={colors.secondary} />
            </View>

            <View style={styles.scrollIndicatorContainer}>
              <View style={[styles.bar, styles.barFull, { backgroundColor: colors.cloud }]}>
                <View style={[styles.barProgress, { backgroundColor: colors.secondary }]} />
              </View>
              <View style={[styles.bar, styles.bar75, { backgroundColor: colors.cloud }]} />
              <View style={[styles.bar, styles.bar50, { backgroundColor: colors.cloud }]} />
            </View>

            <View style={styles.floatingTopLeft}>
              <Ionicons name="finger-print-outline" size={26} color={colors.secondary} style={{ opacity: 0.45 }} />
            </View>
            <View style={styles.floatingBottomRight}>
              <Ionicons name="book-outline" size={26} color={colors.secondary} style={{ opacity: 0.45 }} />
            </View>
          </View>
        </Animated.View>

        {/* Zone de Texte Dynamique */}
        <Animated.View entering={FadeInUp.delay(400)} style={styles.textContent}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('onboarding.slide1.title')}
          </Text>
          <Text style={[styles.description, { color: colors.onSurfaceVariant }]}>
            {t('onboarding.slide1.description')}
          </Text>
        </Animated.View>
        </Container>
      </SafeAreaView>

      {/* Footer de Navigation */}
      <Container style={styles.footer} paddingX="xl">
        <View style={styles.pagination}>
          <View style={[styles.dot, { backgroundColor: colors.slate, opacity: 0.3 }]} />
          <View style={[styles.dotActive, { backgroundColor: colors.secondary }]} />
          <View style={[styles.dot, { backgroundColor: colors.slate, opacity: 0.3 }]} />
        </View>

        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: theme.isDark ? colors.secondary : colors.obsidian }]}
          activeOpacity={0.8}
          onPress={() => router.push('/(auth)/onboarding-second')}
        >
          <Ionicons name="arrow-forward" size={32} color={colors.cloud} />
        </TouchableOpacity>
      </Container>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topAction: {
    position: 'absolute',
  },
  skipText: { fontSize: 16, fontWeight: '600' },
  graphicContainer: {
    width: width * 0.8,
    aspectRatio: 1,
    marginBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  layerBase: { position: 'absolute', width: '100%', height: '100%', borderRadius: 48 },
  layer1: { transform: [{ rotate: '4deg' }, { scale: 0.96 }] },
  layer2: { transform: [{ rotate: '-3deg' }] },
  mainCard: {
    width: '100%', height: '100%', borderRadius: 48, alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12 },
      android: { elevation: 2 },
    })
  },
  iconCircle: { width: 90, height: 90, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  scrollIndicatorContainer: { width: 140, gap: 10 },
  bar: { height: 6, borderRadius: 10, overflow: 'hidden' },
  barFull: { width: '100%' },
  bar75: { width: '75%' },
  bar50: { width: '50%' },
  barProgress: { width: '65%', height: '100%' },
  floatingTopLeft: { position: 'absolute', top: 35, left: 35 },
  floatingBottomRight: { position: 'absolute', bottom: 35, right: 35 },
  textContent: { alignItems: 'center', gap: 16 },
  title: { fontSize: 40, fontWeight: '900', textAlign: 'center', lineHeight: 44, letterSpacing: -1 },
  description: { fontSize: 18, textAlign: 'center', lineHeight: 26, marginBottom: 80, maxWidth: 360 },
  footer: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  pagination: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { width: 24, height: 8, borderRadius: 4 },
  nextButton: {
    width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 12 },
      android: { elevation: 5 },
    })
  },
});