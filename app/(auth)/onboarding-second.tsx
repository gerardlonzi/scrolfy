import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons'; 
import { useTheme } from '../../constants/themeContext'; 
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import Container from '../../components/ui/container';

export default function OnboardingSecond() {
  const theme = useTheme();
  const { t } = useTranslation();
  const colors = theme.colors;
  const router = useRouter();
  const s = theme.spacing;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.backgroundDecor}>
        <View style={[styles.blurCircle, { top: -100, right: -100, backgroundColor: colors.secondary, opacity: 0.08 }]} />
        <View style={[styles.blurCircle, { bottom: 100, left: -100, backgroundColor: colors.primary, opacity: 0.1 }]} />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <Container style={styles.main} paddingX="xl">
          <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.heroGraphic}>
          <View style={styles.cycleContainer}>
            <View style={[styles.ringBase, { borderColor: colors.slate, opacity: 0.2 }]} />
            <View style={[styles.ringActive, { borderColor: colors.text, borderTopColor: 'transparent', borderRightColor: 'transparent' }]} />
            
            <View style={[styles.centerCard, { backgroundColor: colors.surface }]}>
              <Ionicons name="hourglass-outline" size={60} color={colors.text} />
            </View>

            <View style={[styles.floatingBadge, { backgroundColor: '#6cf8bb' }]}>
              <Ionicons name="checkmark-circle" size={24} color="#005236" />
            </View>
          </View>
          </Animated.View>

          {/* Texte Editorial Dynamique */}
          <Animated.View entering={FadeInUp.delay(400)} style={styles.textContent}>
            <Text style={[styles.title, { color: colors.text }]}>{t('onboarding.slide2.title')}</Text>
            <Text style={[styles.description, { color: colors.onSurfaceVariant }]}>{t('onboarding.slide2.description')}</Text>
          </Animated.View>
        </Container>
      </SafeAreaView>

      <Container style={[styles.footer, { paddingBottom: s.xxl }]} paddingX="xl">
        <View style={styles.pagination}>
          <View style={[styles.dot, { backgroundColor: colors.slate, opacity: 0.3 }]} />
          <View style={[styles.dotActive, { backgroundColor: colors.secondary }]} />
          <View style={[styles.dot, { backgroundColor: colors.slate, opacity: 0.3 }]} />
        </View>

        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: theme.isDark ? colors.secondary : colors.obsidian }]}
          activeOpacity={0.8}
          onPress={() => router.push('/(auth)/onboarding-final')}
        >
          <Ionicons name="arrow-forward" size={32} color={colors.cloud} />
        </TouchableOpacity>
      </Container>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
  backgroundDecor: { ...StyleSheet.absoluteFillObject },
  blurCircle: { position: 'absolute', width: 400, height: 400, borderRadius: 200 },
  safeArea: { flex: 1 },
  main: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroGraphic: { marginBottom: 60, alignItems: 'center', justifyContent: 'center' },
  cycleContainer: { width: 240, height: 240, alignItems: 'center', justifyContent: 'center' },
  ringBase: { position: 'absolute', width: '100%', height: '100%', borderRadius: 120, borderWidth: 6 },
  ringActive: { position: 'absolute', width: '100%', height: '100%', borderRadius: 120, borderWidth: 6, transform: [{ rotate: '-15deg' }] },
  centerCard: {
    width: 120, height: 120, borderRadius: 32, alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 15 },
      android: { elevation: 3 },
    })
  },
  floatingBadge: { position: 'absolute', top: 10, right: 25, padding: 8, borderRadius: 20 },
  textContent: { width: '100%', gap: 16 },
  title: { fontSize: 44, fontWeight: '800', lineHeight: 46, letterSpacing: -1.5, textAlign: 'center' },
  description: { fontSize: 18, lineHeight: 28, fontWeight: '500', textAlign: 'center', maxWidth: 420 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pagination: { flexDirection: 'row', gap: 8 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotActive: { width: 32, height: 6, borderRadius: 3 },
  nextButton: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});