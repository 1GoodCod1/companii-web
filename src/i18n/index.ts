import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { companiiRo } from './companii.ro';

void i18n.use(initReactI18next).init({
  resources: { ro: { translation: companiiRo } },
  lng: 'ro',
  fallbackLng: 'ro',
  interpolation: { escapeValue: false },
});

export default i18n;
