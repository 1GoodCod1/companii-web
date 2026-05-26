import { useTranslation } from 'react-i18next';
import { SEOHead } from '@/components/seo/SEOHead';
import { LegalDocumentLayout, type LegalTocItem } from '@/components/legal/LegalDocumentLayout';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';
import { useLegalLocale } from '@/hooks/useLegalLocale';
import { renderPrivacyContent } from '@/i18n/content/legalPrivacy';

export function PrivacyPage() {
  const { t } = useTranslation();
  const lp = useLocalizedPath();
  const locale = useLegalLocale();
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
