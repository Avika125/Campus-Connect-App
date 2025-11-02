// src/utils/i18n.js

import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translations
import en from '../translations/en';
import es from '../translations/es';

// Create i18n instance
const i18n = new I18n({
  en: en,
  es: es,
});

// Get device locale safely, default to 'en' if undefined
const deviceLocale = Localization.locale || 'en';
const languageCode = deviceLocale.split('-')[0]; // Extract 'en' from 'en-US'

// Set the locale with fallback
i18n.locale = ['en', 'es'].includes(languageCode) ? languageCode : 'en';

// Enable fallback to English if translation is missing
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

// Language storage key
const LANGUAGE_KEY = '@campus_connect_language';

// Get saved language from storage
export const getStoredLanguage = async () => {
  try {
    const language = await AsyncStorage.getItem(LANGUAGE_KEY);
    return language || 'en';
  } catch (error) {
    console.log('Error getting language:', error);
    return 'en';
  }
};

// Save language to storage
export const saveLanguage = async (language) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
    i18n.locale = language;
  } catch (error) {
    console.log('Error saving language:', error);
  }
};

// Change language
export const changeLanguage = async (language) => {
  await saveLanguage(language);
  i18n.locale = language;
};

// Get current language
export const getCurrentLanguage = () => {
  return i18n.locale || 'en';
};

// Available languages
export const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

// Translation function
export const translate = (key, options = {}) => {
  return i18n.t(key, options);
};

export default i18n;
