import { useTranslation } from 'react-i18next';
import type { FaqSection } from '@/entities/company/model/faqContent';
import { FAQ_SECTIONS_RO } from '@/shared/config/i18n/translations/faq.ro';
import { FAQ_SECTIONS_RU } from '@/shared/config/i18n/translations/faq.ru';

export function useFaqSections(): FaqSection[] {
  const { i18n } = useTranslation();
  return i18n.language === 'ru' ? FAQ_SECTIONS_RU : FAQ_SECTIONS_RO;
}
