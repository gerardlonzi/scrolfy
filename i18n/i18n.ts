import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './en.json';
import fr from './fr.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KEYS } from '../lib/keys';

const resources = {
  en: { translation: en },
  fr: { translation: fr },
};

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    resources,
    lng: Localization.getLocales()[0]?.languageCode ?? 'en', // Ajoute un "?" par sécurité
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export async function hydrateLanguagePreference() {
  const stored = await AsyncStorage.getItem(KEYS.language);
  if (stored && (stored === 'fr' || stored === 'en')) {
    await i18n.changeLanguage(stored);
  }
}

export async function setLanguagePreference(lang: 'fr' | 'en' | 'system') {
  if (lang === 'system') {
    await AsyncStorage.removeItem(KEYS.language);
    const sys = Localization.getLocales()[0]?.languageCode ?? 'en';
    await i18n.changeLanguage(sys === 'fr' ? 'fr' : 'en');
    return;
  }
  await AsyncStorage.setItem(KEYS.language, lang);
  await i18n.changeLanguage(lang);
}

export default i18n;