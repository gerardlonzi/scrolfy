import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../constants/themeContext';
import Container from '../../components/ui/container';
import HeaderBar from '../../components/ui/headerBar';
import { useTranslation } from 'react-i18next';

export default function TermsConditionsScreen() {
  const theme = useTheme();
  const colors = theme.colors;
  const { t } = useTranslation();

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <HeaderBar title={t('settings.terms')} showSettings={false} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <Container paddingX="lg" style={styles.content}>
            <Text style={[styles.text, { color: colors.onSurfaceVariant }]}>{t('settings.termsBody')}</Text>
          </Container>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1 },
  content: { paddingTop: 10, paddingBottom: 24 },
  text: { fontSize: 14, lineHeight: 21, fontWeight: '600' },
});
