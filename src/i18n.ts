
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en'],
    ns: ['common'],
    defaultNS: 'common',
    resources: {
      en: {
        common: {
          "Dashboard": "Dashboard",
          "Start Shift": "Start Shift",
          "Shift Started": "Shift Started",
          "End Shift": "End Shift",
          "Time Tracking": "Time Tracking",
          "End Break": "End Break",
          "Start": "Start",
          "min Break": "min Break",
          "Sign Out": "Sign Out",
          "Welcome": "Welcome",
          "Clocked in at:": "Clocked in at:",
          "Manager:": "Manager:",
          "On break:": "On break:",
          "remaining": "remaining",
          "Clocked out at:": "Clocked out at:",
          "Approved by:": "Approved by:",
          "Break duration:": "Break duration:"
        }
      }
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
