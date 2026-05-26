import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { companiiRo } from './companii.ro';
import { companiiRu } from './companii.ru';
import { citiesCategories } from './translations/citiesCategories';
import { publicRo } from './translations/public.ro';
import { publicRu } from './translations/public.ru';
import { statusRo } from './translations/status.ro';
import { statusRu } from './translations/status.ru';
import {
  type AppLanguage,
  STORAGE_KEY,
  getInitialLanguage,
  persistLanguage,
} from './utils';

export type { AppLanguage };
export { STORAGE_KEY, getInitialLanguage };

export function setLanguage(lang: AppLanguage) {
  if (!['ru', 'ro'].includes(lang)) return;
  i18n.changeLanguage(lang);
  persistLanguage(lang);
}

void i18n.use(initReactI18next).init({
  resources: {
    ro: { translation: { ...companiiRo, ...citiesCategories.ro, ...publicRo, ...statusRo } },
    ru: { translation: { ...companiiRu, ...citiesCategories.ru, ...publicRu, ...statusRu } },
  },
  lng: getInitialLanguage(),
  fallbackLng: 'ro',
  interpolation: { escapeValue: false },
});

export default i18n;
