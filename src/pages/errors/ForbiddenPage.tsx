import { useTranslation } from 'react-i18next';
import { SEOHead } from '@/components/seo/SEOHead';
import { StatusPage } from '@/components/errors/StatusPage';
import { StandaloneErrorLayout } from '@/components/errors/StandaloneErrorLayout';

type ForbiddenPageProps = {
  standalone?: boolean;
  compact?: boolean;
};

export function ForbiddenPage({ standalone = false, compact = false }: ForbiddenPageProps) {
  const { t } = useTranslation();

  const content = (
    <>
      <SEOHead title={t('forbidden.seoTitle')} noindex />
      <StatusPage variant="403" compact={compact} />
    </>
  );

  if (standalone) {
    return <StandaloneErrorLayout>{content}</StandaloneErrorLayout>;
  }

  return content;
}
