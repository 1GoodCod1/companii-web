import { useTranslation } from 'react-i18next';
import { SEOHead } from '@/shared/ui/seo/SEOHead';
import { LegalDocumentLayout, type LegalTocItem } from '@/shared/ui/legal/LegalDocumentLayout';
import { useLocalizedPath } from '@/shared/hooks/useLocalizedPath';
import { useLocale } from '@/shared/hooks/useLocale';
import { renderPrivacyContent } from '@/shared/config/i18n/content/legalPrivacy';

export function PrivacyPage() {
  const { t } = useTranslation();
  const lp = useLocalizedPath();
  const locale = useLocale();
  const toc = t('legal.privacy.toc', { returnObjects: true }) as LegalTocItem[];

  return (
    <>
      <SEOHead
        title={t('legal.privacy.seoTitle')}
        description={t('legal.privacy.seoDescription')}
        hreflang
      />
      <LegalDocumentLayout
        badge={t('legal.privacy.badge')}
        title={t('legal.privacy.title')}
        updatedAt={t('legal.privacy.updatedAt')}
        updatedAtPrefix={t('legal.layout.updatedAtPrefix')}
        intro={t('legal.privacy.intro')}
        toc={toc}
        tocTitle={t('legal.layout.tocTitle')}
        tocAriaLabel={t('legal.layout.tocAriaLabel')}
        relatedLink={{
          href: lp('/terms'),
          label: t('legal.privacy.relatedTermsLabel'),
        }}
      >
        {renderPrivacyContent(locale, lp('/terms'))}
      </LegalDocumentLayout>
    </>
  );
}
