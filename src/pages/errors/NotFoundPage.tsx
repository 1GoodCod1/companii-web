import { useTranslation } from 'react-i18next';
import { SEOHead } from '@/shared/ui/seo/SEOHead';
import { StatusPage } from '@/shared/ui/errors/StatusPage';
import { StandaloneErrorLayout } from '@/shared/ui/errors/StandaloneErrorLayout';

type NotFoundPageProps = {
  standalone?: boolean;
  compact?: boolean;
};

export function NotFoundPage({ standalone = false, compact = false }: NotFoundPageProps) {
  const { t } = useTranslation();

  const content = (
    <>
      <SEOHead title={t('notFound.seoTitle')} noindex />
      <StatusPage variant="404" compact={compact} />
    </>
  );

  if (standalone) {
    return <StandaloneErrorLayout>{content}</StandaloneErrorLayout>;
  }

  return content;
}
