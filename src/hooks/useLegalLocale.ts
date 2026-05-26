import { useLocale } from '@/hooks/useLocale';
import type { AppLanguage } from '@/i18n/utils';

export function useLegalLocale(): AppLanguage {
  return useLocale();
}
