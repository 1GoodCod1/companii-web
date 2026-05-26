import { useTranslation } from 'react-i18next';
import { SEOHead } from '@/components/seo/SEOHead';
import { LegalDocumentLayout, type LegalTocItem } from '@/components/legal/LegalDocumentLayout';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';
import { useLegalLocale } from '@/hooks/useLegalLocale';
import { renderTermsContent } from '@/i18n/content/legalTerms';

export function TermsPage() {
  const { t } = useTranslation();
  const lp = useLocalizedPath();
  const locale = useLegalLocale();
  const toc = t('legal.terms.toc', { returnObjects: true }) as LegalTocItem[];

  return (
    <>
      <SEOHead
        title={t('legal.terms.seoTitle')}
        description={t('legal.terms.seoDescription')}
        hreflang
      />
      <LegalDocumentLayout
        badge={t('legal.terms.badge')}
        title={t('legal.terms.title')}
        updatedAt={t('legal.terms.updatedAt')}
        updatedAtPrefix={t('legal.layout.updatedAtPrefix')}
        intro={t('legal.terms.intro')}
        toc={toc}
        tocTitle={t('legal.layout.tocTitle')}
        tocAriaLabel={t('legal.layout.tocAriaLabel')}
        relatedLink={{
          href: lp('/privacy'),
          label: t('legal.terms.relatedPrivacyLabel'),
        }}
      >
        {renderTermsContent(locale, lp('/privacy'))}
      </LegalDocumentLayout>
    </>
  );
}
