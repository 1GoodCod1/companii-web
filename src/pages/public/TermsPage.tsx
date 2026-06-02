import { useTranslation } from 'react-i18next';
import { SEOHead } from '@/shared/ui/seo/SEOHead';
import { LegalDocumentLayout, type LegalTocItem } from '@/shared/ui/legal/LegalDocumentLayout';
import { useLocalizedPath } from '@/shared/hooks/useLocalizedPath';
import { useLocale } from '@/shared/hooks/useLocale';
import { TermsContent } from '@/shared/config/i18n/content/legalTerms';

export function TermsPage() {
  const { t } = useTranslation();
  const lp = useLocalizedPath();
  const locale = useLocale();
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
        <TermsContent locale={locale} privacyPath={lp('/privacy')} />
      </LegalDocumentLayout>
    </>
  );
}
