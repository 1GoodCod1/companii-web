import { useTranslation } from 'react-i18next';
import { SEOHead } from '@/components/seo/SEOHead';
import { StatusPage } from '@/components/errors/StatusPage';
import { StandaloneErrorLayout } from '@/components/errors/StandaloneErrorLayout';

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
