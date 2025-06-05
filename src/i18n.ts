
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'es'],
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
          "Break duration:": "Break duration:",
          "Choose Your Plan": "Choose Your Plan",
          "Billing": "Billing",
          "Upgrade to Pro": "Upgrade to Pro"
        }
      },
      es: {
        common: {
          "Dashboard": "Tablero",
          "Start Shift": "Iniciar turno",
          "Shift Started": "Turno iniciado",
          "End Shift": "Finalizar turno",
          "Time Tracking": "Seguimiento",
          "End Break": "Terminar descanso",
          "Start": "Iniciar",
          "min Break": "min descanso",
          "Sign Out": "Cerrar sesión",
          "Welcome": "Bienvenido",
          "Clocked in at:": "Registrado a las:",
          "Manager:": "Gerente:",
          "On break:": "En descanso:",
          "remaining": "restante",
          "Clocked out at:": "Registrado a las:",
          "Approved by:": "Aprobado por:",
          "Break duration:": "Duración del descanso:",
          "Choose Your Plan": "Elige tu Plan",
          "Billing": "Facturación",
          "Upgrade to Pro": "Actualizar a Pro"
        }
      }
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
