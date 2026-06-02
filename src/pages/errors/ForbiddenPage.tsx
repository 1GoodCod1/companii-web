import { useTranslation } from 'react-i18next';
import { SEOHead } from '@/shared/ui/seo/SEOHead';
import { StatusPage } from '@/shared/ui/errors/StatusPage';
import { StandaloneErrorLayout } from '@/shared/ui/errors/StandaloneErrorLayout';

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
