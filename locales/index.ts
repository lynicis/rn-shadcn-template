import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

import en from './en.json';
import tr from './tr.json';

const translations = {
  en,
  tr,
};

const i18n = new I18n(translations, {
  defaultLocale: 'en',
  enableFallback: true,
  locale: getLocales()[0].languageCode ?? 'en',
});

export default i18n;
