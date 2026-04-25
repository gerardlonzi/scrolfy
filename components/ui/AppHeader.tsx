import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../constants/themeContext';
import Container from './container';

type Props = {
  title: string;
  /** Bouton réglages (onglet Settings) */
  showSettings?: boolean;
  /** Bouton retour (désactiver sur un écran racine si besoin) */
  showBack?: boolean;
  right?: React.ReactNode;
  /** Fond personnalisé (ex: écran interception sombre) */
  backgroundColor?: string;
  titleColor?: string;
  iconColor?: string;
};

export default function AppHeader({
  title,
  showSettings = true,
  showBack = true,
  right,
  backgroundColor,
  titleColor,
  iconColor,
}: Props) {
  const router = useRouter();
  const navigation = useNavigation();
  const theme = useTheme();
  const colors = theme.colors;
  const insets = useSafeAreaInsets();
  const bg = backgroundColor ?? colors.background;
  const tc = titleColor ?? colors.text;
  const ic = iconColor ?? (theme.isDark ? colors.secondary : colors.text);

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      router.replace('/(main)/(tabs)/focus');
    }
  };

  return (
    <View style={[styles.safeWrap, { paddingTop: Math.max(insets.top, 8), backgroundColor: bg }]}>
      <Container paddingX="xl" style={styles.row}>
        {showBack ? (
          <TouchableOpacity accessibilityRole="button" onPress={goBack} style={styles.sideBtn}>
            <Ionicons name="chevron-back" size={24} color={ic} />
          </TouchableOpacity>
        ) : (
          <View style={styles.sideBtn} />
        )}
        <View style={styles.titleWrap}>
          <Text style={[styles.title, { color: tc }]} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <View style={styles.sideBtn}>
          {right}
          {showSettings && !right ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Réglages"
              onPress={() => router.push('/(main)/(tabs)/settings')}
            >
              <Ionicons name="settings-outline" size={22} color={ic} />
            </TouchableOpacity>
          ) : null}
        </View>
      </Container>
    </View>
  );
}

const styles = StyleSheet.create({
  safeWrap: { width: '100%' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8 },
  sideBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  titleWrap: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  title: { fontSize: 16, fontWeight: '800', letterSpacing: -0.2 },
});
