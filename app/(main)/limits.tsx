import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import HeaderBar from '../../components/ui/headerBar';
import Container from '../../components/ui/container';
import { useTheme } from '../../constants/themeContext';
import { KEYS } from '../../lib/keys';
import { DEFAULT_SHIELD } from '../../lib/defaults';
import type { ShieldConfig } from '../../lib/appModel';
import { useStoredState } from '../../lib/useStored';
import { useRouter } from 'expo-router';

export default function LimitsScreen() {
  const theme = useTheme();
  const colors = theme.colors;
  const s = theme.spacing;
  const router = useRouter();

  const { value: shield, setValue: setShield } = useStoredState<ShieldConfig>(KEYS.shield, DEFAULT_SHIELD);

  const [session, setSession] = useState(String(shield.limits.sessionMaxMinutes));
  const [daily, setDaily] = useState(String(shield.limits.dailyMaxMinutes));
  const [remind, setRemind] = useState(String(shield.limits.remindAfterMinutes));

  useEffect(() => {
    setSession(String(shield.limits.sessionMaxMinutes));
    setDaily(String(shield.limits.dailyMaxMinutes));
    setRemind(String(shield.limits.remindAfterMinutes));
  }, [shield.limits.sessionMaxMinutes, shield.limits.dailyMaxMinutes, shield.limits.remindAfterMinutes]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <HeaderBar title="Limites" />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        >
          <ScrollView
            keyboardShouldPersistTaps="always"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'none'}
            automaticallyAdjustKeyboardInsets
            contentContainerStyle={{ paddingBottom: s.xxl }}
          >
            <Container paddingX="lg" style={{ paddingTop: 10 }}>
              <Text style={[styles.title, { color: colors.text }]}>Définir vos limites</Text>
              <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
                Ces limites servent à déclencher l’interception (quiz) lorsque le temps de scroll dépasse le seuil.
              </Text>

              <View style={{ height: s.xl }} />

              <Card>
                <Field
                  label="Max par session (minutes)"
                  value={session}
                  onChangeText={setSession}
                  onBlur={() => void persist('sessionMaxMinutes', session)}
                  hint="0 = désactivé"
                />
                <Spacer h={s.md} />
                <Field
                  label="Max par jour (minutes)"
                  value={daily}
                  onChangeText={setDaily}
                  onBlur={() => void persist('dailyMaxMinutes', daily)}
                  hint="0 = désactivé"
                />
                <Spacer h={s.md} />
                <Field
                  label="Rappel après (minutes)"
                  value={remind}
                  onChangeText={setRemind}
                  onBlur={() => void persist('remindAfterMinutes', remind)}
                  hint="Ex: 120 → après 2 h d’affilée"
                />

                <View style={{ height: s.lg }} />

                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: theme.isDark ? colors.secondary : colors.obsidian }]}
                  activeOpacity={0.9}
                  onPress={async () => {
                    await persist('sessionMaxMinutes', session);
                    await persist('dailyMaxMinutes', daily);
                    await persist('remindAfterMinutes', remind);
                    router.back();
                  }}
                >
                  <Text style={[styles.saveText, { color: colors.cloud }]}>Enregistrer</Text>
                </TouchableOpacity>
              </Card>

              <View style={{ height: s.lg }} />

              <Card>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Réinitialiser</Text>
                <Text style={[styles.small, { color: colors.onSurfaceVariant }]}>Revenir aux valeurs par défaut.</Text>
                <View style={{ height: s.md }} />
                <TouchableOpacity
                  style={[styles.resetBtn, { backgroundColor: colors.surface }]}
                  activeOpacity={0.9}
                  onPress={() => {
                    setSession(String(DEFAULT_SHIELD.limits.sessionMaxMinutes));
                    setDaily(String(DEFAULT_SHIELD.limits.dailyMaxMinutes));
                    setRemind(String(DEFAULT_SHIELD.limits.remindAfterMinutes));
                    void setShield((p) => ({ ...p, limits: DEFAULT_SHIELD.limits }));
                  }}
                >
                  <Text style={[styles.resetText, { color: colors.text }]}>Réinitialiser</Text>
                </TouchableOpacity>
              </Card>
            </Container>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );

  async function persist(key: keyof ShieldConfig['limits'], raw: string) {
    const n = Math.max(0, Math.min(24 * 60, parseInt(raw.replace(/[^\d]/g, ''), 10) || 0));
    await setShield((prev) => ({
      ...prev,
      limits: { ...prev.limits, [key]: n },
    }));
  }

  function Card({ children }: { children: React.ReactNode }) {
    return <View style={[styles.card, { backgroundColor: colors.surfaceContainerLow }]}>{children}</View>;
  }

  function Spacer({ h }: { h: number }) {
    return <View style={{ height: h }} />;
  }

  function Field({
    label,
    hint,
    value,
    onChangeText,
    onBlur,
  }: {
    label: string;
    hint: string;
    value: string;
    onChangeText: (v: string) => void;
    onBlur: () => void;
  }) {
    return (
      <View>
        <Text style={[styles.fieldLabel, { color: colors.onSurfaceVariant }]}>{label}</Text>
        <View style={[styles.inputRow, { backgroundColor: colors.surface }]}>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            onBlur={onBlur}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={colors.onSurfaceVariant}
            style={[styles.input, { color: colors.text }]}
            blurOnSubmit={false}
          />
        </View>
        <Text style={[styles.hint, { color: colors.onSurfaceVariant }]}>{hint}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1 },
  title: { fontSize: 28, fontWeight: '900', letterSpacing: -1.0 },
  subtitle: { marginTop: 10, fontSize: 14, lineHeight: 20, maxWidth: 360, fontWeight: '600' },
  card: { borderRadius: 26, padding: 14 },
  sectionTitle: { fontSize: 14, fontWeight: '900', letterSpacing: -0.2 },
  small: { marginTop: 6, fontSize: 12.5, lineHeight: 18, fontWeight: '600' },
  fieldLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 },
  inputRow: { minHeight: 48, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6, flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, fontSize: 16, fontWeight: '700' },
  hint: { marginTop: 8, fontSize: 12, fontWeight: '600' },
  resetBtn: { height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  resetText: { fontSize: 13, fontWeight: '900' },
  saveBtn: { height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  saveText: { fontSize: 14, fontWeight: '900' },
});
