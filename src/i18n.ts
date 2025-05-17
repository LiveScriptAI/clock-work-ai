
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en-GB',
    supportedLngs: [
      'en-GB','en-US','en-CA','es','es-MX','fr','fr-CA','de','it',
      'pt-PT','pt-BR','nl','pl','sv','da','nb','ru','ar','hi','bn',
      'zh-CN','zh-TW','ja','ko','id'
    ],
    ns: ['common'],
    defaultNS: 'common',
    backend: { loadPath: '/locales/{{lng}}/{{ns}}.json' },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
