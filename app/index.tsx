import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, Image, Appearance } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  runOnJS
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../constants/themeContext';
import { useRouter } from 'expo-router'
import Container from '../components/ui/container';
import { getJson } from '../lib/storage';
import { KEYS } from '../lib/keys';
import { DEFAULT_PROFILE } from '../lib/defaults';
import type { AppProfile } from '../lib/appModel';

export default function SplashScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter()
  // État pour le texte du pourcentage
  const [percent, setPercent] = useState(0);

  // Animation de pulsation du logo
  const logoScale = useSharedValue(1);
  
  // Animation de la barre de progression (0 à 1)
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    const finishLoading = () => {
      void (async () => {
        const profile = await getJson<AppProfile>(KEYS.profile, DEFAULT_PROFILE);
        if (profile.completedOnboarding) {
          router.replace('/(main)/(tabs)/focus');
        } else {
          router.replace('/(auth)/onboarding-first');
        }
      })();
    };
  
    // 1. Lancement de la pulsation
    logoScale.value = withRepeat(
      withSequence(
        withTiming(0.95, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1, true
    );
  
    // 2. Lancement du chargement avec runOnJS pour la navigation
    progressWidth.value = withTiming(1, { duration: 3000 }, (isFinished) => {
      if (isFinished) {
        runOnJS(finishLoading)();
      }
    });
  
    // 3. Mise à jour du texte du pourcentage
    let interval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 28);
  
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- splash doit tourner une seule fois
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  const barStyle =
    theme.themePreference === 'dark' || (theme.themePreference === 'system' && Appearance.getColorScheme() === 'dark')
      ? 'light-content'
      : 'dark-content';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={barStyle} />
      

      <View style={styles.main}>
        <Animated.View style={[styles.logoContainer, animatedLogoStyle]}>
          <LinearGradient
            colors={['#1E293B', theme.colors.cloud]}
            style={styles.logoBox}
          >
            {/* --- EMPLACEMENT DE TON LOGO --- */}
            {/* Si ton logo est un PNG/JPG, décommente la ligne ci-dessous et importe ton image */}
            <Image source={require('../assets/images/logo.png')} style={styles.myCustomLogo} />
            
            
          </LinearGradient>
        </Animated.View>
      </View>

      <Container style={styles.footer} paddingX="lg">
        <Text style={styles.quote}>{t('splash.quote')}</Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <Animated.View style={[styles.progressFill, animatedProgressStyle, { backgroundColor: theme.colors.emerald }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.label}>{t('splash.init')}</Text>
            <Text style={styles.label}>{percent}%</Text>
          </View>
        </View>
      </Container>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  main: {
    flex: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoBox: {
    borderRadius: 40,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 45,

  },
  myCustomLogo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',

  },
  prismShape: {
    width: 60,
    height: 60,
    transform: [{ rotate: '45deg' }],
  },
  footer: {
    width: '100%',
    paddingBottom: 60,
  },
  quote: {
    color: '#64748B',
    fontSize: 14,
    marginBottom: 48,
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  progressContainer: {
    width: '100%',
  },
  progressBarBackground: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  label: {
    fontSize: 10,
    color: '#64748B',
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontFamily: 'PlusJakartaSans-Bold',
  },
});