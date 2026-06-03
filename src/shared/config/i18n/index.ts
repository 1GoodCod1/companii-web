import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import {
  type AppLanguage,
  STORAGE_KEY,
  getInitialLanguage,
  persistLanguage,
} from './utils';

export type { AppLanguage };
export { STORAGE_KEY, getInitialLanguage };

type TranslationBundle = Record<string, unknown>;

const loaded = new Set<AppLanguage>();

/**
 * Dynamically import a single locale's translation bundle. Each locale becomes
 * its own async chunk (split out of the main app bundle), and only the active
 * language is fetched on startup instead of shipping ro+ru to every visitor.
 */
async function loadBundle(lang: AppLanguage): Promise<TranslationBundle> {
  if (lang === 'ru') {
    const [{ companiiRu }, { citiesCategories }, { publicRu }, { statusRu }] =
      await Promise.all([
        import('./companii.ru'),
        import('./translations/citiesCategories'),
        import('./translations/public.ru'),
        import('./translations/status.ru'),
      ]);
    return { ...companiiRu, ...citiesCategories.ru, ...publicRu, ...statusRu };
  }
  const [{ companiiRo }, { citiesCategories }, { publicRo }, { statusRo }] =
    await Promise.all([
      import('./companii.ro'),
      import('./translations/citiesCategories'),
      import('./translations/public.ro'),
      import('./translations/status.ro'),
    ]);
  return { ...companiiRo, ...citiesCategories.ro, ...publicRo, ...statusRo };
}

/** Load a locale's resources into i18next once (no-op if already loaded). */
export async function ensureLanguageLoaded(lang: AppLanguage): Promise<void> {
  if (loaded.has(lang)) return;
  const bundle = await loadBundle(lang);
  i18n.addResourceBundle(lang, 'translation', bundle, true, true);
  loaded.add(lang);
}

/**
 * Initialise i18next with the active locale loaded before first render (call
 * this and await it in the entrypoint). The fallback locale is preloaded in the
 * background so missing keys still resolve.
 */
export async function initI18n(): Promise<void> {
  const lng = getInitialLanguage();
  await i18n.use(initReactI18next).init({
    resources: {},
    lng,
    fallbackLng: 'ro',
    interpolation: { escapeValue: false },
  });
  await ensureLanguageLoaded(lng);
  if (lng !== 'ro') void ensureLanguageLoaded('ro');
}

export async function setLanguage(lang: AppLanguage): Promise<void> {
  if (!['ru', 'ro'].includes(lang)) return;
  await ensureLanguageLoaded(lang);
  await i18n.changeLanguage(lang);
  persistLanguage(lang);
}

export default i18n;
